const express = require('express');
const router = express.Router();

// Import services
const MeteoraService = require('../services/meteora/dlmmService');

// Import database models (with fallback)
let MeteoraPool, PoolStatistics, TokenLaunch;
try {
  const db = require('../models/database');
  MeteoraPool = db.MeteoraPool;
  PoolStatistics = db.PoolStatistics;
  TokenLaunch = db.TokenLaunch;
  console.log('✅ Pool database models loaded');
} catch (error) {
  console.warn('⚠️  Database not available for pools, using mock data');
  // Create mock database operations
  MeteoraPool = {
    findByAddress: async () => null
  };
  PoolStatistics = {
    findByPoolAddress: async () => null
  };
  TokenLaunch = {
    findByMint: async () => null
  };
}

const config = require('../config');

// Initialize services
const meteoraService = new MeteoraService(config.meteora);

/**
 * GET /api/pools/:poolAddress
 * Get pool statistics and information
 */
router.get('/:poolAddress', async (req, res) => {
  try {
    const { poolAddress } = req.params;

    // Validate pool address format
    if (!poolAddress || poolAddress.length !== 44) {
      return res.status(400).json({
        error: 'Invalid pool address'
      });
    }

    // Get pool from database
    const pool = await MeteoraPool.findByAddress(poolAddress);
    if (!pool) {
      return res.status(404).json({
        error: 'Pool not found'
      });
    }

    // Get pool statistics
    const stats = await PoolStatistics.findByPoolAddress(poolAddress);

    // Get live pool info from Meteora
    let livePoolInfo = null;
    try {
      livePoolInfo = await meteoraService.getPoolInfo(poolAddress);
    } catch (error) {
      console.warn('⚠️  Could not fetch live pool info:', error.message);
    }

    res.json({
      success: true,
      data: {
        pool: {
          poolAddress: pool.pool_address,
          tokenMint: pool.token_mint,
          quoteMint: pool.quote_mint,
          tokenName: pool.name,
          tokenSymbol: pool.symbol,
          tokenLogo: pool.logo_url,
          binStep: pool.bin_step,
          baseFee: pool.base_fee,
          initialPrice: parseFloat(pool.initial_price),
          activationTime: pool.activation_time,
          alphaVaultEnabled: pool.alpha_vault_enabled,
          liquidityLocked: pool.liquidity_locked,
          lockReleasePoint: pool.lock_release_point,
          poolState: pool.pool_state,
          createdAt: pool.created_at
        },
        statistics: stats ? {
          currentPrice: parseFloat(stats.current_price) || 0,
          volume24h: parseFloat(stats.volume_24h) || 0,
          volume7d: parseFloat(stats.volume_7d) || 0,
          volumeTotal: parseFloat(stats.volume_total) || 0,
          trades24h: stats.trades_24h || 0,
          tradesTotal: stats.trades_total || 0,
          holdersCount: stats.holders_count || 1,
          priceChange24h: parseFloat(stats.price_change_24h) || 0,
          marketCap: parseFloat(stats.market_cap) || 0,
          liquidityUsd: parseFloat(stats.liquidity_usd) || 0,
          lastUpdated: stats.last_updated
        } : {
          currentPrice: parseFloat(pool.initial_price),
          volume24h: 0,
          volume7d: 0,
          volumeTotal: 0,
          trades24h: 0,
          tradesTotal: 0,
          holdersCount: 1,
          priceChange24h: 0,
          marketCap: 0,
          liquidityUsd: 0,
          lastUpdated: new Date()
        },
        liveData: livePoolInfo,
        trading: {
          jupiterUrl: `https://jup.ag/swap/${pool.quote_mint}-${pool.token_mint}`,
          birdeyeUrl: `https://birdeye.so/token/${pool.token_mint}`,
          solscanUrl: `https://solscan.io/token/${pool.token_mint}`,
          meteoraUrl: `https://app.meteora.ag/pools/${poolAddress}`
        }
      }
    });

  } catch (error) {
    console.error('❌ Failed to fetch pool data:', error);
    res.status(500).json({
      error: 'Failed to fetch pool data',
      message: error.message
    });
  }
});

