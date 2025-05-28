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
        environment: process.env.NODE_ENV || 'development'
    });
});

// API status endpoint
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        message: 'Meteora Token Launcher API is running',
        version: '1.0.0',
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

// Serve the main HTML file
app.get('/', (req, res) => {
    const htmlPath = path.join(__dirname, 'platform.html');
    
    if (fs.existsSync(htmlPath)) {
        console.log('Serving main platform HTML from:', htmlPath);
        res.sendFile(htmlPath);
    } else {
        console.log('Main HTML file not found, serving fallback');
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Meteora Token Launcher</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 0; 
                        padding: 40px; 
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        text-align: center;
                        min-height: 100vh;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                    }
                    .container { max-width: 600px; }
                    h1 { font-size: 48px; margin-bottom: 20px; }
                    p { font-size: 18px; margin-bottom: 30px; opacity: 0.9; }
                    .status { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🚀 Meteora Token Launcher</h1>
                    <p>Platform is starting up...</p>
                    <div class="status">
                        <p>Server is running but main platform file not found.</p>
                        <p>Please check deployment status.</p>
                    </div>
                </div>
            </body>
            </html>
        `);
    }
});

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
    console.log(`🚀 Platform: http://localhost:${PORT}/`);
});

module.exports = app; 