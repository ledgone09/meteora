// Root index.js - Entry point for Render.com deployment
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for now to allow inline styles
}));
app.use(compression());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        platform_file_exists: fs.existsSync(path.join(__dirname, 'platform.html')),
        working_directory: process.cwd(),
        __dirname: __dirname
    });
});

// API status endpoint
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        message: 'Meteora Token Launcher API is running',
        version: '1.0.1',
        endpoints: {
            health: '/health',
            create_token: '/api/tokens/create',
            recent_launches: '/api/launches/recent'
        }
    });
});

// Mock API endpoints for functionality
app.post('/api/tokens/create', (req, res) => {
    console.log('Token creation request:', req.body);
    
    // Simulate token creation process
    setTimeout(() => {
        res.json({
            success: true,
            message: 'Token created successfully',
            token: {
                address: 'mock_token_address_' + Date.now(),
                name: req.body.name,
                symbol: req.body.symbol,
                supply: '1000000000',
                decimals: 9
            },
            pool: {
                address: 'mock_pool_address_' + Date.now(),
                type: 'meteora_dlmm'
            },
            transaction: 'mock_tx_' + Date.now()
        });
    }, 2000);
});

app.get('/api/launches/recent', (req, res) => {
    res.json({
        launches: [],
        message: 'No recent launches'
    });
});

// Debug endpoint to check file system
app.get('/debug', (req, res) => {
    const files = fs.readdirSync(__dirname);
    res.json({
        working_directory: process.cwd(),
        __dirname: __dirname,
        files_in_root: files,
        platform_html_exists: fs.existsSync(path.join(__dirname, 'platform.html')),
        platform_html_size: fs.existsSync(path.join(__dirname, 'platform.html')) 
            ? fs.statSync(path.join(__dirname, 'platform.html')).size 
            : 'N/A'
    });
});

// Serve the main HTML file with multiple fallback attempts
app.get('/', (req, res) => {
    console.log('=== SERVING ROOT PATH ===');
    console.log('Working directory:', process.cwd());
    console.log('__dirname:', __dirname);
    
    // Try multiple possible paths
    const possiblePaths = [
        path.join(__dirname, 'platform.html'),
        path.join(process.cwd(), 'platform.html'),
        path.join(__dirname, 'client', 'public', 'index.html'),
        path.join(process.cwd(), 'client', 'public', 'index.html')
    ];
    
    let htmlPath = null;
    let foundPath = null;
    
    for (const testPath of possiblePaths) {
        console.log('Checking path:', testPath);
        if (fs.existsSync(testPath)) {
            htmlPath = testPath;
            foundPath = testPath;
            console.log('✅ Found platform file at:', testPath);
            break;
        } else {
            console.log('❌ Not found at:', testPath);
        }
    }
    
    if (htmlPath) {
        try {
            const htmlContent = fs.readFileSync(htmlPath, 'utf8');
            console.log('📄 Successfully read HTML file, size:', htmlContent.length, 'characters');
            
            // Verify it's not the loading fallback
            if (htmlContent.includes('Platform loading...')) {
                console.log('⚠️ HTML file contains loading message, serving fallback instead');
                return serveEmbeddedFallback(res);
            }
            
            res.setHeader('Content-Type', 'text/html');
            res.send(htmlContent);
            return;
        } catch (error) {
            console.error('Error reading HTML file:', error);
        }
    }
    
    console.log('🔄 No platform file found, serving embedded fallback');
    serveEmbeddedFallback(res);
});

function serveEmbeddedFallback(res) {
    const fallbackHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meteora Token Launcher</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container { 
            max-width: 800px; 
            text-align: center; 
            padding: 40px 20px;
            background: rgba(0,0,0,0.2);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .logo { font-size: 60px; margin-bottom: 20px; }
        h1 { font-size: 48px; margin-bottom: 20px; }
        .status { 
            background: rgba(255,255,255,0.1); 
            padding: 20px; 
            border-radius: 10px; 
            margin: 20px 0;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .btn {
            background: linear-gradient(45deg, #9333ea, #3b82f6);
            border: none;
            color: white;
            padding: 15px 30px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            margin: 10px;
            transition: transform 0.2s ease;
        }
        .btn:hover { transform: scale(1.05); }
        .debug { 
            font-size: 12px; 
            opacity: 0.7; 
            margin-top: 20px;
            text-align: left;
            background: rgba(0,0,0,0.3);
            padding: 15px;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🚀</div>
        <h1>Meteora Token Launcher</h1>
        <p style="font-size: 20px; margin-bottom: 30px;">Platform deployment issue detected</p>
        
        <div class="status">
            <h3>⚠️ Temporary Fallback Mode</h3>
            <p>The main platform interface is not loading properly.</p>
            <p>This is likely a deployment configuration issue.</p>
        </div>
        
        <button class="btn" onclick="window.location.reload()">🔄 Retry</button>
        <button class="btn" onclick="window.location.href='/debug'">🔍 Debug Info</button>
        <button class="btn" onclick="window.location.href='/health'">📊 Health Check</button>
        
        <div class="debug">
            <strong>Debug Info:</strong><br>
            Timestamp: ${new Date().toISOString()}<br>
            Version: 1.0.1<br>
            Expected: Full Meteora Token Launcher interface<br>
            Actual: Fallback mode
        </div>
    </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(fallbackHTML);
}

// Catch all other routes
app.get('*', (req, res) => {
    res.redirect('/');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Meteora Token Launcher Server running on port ${PORT}`);
    console.log(`🌐 Server URL: http://localhost:${PORT}`);
    console.log(`📊 Health Check: http://localhost:${PORT}/health`);
    console.log(`🔍 Debug Info: http://localhost:${PORT}/debug`);
    console.log(`🚀 Platform: http://localhost:${PORT}/`);
    
    // Check for platform file on startup
    const platformPath = path.join(__dirname, 'platform.html');
    if (fs.existsSync(platformPath)) {
        console.log('✅ Platform HTML file found at startup');
        const stats = fs.statSync(platformPath);
        console.log(`📄 File size: ${stats.size} bytes`);
    } else {
        console.log('❌ Platform HTML file NOT found at startup');
        console.log('📂 Available files:', fs.readdirSync(__dirname));
    }
});

module.exports = app; 