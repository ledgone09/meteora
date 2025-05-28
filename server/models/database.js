// Mock Database - Simplified for deployment
// Full PostgreSQL integration will be added after successful deployment

// Mock data storage (in-memory for demo purposes)
let mockTokens = [];
let mockPools = [];
let mockStats = [];
let mockUploads = [];

// Database initialization (mock)
async function initializeDatabase() {
  console.log('📊 Mock database initialized');
  
  // Add some sample data for demonstration
  const sampleTokens = [
    {
      mint_address: 'SampleToken1234567890abcdef',
      name: 'Sample Token',
      symbol: 'SAMPLE',
      logo_url: 'https://ipfs.io/ipfs/QmSampleHash1',
      creator_wallet: 'SampleCreator1234567890abcdef',
      launch_type: 'basic',
      created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      pool_address: 'SamplePool1234567890abcdef',
      current_price: 0.00025,
      volume_24h: 1500,
      holders_count: 45
    },
    {
      mint_address: 'AnotherToken1234567890abcdef', 
      name: 'Another Token',
      symbol: 'ANOTHER',
      logo_url: 'https://ipfs.io/ipfs/QmSampleHash2',
      creator_wallet: 'AnotherCreator1234567890abcdef',
      launch_type: 'premium',
      created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      pool_address: 'AnotherPool1234567890abcdef',
      current_price: 0.00045,
      volume_24h: 2300,
      holders_count: 78
    }
  ];
  
  mockTokens.push(...sampleTokens);
  return true;
}

// Token launch operations (mock)
const TokenLaunch = {
  async create(launchData) {
    const mockToken = {
      id: Math.floor(Math.random() * 1000000),
      mint_address: launchData.mintAddress,
      name: launchData.name,
      symbol: launchData.symbol,
      logo_url: launchData.logoUrl,
      metadata_uri: launchData.metadataUri,
      creator_wallet: launchData.creatorWallet,
      total_supply: launchData.totalSupply,
      decimals: launchData.decimals,
      launch_type: launchData.launchType,
      fee_paid: launchData.feePaid,
      transaction_signature: launchData.transactionSignature,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockTokens.unshift(mockToken); // Add to beginning for recent order
    console.log('✅ Mock token saved:', mockToken.symbol);
    return mockToken;
  },

  async findByMint(mintAddress) {
    return mockTokens.find(token => token.mint_address === mintAddress) || null;
  },

  async findRecent(limit = 20) {
    return mockTokens.slice(0, limit).map(token => ({
      ...token,
      pool_address: `Pool${Math.random().toString(36).substr(2, 9)}`,
      current_price: Math.random() * 0.001,
      volume_24h: Math.floor(Math.random() * 5000),
      holders_count: Math.floor(Math.random() * 100) + 1
    }));
  },

  async findByCreator(creatorWallet, limit = 10) {
    return mockTokens
      .filter(token => token.creator_wallet === creatorWallet)
      .slice(0, limit);
  }
};

// Meteora pool operations (mock)
const MeteoraPool = {
  async create(poolData) {
    const mockPool = {
      id: Math.floor(Math.random() * 1000000),
      pool_address: poolData.poolAddress,
      token_mint: poolData.tokenMint,
      quote_mint: poolData.quoteMint,
      bin_step: poolData.binStep,
      base_fee: poolData.baseFee,
      initial_price: poolData.initialPrice,
      activation_time: poolData.activationTime,
      alpha_vault_enabled: poolData.alphaVaultEnabled,
      liquidity_locked: false,
      pool_state: 'active',
      transaction_signature: poolData.transactionSignature,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockPools.push(mockPool);
    console.log('✅ Mock pool saved:', mockPool.pool_address);
    return mockPool;
  },

  async findByAddress(poolAddress) {
    return mockPools.find(pool => pool.pool_address === poolAddress) || null;
  },

  async findByTokenMint(tokenMint) {
    return mockPools.find(pool => pool.token_mint === tokenMint) || null;
  }
};

// Pool statistics operations (mock)
const PoolStatistics = {
  async upsert(statsData) {
    const existingIndex = mockStats.findIndex(stat => stat.pool_address === statsData.poolAddress);
    
    const mockStat = {
      id: existingIndex >= 0 ? mockStats[existingIndex].id : Math.floor(Math.random() * 1000000),
      pool_address: statsData.poolAddress,
      volume_24h: statsData.volume24h || Math.random() * 10000,
      volume_7d: statsData.volume7d || Math.random() * 50000,
      volume_total: statsData.volumeTotal || Math.random() * 100000,
      trades_24h: statsData.trades24h || Math.floor(Math.random() * 500),
      trades_total: statsData.tradesTotal || Math.floor(Math.random() * 2000),
      holders_count: statsData.holdersCount || Math.floor(Math.random() * 200),
      current_price: statsData.currentPrice || Math.random() * 0.01,
      price_change_24h: (Math.random() - 0.5) * 20, // -10% to +10%
      market_cap: Math.random() * 1000000,
      liquidity_usd: Math.random() * 100000,
      last_updated: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
      mockStats[existingIndex] = mockStat;
    } else {
      mockStats.push(mockStat);
    }
    
    console.log('✅ Mock statistics saved for pool:', statsData.poolAddress);
    return mockStat;
  },

  async findByPoolAddress(poolAddress) {
    return mockStats.find(stat => stat.pool_address === poolAddress) || null;
  }
};

// Upload operations (mock)
const Upload = {
  async create(uploadData) {
    const mockUpload = {
      id: Math.floor(Math.random() * 1000000),
      file_hash: uploadData.fileHash,
      original_name: uploadData.originalName,
      mime_type: uploadData.mimeType,
      file_size: uploadData.fileSize,
      ipfs_hash: uploadData.ipfsHash,
      ipfs_url: uploadData.ipfsUrl,
      uploaded_by: uploadData.uploadedBy,
      created_at: new Date().toISOString()
    };
    
    mockUploads.push(mockUpload);
    console.log('✅ Mock upload saved:', mockUpload.original_name);
    return mockUpload;
  },

  async findByHash(fileHash) {
    return mockUploads.find(upload => upload.file_hash === fileHash) || null;
  }
};

module.exports = {
  initializeDatabase,
  TokenLaunch,
  MeteoraPool,
  PoolStatistics,
  Upload
}; 