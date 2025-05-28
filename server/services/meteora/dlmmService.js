const { Connection, PublicKey, Keypair, Transaction } = require('@solana/web3.js');
const { getOrCreateAssociatedTokenAccount } = require('@solana/spl-token');
const DLMM = require('@meteora-ag/dlmm');
const BN = require('bn.js');
const config = require('../../config');

class MeteoraService {
  constructor() {
    this.connection = new Connection(config.solana.rpcUrl, config.solana.commitment);
    this.platformWallet = this.loadPlatformWallet();
    this.quoteMint = new PublicKey(config.meteora.quoteMint); // SOL mint
  }

  loadPlatformWallet() {
    // Load the same platform wallet as token service
    if (process.env.PLATFORM_PRIVATE_KEY) {
      const privateKeyArray = JSON.parse(process.env.PLATFORM_PRIVATE_KEY);
      return Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
    } else {
      console.warn('⚠️  No PLATFORM_PRIVATE_KEY found, generating temporary keypair');
      return Keypair.generate();
    }
  }

  /**
   * Create a Meteora DLMM Launch Pool
   * @param {Object} poolData - Pool creation parameters
   * @param {string} poolData.tokenMint - Token mint address
   * @param {string} poolData.launchType - 'basic' or 'premium'
   * @param {number} poolData.initialPrice - Initial token price in SOL
   * @param {number} poolData.liquidityAmount - Amount of tokens for liquidity
   * @returns {Object} Pool creation result
   */
  async createLaunchPool(poolData) {
    try {
      console.log('🌊 Creating Meteora DLMM pool for:', poolData.tokenMint);

      const tokenMint = new PublicKey(poolData.tokenMint);
      const template = config.poolTemplates[poolData.launchType];

      // Calculate initial price in the correct format
      const pricePerLamport = poolData.initialPrice / Math.pow(10, 9); // Convert to lamports
      const initialPrice = new BN(pricePerLamport * Math.pow(10, 18)); // 18 decimal precision

      // Create DLMM pool configuration
      const poolConfig = {
        baseMint: tokenMint,
        quoteMint: this.quoteMint,
        binStep: template.binStep,
        baseFee: template.baseFee,
        activationPoint: template.activationDelay > 0 ? 
          Date.now() + (template.activationDelay * 1000) : null,
        alphaVault: template.alphaVault
      };

      console.log('📋 Pool configuration:', poolConfig);

      // Initialize DLMM pool using Meteora SDK
      const dlmmPool = await this.initializeDLMMPool(poolConfig, initialPrice);
      
      console.log('✅ DLMM pool created:', dlmmPool.poolAddress);

      // Add initial liquidity
      const liquidityResult = await this.addInitialLiquidity(
        dlmmPool.poolAddress,
        tokenMint,
        poolData.liquidityAmount,
        initialPrice
      );

      console.log('💧 Initial liquidity added:', liquidityResult.signature);

      // Setup Alpha Vault if premium
      let alphaVaultAddress = null;
      if (template.alphaVault) {
        alphaVaultAddress = await this.setupAlphaVault(
          dlmmPool.poolAddress,
          tokenMint
        );
        console.log('🛡️  Alpha Vault setup:', alphaVaultAddress);
      }

      return {
        poolAddress: dlmmPool.poolAddress,
        tokenMint: tokenMint.toString(),
        quoteMint: this.quoteMint.toString(),
        binStep: template.binStep,
        baseFee: template.baseFee,
        initialPrice: poolData.initialPrice,
        liquidityAmount: poolData.liquidityAmount,
        alphaVaultEnabled: template.alphaVault,
        alphaVaultAddress,
        activationTime: poolConfig.activationPoint ? 
          new Date(poolConfig.activationPoint) : new Date(),
        transactionSignature: dlmmPool.signature,
        liquiditySignature: liquidityResult.signature
      };

    } catch (error) {
      console.error('❌ Meteora pool creation failed:', error);
      throw new Error(`Pool creation failed: ${error.message}`);
    }
  }

  /**
   * Initialize DLMM pool using Meteora SDK
   * @param {Object} config - Pool configuration
   * @param {BN} initialPrice - Initial price
   * @returns {Object} Pool creation result
   */
  async initializeDLMMPool(config, initialPrice) {
    try {
      // Create DLMM instance
      const dlmm = await DLMM.create(this.connection, config.baseMint, config.quoteMint, {
        binStep: config.binStep,
        baseFee: config.baseFee
      });

      // Initialize the pool
      const initializePoolTx = await dlmm.initializePool({
        activeId: this.priceToActiveId(initialPrice, config.binStep),
        baseMint: config.baseMint,
        quoteMint: config.quoteMint,
        binStep: config.binStep,
        baseFee: config.baseFee,
        payer: this.platformWallet.publicKey
      });

      // Sign and send transaction
      const signature = await this.connection.sendTransaction(
        initializePoolTx,
        [this.platformWallet],
        { commitment: config.solana.commitment }
      );

      await this.connection.confirmTransaction(signature, config.solana.commitment);

      return {
        poolAddress: dlmm.pubkey.toString(),
        signature
      };

    } catch (error) {
      console.error('❌ DLMM pool initialization failed:', error);
      throw error;
    }
  }

