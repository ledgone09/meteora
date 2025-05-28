# 🚀 Meteora Token Launcher

**Create Solana tokens with instant Meteora DLMM liquidity in under 60 seconds!**

A streamlined platform for launching SPL tokens with professional-grade liquidity pools, anti-sniper protection, and instant trading on Jupiter.

## ✨ Features

### 🎯 **One-Click Token Launch**
- **3-Field Form**: Token Name, Symbol, Logo upload
- **Auto-Generated**: 1B supply, 9 decimals, optimized metadata
- **Instant Deploy**: From form to trading in under 60 seconds

### 💧 **Professional Liquidity (Meteora DLMM)**
- **Instant Trading**: Available on Jupiter immediately
- **Single-Sided Liquidity**: No need to provide SOL pairs
- **Dynamic Fees**: Automatic fee adjustment during volatility
- **Professional Setup**: Industry-standard DLMM pools

### 🛡️ **Anti-Sniper Protection (Premium)**
- **Alpha Vault Integration**: Prevents bot sniping
- **Whitelist System**: Fair launch for real users
- **Time-Delayed Activation**: 5-minute protection window

### 💰 **Affordable Pricing**
- **Basic Launch**: **0.02 SOL** (~$0.50) - Standard token + liquidity
- **Premium Launch**: **0.1 SOL** (~$2.50) - Includes anti-sniper protection

## 🏗️ Architecture

### **Single Service Deployment**
- **Frontend**: React with Tailwind CSS
- **Backend**: Node.js/Express API
- **Database**: PostgreSQL (optional)
- **Hosting**: Single Render.com web service

### **Tech Stack**
- **Solana**: SPL Token Program, Metaplex
- **Meteora**: DLMM SDK for liquidity pools
- **IPFS**: Decentralized metadata storage
- **React**: Modern UI with wallet integration

## 🚀 Quick Deploy to Render.com

### **1. Fork & Deploy**
```bash
# 1. Fork this repository
# 2. Connect to Render.com
# 3. Set environment variables
# 4. Deploy!
```

### **2. Environment Variables**
```env
NODE_ENV=production
PORT=10000
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
CORS_ORIGIN=*
```

### **3. Build Commands**
- **Build**: `npm run build:all`
- **Start**: `npm start`

**📖 [Complete Deployment Guide](./RENDER_DEPLOYMENT.md)**

## 🛠️ Local Development

### **Prerequisites**
- Node.js 18+
- npm or yarn
- Git

### **Setup**
```bash
# Clone repository
git clone <your-repo-url>
cd meteora-token-launcher

# Install all dependencies
npm run install-all

# Start development servers
npm run dev
```

### **Development URLs**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 📁 Project Structure

```
meteora-token-launcher/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Route pages
│   │   └── App.js          # Main app
│   └── build/              # Production build
├── server/                 # Node.js backend
│   ├── routes/             # API endpoints
│   ├── services/           # Business logic
│   ├── models/             # Database models
│   └── index.js            # Server entry
├── render.yaml             # Render.com config
└── package.json            # Root dependencies
```

## 🔌 API Endpoints

### **Token Management**
- `POST /api/tokens/create` - Create new token + pool
- `GET /api/tokens/recent` - Get recent launches
- `GET /api/tokens/:mint` - Get token details

### **Pool Statistics**
- `GET /api/pools/:address` - Get pool stats
- `GET /api/pools/stats` - Platform statistics

### **File Upload**
- `POST /api/upload/logo` - Upload token logo to IPFS

### **System**
- `GET /health` - Health check + pricing info
- `GET /api` - API documentation

## 💡 Usage Flow

### **For Users**
1. **Connect Wallet** (Phantom, Solflare, etc.)
2. **Fill Form** (Name, Symbol, Logo)
3. **Choose Plan** (Basic 0.02 SOL / Premium 0.1 SOL)
4. **Deploy Token** (Automatic pool creation)
5. **Start Trading** (Instant Jupiter integration)

### **For Developers**
1. **Fork Repository**
2. **Deploy to Render.com**
3. **Configure Environment**
4. **Customize Features**
5. **Launch Platform**

## 🔧 Configuration

### **Token Defaults**
```javascript
{
  supply: 1000000000,      // 1B tokens
  decimals: 9,             // Standard precision
  initialPrice: 0.0001,    // $0.0001 per token
  creatorAllocation: 0.8   // 80% to creator
}
```

### **Pool Templates**
```javascript
basic: {
  binStep: 100,           // 1% price steps
  baseFee: 25,            // 0.25% base fee
  alphaVault: false       // No anti-sniper
}

premium: {
  binStep: 50,            // 0.5% price steps
  baseFee: 25,            // 0.25% base fee
  alphaVault: true,       // Anti-sniper protection
  protectionDuration: 300 // 5 minutes
}
```

## 🛡️ Security Features

### **Built-in Protection**
- Rate limiting (100 requests/15min)
- Input validation and sanitization
- CORS configuration
- Helmet security headers

### **Solana Security**
- Secure key management
- Transaction verification
- Network validation
- Error handling

## 📊 Monitoring

### **Health Monitoring**
```bash
curl https://your-app.onrender.com/health
```

### **Platform Statistics**
- Total tokens launched
- Total liquidity created
- Platform revenue
- User engagement

## 🎯 Roadmap

### **Phase 1** ✅
- [x] Basic token creation
- [x] Meteora DLMM integration
- [x] React frontend
- [x] Render.com deployment

### **Phase 2** 🚧
- [ ] Advanced pool configurations
- [ ] Token analytics dashboard
- [ ] Social features (comments, ratings)
- [ ] Mobile app

### **Phase 3** 📋
- [ ] Multi-chain support
- [ ] Advanced trading features
- [ ] DAO governance
- [ ] Revenue sharing

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### **Documentation**
- [Deployment Guide](./RENDER_DEPLOYMENT.md)
- [API Documentation](https://your-app.onrender.com/api)

### **Community**
- GitHub Issues for bugs
- Discussions for features
- Discord for real-time help

### **Professional Support**
- Custom deployment assistance
- Feature development
- Integration support

---

## 🎉 Ready to Launch?

**Deploy your Meteora Token Launcher in 5 minutes:**

1. **Fork** this repository
2. **Connect** to Render.com
3. **Configure** environment variables
4. **Deploy** and start earning!

**💰 Estimated Revenue**: $50-500/day with moderate usage
**🚀 Time to Market**: Under 10 minutes
**💸 Total Cost**: ~$7/month (Render.com hosting)

---

*Built with ❤️ for the Solana ecosystem* 