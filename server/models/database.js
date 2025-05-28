const { Pool } = require('pg');
const config = require('../config');

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: config.database.connectionString,
  ssl: config.database.ssl
});

// Database initialization
async function initializeDatabase() {
  try {
    // Test connection
    const client = await pool.connect();
    console.log('📊 Connected to PostgreSQL database');
    
    // Create tables if they don't exist
    await createTables(client);
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

// Create database tables
async function createTables(client) {
  // Token launches table
  await client.query(`
    CREATE TABLE IF NOT EXISTS token_launches (
      id SERIAL PRIMARY KEY,
      mint_address VARCHAR(44) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      symbol VARCHAR(10) NOT NULL,
      logo_url TEXT,
      metadata_uri TEXT,
      creator_wallet VARCHAR(44) NOT NULL,
      total_supply BIGINT NOT NULL,
      decimals INTEGER NOT NULL,
      launch_type VARCHAR(20) NOT NULL CHECK (launch_type IN ('basic', 'premium')),
      fee_paid DECIMAL(10, 9) NOT NULL,
      transaction_signature VARCHAR(88),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Meteora pools table
  await client.query(`
    CREATE TABLE IF NOT EXISTS meteora_pools (
      id SERIAL PRIMARY KEY,
      pool_address VARCHAR(44) UNIQUE NOT NULL,
      token_mint VARCHAR(44) NOT NULL REFERENCES token_launches(mint_address),
      quote_mint VARCHAR(44) NOT NULL,
      bin_step INTEGER NOT NULL,
      base_fee INTEGER NOT NULL,
      initial_price DECIMAL(20, 10) NOT NULL,
      activation_time TIMESTAMP WITH TIME ZONE,
      alpha_vault_enabled BOOLEAN DEFAULT FALSE,
      liquidity_locked BOOLEAN DEFAULT FALSE,
      lock_release_point TIMESTAMP WITH TIME ZONE,
      pool_state VARCHAR(20) DEFAULT 'active',
      transaction_signature VARCHAR(88),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Pool statistics table (for caching trading data)
  await client.query(`
    CREATE TABLE IF NOT EXISTS pool_statistics (
      id SERIAL PRIMARY KEY,
      pool_address VARCHAR(44) NOT NULL REFERENCES meteora_pools(pool_address),
      volume_24h DECIMAL(20, 10) DEFAULT 0,
      volume_7d DECIMAL(20, 10) DEFAULT 0,
      volume_total DECIMAL(20, 10) DEFAULT 0,
      trades_24h INTEGER DEFAULT 0,
      trades_total INTEGER DEFAULT 0,
      holders_count INTEGER DEFAULT 0,
      current_price DECIMAL(20, 10),
      price_change_24h DECIMAL(10, 4),
      market_cap DECIMAL(20, 2),
      liquidity_usd DECIMAL(20, 2),
      last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Upload tracking table
  await client.query(`
    CREATE TABLE IF NOT EXISTS uploads (
      id SERIAL PRIMARY KEY,
      file_hash VARCHAR(64) UNIQUE NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      mime_type VARCHAR(100) NOT NULL,
      file_size INTEGER NOT NULL,
      ipfs_hash VARCHAR(64),
      ipfs_url TEXT,
      uploaded_by VARCHAR(44),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for better performance
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_token_launches_creator ON token_launches(creator_wallet);
    CREATE INDEX IF NOT EXISTS idx_token_launches_created_at ON token_launches(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_meteora_pools_token_mint ON meteora_pools(token_mint);
    CREATE INDEX IF NOT EXISTS idx_meteora_pools_created_at ON meteora_pools(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_pool_statistics_pool_address ON pool_statistics(pool_address);
  `);

  console.log('✅ Database tables created/verified');
}

// Token launch operations
const TokenLaunch = {
  async create(launchData) {
    const query = `
      INSERT INTO token_launches (
        mint_address, name, symbol, logo_url, metadata_uri, creator_wallet,
        total_supply, decimals, launch_type, fee_paid, transaction_signature
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const values = [
      launchData.mintAddress,
      launchData.name,
      launchData.symbol,
      launchData.logoUrl,
      launchData.metadataUri,
      launchData.creatorWallet,
      launchData.totalSupply,
      launchData.decimals,
      launchData.launchType,
      launchData.feePaid,
      launchData.transactionSignature
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async findByMint(mintAddress) {
    const query = 'SELECT * FROM token_launches WHERE mint_address = $1';
    const result = await pool.query(query, [mintAddress]);
    return result.rows[0];
  },

  async findRecent(limit = 20) {
    const query = `
      SELECT tl.*, mp.pool_address, ps.current_price, ps.volume_24h, ps.holders_count
      FROM token_launches tl
      LEFT JOIN meteora_pools mp ON tl.mint_address = mp.token_mint
      LEFT JOIN pool_statistics ps ON mp.pool_address = ps.pool_address
      ORDER BY tl.created_at DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  },

  async findByCreator(creatorWallet, limit = 10) {
    const query = `
      SELECT * FROM token_launches 
      WHERE creator_wallet = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `;
    const result = await pool.query(query, [creatorWallet, limit]);
    return result.rows;
  }
};

// Meteora pool operations
const MeteoraPool = {
  async create(poolData) {
    const query = `
      INSERT INTO meteora_pools (
        pool_address, token_mint, quote_mint, bin_step, base_fee,
        initial_price, activation_time, alpha_vault_enabled, transaction_signature
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      poolData.poolAddress,
      poolData.tokenMint,
      poolData.quoteMint,
      poolData.binStep,
      poolData.baseFee,
      poolData.initialPrice,
      poolData.activationTime,
      poolData.alphaVaultEnabled,
      poolData.transactionSignature
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async findByAddress(poolAddress) {
    const query = `
      SELECT mp.*, tl.name, tl.symbol, tl.logo_url
      FROM meteora_pools mp
      JOIN token_launches tl ON mp.token_mint = tl.mint_address
      WHERE mp.pool_address = $1
    `;
    const result = await pool.query(query, [poolAddress]);
    return result.rows[0];
  },

  async findByTokenMint(tokenMint) {
    const query = 'SELECT * FROM meteora_pools WHERE token_mint = $1';
    const result = await pool.query(query, [tokenMint]);
    return result.rows[0];
  }
};

// Pool statistics operations
const PoolStatistics = {
  async upsert(statsData) {
    const query = `
      INSERT INTO pool_statistics (
        pool_address, volume_24h, volume_7d, volume_total, trades_24h, trades_total,
        holders_count, current_price, price_change_24h, market_cap, liquidity_usd
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (pool_address) DO UPDATE SET
        volume_24h = EXCLUDED.volume_24h,
        volume_7d = EXCLUDED.volume_7d,
        volume_total = EXCLUDED.volume_total,
        trades_24h = EXCLUDED.trades_24h,
        trades_total = EXCLUDED.trades_total,
        holders_count = EXCLUDED.holders_count,
        current_price = EXCLUDED.current_price,
        price_change_24h = EXCLUDED.price_change_24h,
        market_cap = EXCLUDED.market_cap,
        liquidity_usd = EXCLUDED.liquidity_usd,
        last_updated = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const values = [
      statsData.poolAddress,
      statsData.volume24h || 0,
      statsData.volume7d || 0,
      statsData.volumeTotal || 0,
      statsData.trades24h || 0,
      statsData.tradesTotal || 0,
      statsData.holdersCount || 0,
      statsData.currentPrice || 0,
      statsData.priceChange24h || 0,
      statsData.marketCap || 0,
      statsData.liquidityUsd || 0
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async findByPoolAddress(poolAddress) {
    const query = 'SELECT * FROM pool_statistics WHERE pool_address = $1';
    const result = await pool.query(query, [poolAddress]);
    return result.rows[0];
  }
};

// Upload operations
const Upload = {
  async create(uploadData) {
    const query = `
      INSERT INTO uploads (file_hash, original_name, mime_type, file_size, ipfs_hash, ipfs_url, uploaded_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      uploadData.fileHash,
      uploadData.originalName,
      uploadData.mimeType,
      uploadData.fileSize,
      uploadData.ipfsHash,
      uploadData.ipfsUrl,
      uploadData.uploadedBy
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async findByHash(fileHash) {
    const query = 'SELECT * FROM uploads WHERE file_hash = $1';
    const result = await pool.query(query, [fileHash]);
    return result.rows[0];
  }
};

module.exports = {
  pool,
  initializeDatabase,
  TokenLaunch,
  MeteoraPool,
  PoolStatistics,
  Upload
}; 