  /**
   * Add initial liquidity to the pool
   * @param {string} poolAddress - Pool address
   * @param {PublicKey} tokenMint - Token mint
   * @param {number} tokenAmount - Amount of tokens to add
   * @param {BN} price - Current price
   * @returns {Object} Liquidity addition result
   */
  async addInitialLiquidity(poolAddress, tokenMint, tokenAmount, price) {
    try {
      // Get platform token account
      const platformTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.platformWallet,
        tokenMint,
        this.platformWallet.publicKey
      );

      // Create DLMM instance for the pool
      const dlmm = await DLMM.create(this.connection, tokenMint, this.quoteMint);

      // Calculate bin range for liquidity distribution
      const activeId = this.priceToActiveId(price, dlmm.binStep);
      const lowerBinId = activeId - 10; // 10 bins below
      const upperBinId = activeId + 10; // 10 bins above

      // Create liquidity distribution
      const liquidityDistribution = this.createLiquidityDistribution(
        lowerBinId,
        upperBinId,
        activeId,
        tokenAmount
      );

      // Add liquidity transaction
      const addLiquidityTx = await dlmm.addLiquidity({
        liquidityDistribution,
        user: this.platformWallet.publicKey,
        userTokenX: platformTokenAccount.address,
        userTokenY: this.platformWallet.publicKey // SOL account
      });

      // Sign and send transaction
      const signature = await this.connection.sendTransaction(
        addLiquidityTx,
        [this.platformWallet],
        { commitment: config.solana.commitment }
      );

      await this.connection.confirmTransaction(signature, config.solana.commitment);

      return {
        signature,
        liquidityDistribution,
        activeId
      };

    } catch (error) {
      console.error('❌ Adding liquidity failed:', error);
      throw error;
    }
  }

  /**
   * Setup Alpha Vault for anti-sniper protection
   * @param {string} poolAddress - Pool address
   * @param {PublicKey} tokenMint - Token mint
   * @returns {string} Alpha Vault address
   */
  async setupAlphaVault(poolAddress, tokenMint) {
    try {
      // Alpha Vault setup would go here
      // This is a placeholder as the actual implementation depends on Meteora's Alpha Vault SDK
      console.log('🛡️  Setting up Alpha Vault for pool:', poolAddress);
      
      // For now, return a placeholder address
      // In production, this would create an actual Alpha Vault
      return 'AlphaVaultAddressPlaceholder';

    } catch (error) {
      console.error('❌ Alpha Vault setup failed:', error);
      throw error;
    }
  }

  /**
   * Convert price to active bin ID
   * @param {BN} price - Price in lamports
   * @param {number} binStep - Bin step
   * @returns {number} Active bin ID
   */
  priceToActiveId(price, binStep) {
    // This is a simplified calculation
    // In production, use Meteora's actual price-to-bin conversion
    const priceNumber = price.toNumber();
    const logPrice = Math.log(priceNumber) / Math.log(1 + binStep / 10000);
    return Math.round(logPrice);
  }

  /**
   * Create liquidity distribution curve
   * @param {number} lowerBinId - Lower bin ID
   * @param {number} upperBinId - Upper bin ID
   * @param {number} activeId - Active bin ID
   * @param {number} totalAmount - Total token amount
   * @returns {Array} Liquidity distribution
   */
  createLiquidityDistribution(lowerBinId, upperBinId, activeId, totalAmount) {
    const distribution = [];
    const binCount = upperBinId - lowerBinId + 1;
    
    // Create a curve distribution with more liquidity around the active price
    for (let binId = lowerBinId; binId <= upperBinId; binId++) {
      const distance = Math.abs(binId - activeId);
      const weight = Math.exp(-distance * 0.1); // Exponential decay
      const amount = Math.floor((totalAmount * weight) / binCount);
      
      if (amount > 0) {
        distribution.push({
          binId,
          xAmount: binId <= activeId ? amount : 0, // Tokens below/at active price
          yAmount: binId >= activeId ? amount : 0  // SOL above/at active price
        });
      }
    }

    return distribution;
  }

  /**
   * Get pool information
   * @param {string} poolAddress - Pool address
   * @returns {Object} Pool information
   */
  async getPoolInfo(poolAddress) {
    try {
      const dlmm = await DLMM.create(this.connection, new PublicKey(poolAddress));
      const poolState = await dlmm.getPoolState();
      
      return {
        poolAddress,
        baseMint: poolState.baseMint.toString(),
        quoteMint: poolState.quoteMint.toString(),
        binStep: poolState.binStep,
        baseFee: poolState.baseFee,
        activeId: poolState.activeId,
        totalLiquidity: poolState.totalLiquidity?.toString() || '0',
        volume24h: 0, // Would need to fetch from API
        trades24h: 0   // Would need to fetch from API
      };

    } catch (error) {
      console.error('❌ Failed to get pool info:', error);
      throw error;
    }
  }

  /**
   * Get pool statistics from Meteora API
   * @param {string} poolAddress - Pool address
   * @returns {Object} Pool statistics
   */
  async getPoolStatistics(poolAddress) {
    try {
      // This would fetch from Meteora's API
      // For now, return mock data
      return {
        poolAddress,
        volume24h: 0,
        volume7d: 0,
        volumeTotal: 0,
        trades24h: 0,
        tradesTotal: 0,
        currentPrice: 0,
        priceChange24h: 0,
        liquidityUsd: 0,
        holdersCount: 1 // At least the creator
      };

    } catch (error) {
      console.error('❌ Failed to get pool statistics:', error);
      return null;
    }
  }
}

module.exports = MeteoraService; 