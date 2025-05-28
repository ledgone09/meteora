const express = require('express');
const { PublicKey } = require('@solana/web3.js');
const Joi = require('joi');
const multer = require('multer');
const router = express.Router();

// Import services
const SolanaTokenService = require('../services/solana/tokenService');
const MeteoraService = require('../services/meteora/dlmmService');
const IPFSService = require('../services/ipfs/ipfsService');

// Import database models
const { TokenLaunch, MeteoraPool, PoolStatistics } = require('../models/database');

const config = require('../config');

// Initialize services
const tokenService = new SolanaTokenService();
const meteoraService = new MeteoraService();
const ipfsService = new IPFSService();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.upload.maxFileSize
  },
  fileFilter: (req, file, cb) => {
    if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Validation schemas
const createTokenSchema = Joi.object({
  name: Joi.string().min(1).max(32).required(),
  symbol: Joi.string().min(1).max(10).uppercase().required(),
  creatorWallet: Joi.string().length(44).required(),
  launchType: Joi.string().valid('basic', 'premium').default('basic'),
  initialPrice: Joi.number().min(0.00001).max(1).default(config.tokenDefaults.initialPrice)
});

/**
 * POST /api/tokens/create
 * Create a new token with Meteora liquidity pool
 */
router.post('/create', upload.single('logo'), async (req, res) => {
  try {
    console.log('🚀 Token creation request received');

    // Validate request data
    const { error, value } = createTokenSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
    }

    const { name, symbol, creatorWallet, launchType, initialPrice } = value;

    // Validate wallet address
    if (!tokenService.isValidWalletAddress(creatorWallet)) {
      return res.status(400).json({
        error: 'Invalid wallet address'
      });
    }

    // Validate logo upload
    if (!req.file) {
      return res.status(400).json({
        error: 'Logo file is required'
      });
    }

    // Validate image
    try {
      ipfsService.validateImage(req.file.buffer, req.file.mimetype);
    } catch (validationError) {
      return res.status(400).json({
        error: 'Invalid logo file',
        message: validationError.message
      });
    }

    // Check if token symbol already exists
    const existingToken = await TokenLaunch.findByMint(symbol);
    if (existingToken) {
      return res.status(409).json({
        error: 'Token symbol already exists'
      });
    }

    console.log('📋 Creating token:', { name, symbol, launchType });

    // Step 1: Upload logo and metadata to IPFS
    const metadataResult = await ipfsService.uploadTokenMetadata(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      {
        name,
        symbol,
        supply: config.tokenDefaults.supply,
        decimals: config.tokenDefaults.decimals,
        launchType,
        creatorWallet
      }
    );

    console.log('✅ Metadata uploaded to IPFS');

    // Step 2: Create SPL token
    const tokenResult = await tokenService.createToken({
      name,
      symbol,
      metadataUri: metadataResult.metadataUri,
      creatorWallet: new PublicKey(creatorWallet),
      supply: config.tokenDefaults.supply,
      decimals: config.tokenDefaults.decimals
    });

    console.log('✅ SPL token created:', tokenResult.mintAddress);

    // Step 3: Create Meteora DLMM pool
    const poolResult = await meteoraService.createLaunchPool({
      tokenMint: tokenResult.mintAddress,
      launchType,
      initialPrice,
      liquidityAmount: tokenResult.liquidityAmount
    });

    console.log('✅ Meteora pool created:', poolResult.poolAddress);

    // Step 4: Save to database
    const tokenLaunch = await TokenLaunch.create({
      mintAddress: tokenResult.mintAddress,
      name,
      symbol,
      logoUrl: metadataResult.logoUpload.ipfsUrl,
      metadataUri: metadataResult.metadataUri,
      creatorWallet,
      totalSupply: tokenResult.totalSupply,
      decimals: config.tokenDefaults.decimals,
      launchType,
      feePaid: config.fees[`${launchType}Launch`],
      transactionSignature: tokenResult.mintSignature
    });

    const meteoraPool = await MeteoraPool.create({
      poolAddress: poolResult.poolAddress,
      tokenMint: tokenResult.mintAddress,
      quoteMint: poolResult.quoteMint,
      binStep: poolResult.binStep,
      baseFee: poolResult.baseFee,
      initialPrice: poolResult.initialPrice,
      activationTime: poolResult.activationTime,
      alphaVaultEnabled: poolResult.alphaVaultEnabled,
      transactionSignature: poolResult.transactionSignature
    });

    // Initialize pool statistics
    await PoolStatistics.upsert({
      poolAddress: poolResult.poolAddress,
      currentPrice: initialPrice,
      holdersCount: 1
    });

    console.log('✅ Token launch completed successfully');

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Token and liquidity pool created successfully',
      data: {
        token: {
          mintAddress: tokenResult.mintAddress,
          name,
          symbol,
          logoUrl: metadataResult.logoUpload.ipfsUrl,
          metadataUri: metadataResult.metadataUri,
          totalSupply: tokenResult.totalSupply,
          decimals: config.tokenDefaults.decimals,
          creatorAmount: tokenResult.creatorAmount,
          transactionSignature: tokenResult.mintSignature
        },
        pool: {
          poolAddress: poolResult.poolAddress,
          quoteMint: poolResult.quoteMint,
          initialPrice: poolResult.initialPrice,
          binStep: poolResult.binStep,
          baseFee: poolResult.baseFee,
          alphaVaultEnabled: poolResult.alphaVaultEnabled,
          activationTime: poolResult.activationTime,
          transactionSignature: poolResult.transactionSignature
        },
        trading: {
          jupiterUrl: `https://jup.ag/swap/${config.meteora.quoteMint}-${tokenResult.mintAddress}`,
          birdeyeUrl: `https://birdeye.so/token/${tokenResult.mintAddress}`,
          solscanUrl: `https://solscan.io/token/${tokenResult.mintAddress}`
        },
        fees: {
          paid: config.fees[`${launchType}Launch`],
          type: launchType
        }
      }
    });

  } catch (error) {
    console.error('❌ Token creation failed:', error);
    res.status(500).json({
      error: 'Token creation failed',
      message: error.message
    });
  }
});

