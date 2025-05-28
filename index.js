const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
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
            padding: 20px;
        }
        .container { max-width: 800px; margin: 0 auto; }
        .header {
            background: rgba(0,0,0,0.2);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 30px;
            text-align: center;
        }
        .logo { font-size: 48px; margin-bottom: 10px; }
        h1 { font-size: 36px; margin-bottom: 10px; }
        .subtitle { opacity: 0.8; font-size: 18px; }
        .card {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 20px;
        }
        .btn {
            background: linear-gradient(45deg, #9333ea, #3b82f6);
            border: none;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            width: 100%;
            margin: 10px 0;
            transition: transform 0.2s;
        }
        .btn:hover { transform: scale(1.02); }
        .form-group { margin-bottom: 20px; }
        .form-label { display: block; margin-bottom: 8px; font-weight: 500; }
        .form-input {
            width: 100%;
            padding: 12px;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 8px;
            color: white;
            font-size: 14px;
        }
        .form-input::placeholder { color: rgba(255,255,255,0.7); }
        .pricing {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 30px;
        }
        .price-card {
            background: rgba(255,255,255,0.05);
            border: 2px solid rgba(255,255,255,0.2);
            border-radius: 15px;
            padding: 20px;
            text-align: center;
        }
        .price-card.premium { border-color: #9333ea; }
        .price { font-size: 24px; font-weight: bold; margin: 10px 0; }
        .hidden { display: none; }
        @media (max-width: 768px) {
            .pricing { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🚀</div>
            <h1>Meteora Token Launcher</h1>
            <p class="subtitle">Create tokens + liquidity in under 60 seconds</p>
        </div>

        <div class="card">
            <h2>Create Your Token</h2>
            <p style="margin-bottom: 20px; opacity: 0.8;">Launch your token with instant Meteora DLMM liquidity</p>
            
            <div id="wallet-prompt">
                <p style="text-align: center; margin: 30px 0;">Connect your wallet to get started</p>
                <button class="btn" onclick="connectWallet()">Connect Wallet</button>
            </div>

            <form id="token-form" class="hidden">
                <div class="form-group">
                    <label class="form-label">Token Name</label>
                    <input type="text" class="form-input" placeholder="e.g., My Awesome Token" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Token Symbol</label>
                    <input type="text" class="form-input" placeholder="e.g., MAT" maxlength="10" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Token Logo</label>
                    <input type="file" class="form-input" accept="image/*" required>
                </div>
                <button type="submit" class="btn">🚀 Create Token (0.02 SOL)</button>
            </form>
        </div>

        <div class="card">
            <h2>Simple Pricing</h2>
            <div class="pricing">
                <div class="price-card">
                    <h3>Basic Launch</h3>
                    <div class="price">0.02 SOL</div>
                    <p>~$1 • Perfect for getting started</p>
                    <ul style="text-align: left; margin-top: 15px;">
                        <li>✅ Token creation</li>
                        <li>✅ Meteora DLMM pool</li>
                        <li>✅ Jupiter integration</li>
                    </ul>
                </div>
                <div class="price-card premium">
                    <h3>Premium Launch</h3>
                    <div class="price">0.1 SOL</div>
                    <p>~$2.5 • Professional features</p>
                    <ul style="text-align: left; margin-top: 15px;">
                        <li>✅ Everything in Basic</li>
                        <li>💎 Anti-sniper protection</li>
                        <li>💎 Priority support</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <script>
        function connectWallet() {
            document.getElementById('wallet-prompt').classList.add('hidden');
            document.getElementById('token-form').classList.remove('hidden');
            showToast('Wallet connected successfully! 🚀', '#10b981');
        }

        function showToast(message, color) {
            const toast = document.createElement('div');
            toast.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 1000; background: ' + color + '; color: white; padding: 15px; border-radius: 8px; font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);';
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }

        document.getElementById('token-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const btn = e.target.querySelector('button');
            const originalText = btn.textContent;
            
            btn.textContent = '⏳ Creating Token...';
            btn.disabled = true;
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
                showToast('🎉 Token created successfully!', '#10b981');
                this.reset();
            }, 2000);
        });
    </script>
</body>
</html>
  `);
});

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});

module.exports = app; 