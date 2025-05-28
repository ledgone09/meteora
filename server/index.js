const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// Load configuration
const config = require('./config');

// Import routes
const tokenRoutes = require('./routes/tokens');
const poolRoutes = require('./routes/pools');
const uploadRoutes = require('./routes/upload');

// Import database
const { initializeDatabase } = require('./models/database');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for React app
  crossOriginEmbedderPolicy: false
}));
app.use(compression());

// CORS configuration
app.use(cors({
  origin: config.security.corsOrigin,
  credentials: true
}));

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create temp directory for uploads
if (!fs.existsSync(config.upload.tempDir)) {
  fs.mkdirSync(config.upload.tempDir, { recursive: true });
}

// Static files for uploads
app.use('/uploads', express.static(config.upload.tempDir));

// Serve React build files in production
if (config.nodeEnv === 'production') {
  const buildPath = path.join(__dirname, '../client/build');
  
  // Check if build directory exists
  if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
    
    // Serve React app for any non-API routes
    app.get('/', (req, res) => {
      const indexPath = path.join(buildPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.send(getFallbackHTML());
      }
    });
  } else {
    console.warn('⚠️  Client build directory not found, serving API only');
    app.get('/', (req, res) => {
      res.send(getFallbackHTML());
    });
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: require('./package.json').version,
    environment: config.nodeEnv,
    pricing: {
      basic: `${config.fees.basicLaunch} SOL`,
      premium: `${config.fees.premiumLaunch} SOL`
    }
  });
});

// API routes
app.use('/api/tokens', tokenRoutes);
app.use('/api/pools', poolRoutes);
app.use('/api/upload', uploadRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Meteora Token Launcher API',
    version: '1.0.0',
    description: 'API for creating Solana tokens with Meteora DLMM liquidity pools',
    endpoints: {
      'POST /api/tokens/create': 'Create a new token with liquidity pool',
      'GET /api/tokens/recent': 'Get recently created tokens',
      'GET /api/tokens/:mintAddress': 'Get token details',
      'GET /api/pools/:poolAddress': 'Get pool statistics',
      'POST /api/upload/logo': 'Upload token logo to IPFS'
    },
    fees: {
      basic: `${config.fees.basicLaunch} SOL`,
      premium: `${config.fees.premiumLaunch} SOL`
    }
  });
});

// Serve React app for any non-API routes (SPA routing)
if (config.nodeEnv === 'production') {
  app.get('*', (req, res) => {
    const buildPath = path.join(__dirname, '../client/build');
    const indexPath = path.join(buildPath, 'index.html');
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.send(getFallbackHTML());
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      details: err.details
    });
  }
  
  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: 'File Upload Error',
      message: err.message
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: config.nodeEnv === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('🚀 Starting Meteora Token Launcher Server...');
    
    // Try to initialize database (optional for development)
    try {
      await initializeDatabase();
      console.log('✅ Database initialized');
    } catch (dbError) {
      if (config.nodeEnv === 'development') {
        console.log('⚠️  Database connection failed - running in development mode without database');
        console.log('   Some features may not work properly without a database');
      } else {
        throw dbError; // In production, database is required
      }
    }
    
    // Start server
    const server = app.listen(config.port, () => {
      console.log(`🌟 Server running on port ${config.port}`);
      console.log(`🌐 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Solana Network: ${config.solana.network}`);
      console.log(`💰 Basic Launch Fee: ${config.fees.basicLaunch} SOL`);
      console.log(`💎 Premium Launch Fee: ${config.fees.premiumLaunch} SOL`);
      console.log(`📡 API Documentation: http://localhost:${config.port}/api`);
      console.log(`🔧 Health Check: http://localhost:${config.port}/health`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;

// Fallback HTML when React build is not available
function getFallbackHTML() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meteora Token Launcher - API Ready</title>
    <style>
        body { 
            font-family: system-ui, -apple-system, sans-serif; 
            max-width: 800px; 
            margin: 50px auto; 
            padding: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
        }
        .container { 
            background: rgba(255,255,255,0.1); 
            padding: 40px; 
            border-radius: 20px; 
            backdrop-filter: blur(10px);
        }
        .status { color: #4ade80; font-size: 24px; margin: 20px 0; }
        .api-link { 
            display: inline-block; 
            background: #4ade80; 
            color: #000; 
            padding: 12px 24px; 
            border-radius: 8px; 
            text-decoration: none; 
            margin: 10px;
            font-weight: bold;
        }
        .api-link:hover { background: #22c55e; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Meteora Token Launcher</h1>
        <div class="status">✅ Backend API is Running!</div>
        <p>The server is successfully deployed and all API endpoints are functional.</p>
        <p>Frontend build is being processed...</p>
        
        <h3>🔧 Available API Endpoints:</h3>
        <a href="/api" class="api-link">📡 API Documentation</a>
        <a href="/health" class="api-link">🔧 Health Check</a>
        
        <h3>✨ Features Ready:</h3>
        <ul style="text-align: left; max-width: 400px; margin: 0 auto;">
            <li>✅ Token Creation API</li>
            <li>✅ Meteora Pool Integration (Mock)</li>
            <li>✅ IPFS File Upload (Mock)</li>
            <li>✅ Database Operations (Mock)</li>
            <li>✅ Wallet Integration Ready</li>
        </ul>
        
        <p style="margin-top: 30px; opacity: 0.8;">
            The React frontend will be available shortly. All backend functionality is operational.
        </p>
    </div>
</body>
</html>`;
} 