/**
 * GET /api/pools
 * Get all pools with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const sortBy = req.query.sortBy || 'created_at';
    const order = req.query.order === 'asc' ? 'ASC' : 'DESC';

    // Valid sort columns
    const validSortColumns = [
      'created_at', 'initial_price', 'bin_step', 'base_fee'
    ];

    if (!validSortColumns.includes(sortBy)) {
      return res.status(400).json({
        error: 'Invalid sort column'
      });
    }

    // Get pools with token information
    const query = `
      SELECT 
        mp.*,
        tl.name,
        tl.symbol,
        tl.logo_url,
        ps.current_price,
        ps.volume_24h,
        ps.holders_count,
        ps.trades_24h
      FROM meteora_pools mp
      JOIN token_launches tl ON mp.token_mint = tl.mint_address
      LEFT JOIN pool_statistics ps ON mp.pool_address = ps.pool_address
      ORDER BY mp.${sortBy} ${order}
      LIMIT $1
    `;

    const { pool } = require('../models/database');
    const result = await pool.query(query, [limit]);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        poolAddress: row.pool_address,
        tokenMint: row.token_mint,
        quoteMint: row.quote_mint,
        tokenName: row.name,
        tokenSymbol: row.symbol,
        tokenLogo: row.logo_url,
        binStep: row.bin_step,
        baseFee: row.base_fee,
        initialPrice: parseFloat(row.initial_price),
        currentPrice: parseFloat(row.current_price) || parseFloat(row.initial_price),
        volume24h: parseFloat(row.volume_24h) || 0,
        holdersCount: row.holders_count || 1,
        trades24h: row.trades_24h || 0,
        alphaVaultEnabled: row.alpha_vault_enabled,
        createdAt: row.created_at,
        trading: {
          jupiterUrl: `https://jup.ag/swap/${row.quote_mint}-${row.token_mint}`,
          birdeyeUrl: `https://birdeye.so/token/${row.token_mint}`
        }
      }))
    });

  } catch (error) {
    console.error('❌ Failed to fetch pools:', error);
    res.status(500).json({
      error: 'Failed to fetch pools',
      message: error.message
    });
  }
});

/**
 * POST /api/pools/:poolAddress/refresh
 * Refresh pool statistics from live data
 */
router.post('/:poolAddress/refresh', async (req, res) => {
  try {
    const { poolAddress } = req.params;

    // Validate pool address
    if (!poolAddress || poolAddress.length !== 44) {
      return res.status(400).json({
        error: 'Invalid pool address'
      });
    }

    // Check if pool exists
    const pool = await MeteoraPool.findByAddress(poolAddress);
    if (!pool) {
      return res.status(404).json({
        error: 'Pool not found'
      });
    }

    // Fetch fresh statistics from Meteora
    const freshStats = await meteoraService.getPoolStatistics(poolAddress);
    
    if (freshStats) {
      // Update database with fresh stats
      await PoolStatistics.upsert(freshStats);
      
      res.json({
        success: true,
        message: 'Pool statistics refreshed',
        data: freshStats
      });
    } else {
      res.status(503).json({
        error: 'Unable to fetch fresh statistics',
        message: 'Meteora API may be unavailable'
      });
    }

  } catch (error) {
    console.error('❌ Failed to refresh pool statistics:', error);
    res.status(500).json({
      error: 'Failed to refresh pool statistics',
      message: error.message
    });
  }
});

/**
 * GET /api/pools/top/volume
 * Get top pools by 24h volume
 */
router.get('/top/volume', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const query = `
      SELECT 
        mp.*,
        tl.name,
        tl.symbol,
        tl.logo_url,
        ps.*
      FROM meteora_pools mp
      JOIN token_launches tl ON mp.token_mint = tl.mint_address
      JOIN pool_statistics ps ON mp.pool_address = ps.pool_address
      ORDER BY ps.volume_24h DESC
      LIMIT $1
    `;

    const { pool } = require('../models/database');
    const result = await pool.query(query, [limit]);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        poolAddress: row.pool_address,
        tokenName: row.name,
        tokenSymbol: row.symbol,
        tokenLogo: row.logo_url,
        volume24h: parseFloat(row.volume_24h),
        currentPrice: parseFloat(row.current_price),
        priceChange24h: parseFloat(row.price_change_24h),
        trades24h: row.trades_24h,
        holdersCount: row.holders_count,
        marketCap: parseFloat(row.market_cap),
        trading: {
          jupiterUrl: `https://jup.ag/swap/${row.quote_mint}-${row.token_mint}`,
          birdeyeUrl: `https://birdeye.so/token/${row.token_mint}`
        }
      }))
    });

  } catch (error) {
    console.error('❌ Failed to fetch top pools:', error);
    res.status(500).json({
      error: 'Failed to fetch top pools',
      message: error.message
    });
  }
});

/**
 * GET /api/pools/trending
 * Get trending pools (highest price change)
 */
router.get('/trending', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const query = `
      SELECT 
        mp.*,
        tl.name,
        tl.symbol,
        tl.logo_url,
        ps.*
      FROM meteora_pools mp
      JOIN token_launches tl ON mp.token_mint = tl.mint_address
      JOIN pool_statistics ps ON mp.pool_address = ps.pool_address
      WHERE ps.price_change_24h > 0
      ORDER BY ps.price_change_24h DESC
      LIMIT $1
    `;

    const { pool } = require('../models/database');
    const result = await pool.query(query, [limit]);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        poolAddress: row.pool_address,
        tokenName: row.name,
        tokenSymbol: row.symbol,
        tokenLogo: row.logo_url,
        currentPrice: parseFloat(row.current_price),
        priceChange24h: parseFloat(row.price_change_24h),
        volume24h: parseFloat(row.volume_24h),
        trades24h: row.trades_24h,
        holdersCount: row.holders_count,
        createdAt: row.created_at,
        trading: {
          jupiterUrl: `https://jup.ag/swap/${row.quote_mint}-${row.token_mint}`,
          birdeyeUrl: `https://birdeye.so/token/${row.token_mint}`
        }
      }))
    });

  } catch (error) {
    console.error('❌ Failed to fetch trending pools:', error);
    res.status(500).json({
      error: 'Failed to fetch trending pools',
      message: error.message
    });
  }
});

module.exports = router; 