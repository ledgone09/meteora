module.exports = {
  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Solana Configuration
  solana: {
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    network: process.env.SOLANA_NETWORK || 'devnet',
    commitment: 'confirmed'
  },
  
  // Meteora DLMM Configuration
  meteora: {
    programId: 'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo', // Meteora DLMM Program ID
    apiUrl: 'https://dlmm-api.meteora.ag',
    defaultBinStep: 100, // 1% bin step
    defaultBaseFee: 25,  // 0.25% base fee
    maxFee: 1000,        // 10% max fee during volatility
    quoteMint: 'So11111111111111111111111111111111111111112' // SOL mint
  },
  
  // IPFS Configuration (using public gateway for development)
  ipfs: {
    apiUrl: process.env.IPFS_API_URL || 'https://ipfs.infura.io:5001',
    projectId: process.env.IPFS_PROJECT_ID || 'demo_project_id',
    projectSecret: process.env.IPFS_PROJECT_SECRET || 'demo_project_secret',
    gateway: 'https://ipfs.io/ipfs/'
  },
  
  // Database Configuration (optional for development)
  database: {
    connectionString: process.env.DATABASE_URL || null,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  },
  
  // Token Creation Settings
  tokenDefaults: {
    supply: 1000000000, // 1 billion tokens
    decimals: 9,
    initialPrice: 0.0001, // $0.0001 per token
    creatorAllocation: 0.8 // 80% to creator, 20% for liquidity
  },
  
  // Fee Structure
  fees: {
    basicLaunch: 0.02,    // 0.02 SOL for basic launch
    premiumLaunch: 0.1,   // 0.1 SOL for premium launch with anti-sniper
    platformFee: 0.015,   // Platform keeps 0.015 SOL
    meteoraFee: 0.005     // ~0.005 SOL for Meteora pool creation
  },
  
  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
    rateLimitMax: 100 // limit each IP to 100 requests per windowMs
  },
  
  // File Upload
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    tempDir: './temp'
  },
  
  // Alpha Vault (Anti-Sniper) Configuration
  alphaVault: {
    enabled: true,
    maxBuyAmount: 1000, // Max tokens per transaction during protection period
    protectionDuration: 300, // 5 minutes protection period
    whitelistSize: 100 // Max whitelist size
  },
  
  // Pool Configuration Templates
  poolTemplates: {
    basic: {
      binStep: 100,
      baseFee: 25,
      activationDelay: 0, // Immediate activation
      curveType: 'curve',
      alphaVault: false
    },
    premium: {
      binStep: 50,
      baseFee: 25,
      activationDelay: 300, // 5 minute delay for anti-sniper setup
      curveType: 'curve',
      alphaVault: true
    }
  }
}; 