/**
 * GET /api/tokens/recent
 * Get recently created tokens
 */
router.get('/recent', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const tokens = await TokenLaunch.findRecent(limit);

    res.json({
      success: true,
      data: tokens.map(token => ({
        mintAddress: token.mint_address,
        name: token.name,
        symbol: token.symbol,
        logoUrl: token.logo_url,
        creatorWallet: token.creator_wallet,
        launchType: token.launch_type,
        createdAt: token.created_at,
        poolAddress: token.pool_address,
        currentPrice: parseFloat(token.current_price) || 0,
        volume24h: parseFloat(token.volume_24h) || 0,
        holdersCount: token.holders_count || 1,
        trading: {
          jupiterUrl: `https://jup.ag/swap/${config.meteora.quoteMint}-${token.mint_address}`,
          birdeyeUrl: `https://birdeye.so/token/${token.mint_address}`
        }
      }))
    });

  } catch (error) {
    console.error('❌ Failed to fetch recent tokens:', error);
    res.status(500).json({
      error: 'Failed to fetch recent tokens',
      message: error.message
    });
  }
});

/**
 * GET /api/tokens/:mintAddress
 * Get token details by mint address
 */
router.get('/:mintAddress', async (req, res) => {
  try {
    const { mintAddress } = req.params;

    // Validate mint address
    if (!tokenService.isValidWalletAddress(mintAddress)) {
      return res.status(400).json({
        error: 'Invalid mint address'
      });
    }

    const token = await TokenLaunch.findByMint(mintAddress);
    if (!token) {
      return res.status(404).json({
        error: 'Token not found'
      });
    }

    // Get pool information
    const pool = await MeteoraPool.findByTokenMint(mintAddress);
    const poolStats = pool ? await PoolStatistics.findByPoolAddress(pool.pool_address) : null;

    res.json({
      success: true,
      data: {
        token: {
          mintAddress: token.mint_address,
          name: token.name,
          symbol: token.symbol,
          logoUrl: token.logo_url,
          metadataUri: token.metadata_uri,
          creatorWallet: token.creator_wallet,
          totalSupply: token.total_supply,
          decimals: token.decimals,
          launchType: token.launch_type,
          feePaid: parseFloat(token.fee_paid),
          createdAt: token.created_at,
          transactionSignature: token.transaction_signature
        },
        pool: pool ? {
          poolAddress: pool.pool_address,
          quoteMint: pool.quote_mint,
          binStep: pool.bin_step,
          baseFee: pool.base_fee,
          initialPrice: parseFloat(pool.initial_price),
          activationTime: pool.activation_time,
          alphaVaultEnabled: pool.alpha_vault_enabled,
          createdAt: pool.created_at
        } : null,
        statistics: poolStats ? {
          currentPrice: parseFloat(poolStats.current_price) || 0,
          volume24h: parseFloat(poolStats.volume_24h) || 0,
          volume7d: parseFloat(poolStats.volume_7d) || 0,
          volumeTotal: parseFloat(poolStats.volume_total) || 0,
          trades24h: poolStats.trades_24h || 0,
          tradesTotal: poolStats.trades_total || 0,
          holdersCount: poolStats.holders_count || 1,
          priceChange24h: parseFloat(poolStats.price_change_24h) || 0,
          marketCap: parseFloat(poolStats.market_cap) || 0,
          liquidityUsd: parseFloat(poolStats.liquidity_usd) || 0,
          lastUpdated: poolStats.last_updated
        } : null,
        trading: {
          jupiterUrl: `https://jup.ag/swap/${config.meteora.quoteMint}-${mintAddress}`,
          birdeyeUrl: `https://birdeye.so/token/${mintAddress}`,
          solscanUrl: `https://solscan.io/token/${mintAddress}`
        }
      }
    });

  } catch (error) {
    console.error('❌ Failed to fetch token details:', error);
    res.status(500).json({
      error: 'Failed to fetch token details',
      message: error.message
    });
  }
});

