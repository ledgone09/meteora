const { Client } = require('pg');
const config = require('../config');

async function setupDatabase() {
  console.log('🗄️  Setting up Meteora Token Launcher Database...');
  
  // Extract database name from connection string
  const dbUrl = new URL(config.database.connectionString);
  const dbName = dbUrl.pathname.slice(1); // Remove leading slash
  
  // Connect to postgres database first to create our database
  const adminClient = new Client({
    host: dbUrl.hostname,
    port: dbUrl.port,
    user: dbUrl.username,
    password: dbUrl.password,
    database: 'postgres', // Connect to default postgres database
    ssl: config.database.ssl
  });
  
  try {
    await adminClient.connect();
    
    // Create database if it doesn't exist
    try {
      await adminClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database "${dbName}" created`);
    } catch (error) {
      if (error.code === '42P04') {
        console.log(`✅ Database "${dbName}" already exists`);
      } else {
        throw error;
      }
    }
    
    await adminClient.end();
    
    // Now connect to our database to create tables
    const client = new Client({
      connectionString: config.database.connectionString,
      ssl: config.database.ssl
    });
    
    await client.connect();
    console.log('✅ Connected to database');
    
    // Create tables
    await createTables(client);
    
    await client.end();
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

async function createTables(client) {
  console.log('📋 Creating database tables...');
  
  // Token launches table
  await client.query(`
    CREATE TABLE IF NOT EXISTS token_launches (
      id SERIAL PRIMARY KEY,
      mint_address VARCHAR(44) UNIQUE NOT NULL,
      creator_wallet VARCHAR(44) NOT NULL,
      token_name VARCHAR(100) NOT NULL,
      token_symbol VARCHAR(10) NOT NULL,
      logo_url TEXT,
      metadata_uri TEXT,
      supply BIGINT NOT NULL DEFAULT 1000000000,
      decimals INTEGER NOT NULL DEFAULT 9,
      launch_type VARCHAR(20) NOT NULL DEFAULT 'basic',
      fee_paid DECIMAL(10, 9) NOT NULL,
      transaction_signature VARCHAR(88),
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ token_launches table created');
  
  // Meteora pools table
  await client.query(`
    CREATE TABLE IF NOT EXISTS meteora_pools (
      id SERIAL PRIMARY KEY,
      pool_address VARCHAR(44) UNIQUE NOT NULL,
      token_launch_id INTEGER REFERENCES token_launches(id),
      base_mint VARCHAR(44) NOT NULL,
      quote_mint VARCHAR(44) NOT NULL,
      bin_step INTEGER NOT NULL,
      base_fee INTEGER NOT NULL,
      max_fee INTEGER NOT NULL,
      alpha_vault_enabled BOOLEAN DEFAULT FALSE,
      activation_delay INTEGER DEFAULT 0,
      initial_price DECIMAL(20, 10),
      liquidity_amount BIGINT,
      pool_type VARCHAR(20) DEFAULT 'dlmm',
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      transaction_signature VARCHAR(88),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ meteora_pools table created');
  
  // Pool statistics table
  await client.query(`
    CREATE TABLE IF NOT EXISTS pool_statistics (
      id SERIAL PRIMARY KEY,
      pool_address VARCHAR(44) REFERENCES meteora_pools(pool_address),
      volume_24h DECIMAL(20, 10) DEFAULT 0,
      volume_7d DECIMAL(20, 10) DEFAULT 0,
      fees_24h DECIMAL(20, 10) DEFAULT 0,
      fees_7d DECIMAL(20, 10) DEFAULT 0,
      liquidity_usd DECIMAL(20, 10) DEFAULT 0,
      price_usd DECIMAL(20, 10) DEFAULT 0,
      price_change_24h DECIMAL(10, 4) DEFAULT 0,
      transactions_24h INTEGER DEFAULT 0,
      unique_traders_24h INTEGER DEFAULT 0,
      last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ pool_statistics table created');
  
  // File uploads table
  await client.query(`
    CREATE TABLE IF NOT EXISTS uploads (
      id SERIAL PRIMARY KEY,
      file_hash VARCHAR(64) UNIQUE NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      mime_type VARCHAR(100) NOT NULL,
      file_size INTEGER NOT NULL,
      ipfs_hash VARCHAR(64),
      ipfs_url TEXT,
      uploader_wallet VARCHAR(44),
      upload_type VARCHAR(20) DEFAULT 'logo',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ uploads table created');
  
  // Create indexes for better performance
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_token_launches_creator ON token_launches(creator_wallet);
    CREATE INDEX IF NOT EXISTS idx_token_launches_status ON token_launches(status);
    CREATE INDEX IF NOT EXISTS idx_token_launches_created ON token_launches(created_at);
    CREATE INDEX IF NOT EXISTS idx_meteora_pools_token_launch ON meteora_pools(token_launch_id);
    CREATE INDEX IF NOT EXISTS idx_meteora_pools_status ON meteora_pools(status);
    CREATE INDEX IF NOT EXISTS idx_pool_statistics_pool ON pool_statistics(pool_address);
    CREATE INDEX IF NOT EXISTS idx_uploads_hash ON uploads(file_hash);
  `);
  console.log('✅ Database indexes created');
  
  // Create updated_at trigger function
  await client.query(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);
  
  // Create triggers for updated_at
  await client.query(`
    DROP TRIGGER IF EXISTS update_token_launches_updated_at ON token_launches;
    CREATE TRIGGER update_token_launches_updated_at 
      BEFORE UPDATE ON token_launches 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      
    DROP TRIGGER IF EXISTS update_meteora_pools_updated_at ON meteora_pools;
    CREATE TRIGGER update_meteora_pools_updated_at 
      BEFORE UPDATE ON meteora_pools 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `);
  console.log('✅ Database triggers created');
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase }; 