/**
 * GET /api/tokens/creator/:walletAddress
 * Get tokens created by a specific wallet
 */
router.get('/creator/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    // Validate wallet address
    if (!tokenService.isValidWalletAddress(walletAddress)) {
      return res.status(400).json({
        error: 'Invalid wallet address'
      });
    }

    const tokens = await TokenLaunch.findByCreator(walletAddress, limit);

    res.json({
      success: true,
      data: tokens.map(token => ({
        mintAddress: token.mint_address,
        name: token.name,
        symbol: token.symbol,
        logoUrl: token.logo_url,
        launchType: token.launch_type,
        feePaid: parseFloat(token.fee_paid),
        createdAt: token.created_at,
        transactionSignature: token.transaction_signature
      }))
    });

  } catch (error) {
    console.error('❌ Failed to fetch creator tokens:', error);
    res.status(500).json({
      error: 'Failed to fetch creator tokens',
      message: error.message
    });
  }
});

/**
 * GET /api/tokens/validate/:symbol
 * Check if token symbol is available
 */
router.get('/validate/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol || symbol.length > 10) {
      return res.status(400).json({
        error: 'Invalid symbol'
      });
    }

    const existingToken = await TokenLaunch.findByMint(symbol.toUpperCase());
    
    res.json({
      success: true,
      available: !existingToken,
      symbol: symbol.toUpperCase()
    });

  } catch (error) {
    console.error('❌ Symbol validation failed:', error);
    res.status(500).json({
      error: 'Symbol validation failed',
      message: error.message
    });
  }
});

module.exports = router; 