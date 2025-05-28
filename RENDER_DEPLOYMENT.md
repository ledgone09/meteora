# 🚀 Render.com Deployment Guide

Deploy your Meteora Token Launcher as a single web service on Render.com.

## 📋 Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **Render.com Account**: Sign up at [render.com](https://render.com)
3. **Solana Wallet**: For platform operations (optional for testing)

## 🔧 Deployment Steps

### 1. **Connect GitHub Repository**

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your `meteora-token-launcher` repository

### 2. **Configure Web Service**

**Basic Settings:**
- **Name**: `meteora-token-launcher`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)

**Build & Deploy:**
- **Build Command**: `npm run build:all`
- **Start Command**: `npm start`
- **Node Version**: `18` (or latest LTS)

### 3. **Environment Variables**

Add these environment variables in Render:

**Required:**
```
NODE_ENV=production
PORT=10000
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
CORS_ORIGIN=*
```

**Optional (for production features):**
```
DATABASE_URL=your_postgresql_connection_string
IPFS_PROJECT_ID=your_infura_project_id
IPFS_PROJECT_SECRET=your_infura_project_secret
PLATFORM_PRIVATE_KEY=your_platform_wallet_private_key_array
JWT_SECRET=your_secure_jwt_secret
```

### 4. **Deploy**

1. Click **"Create Web Service"**
2. Render will automatically:
   - Install dependencies
   - Build the React frontend
   - Start the Node.js server
   - Serve everything from one URL

## 🌐 Access Your Application

After deployment, your app will be available at:
```
https://your-service-name.onrender.com
```

## 💰 Updated Pricing

Your platform now uses the new pricing structure:
- **Basic Launch**: 0.02 SOL (~$0.50)
- **Premium Launch**: 0.1 SOL (~$2.50)

## 🔧 Configuration Details

### **Single Service Architecture**
- Frontend (React) served as static files
- Backend (Node.js) handles API requests
- All routes served from same domain
- No CORS issues in production

### **File Structure in Production**
```
/
├── /api/*          # Backend API routes
├── /health         # Health check endpoint
├── /uploads/*      # File uploads
└── /*              # React app (SPA routing)
```

## 🛠️ Troubleshooting

### **Build Fails**
- Check Node.js version (use 18+)
- Verify all dependencies are in package.json
- Check build logs for specific errors

### **App Won't Start**
- Verify `PORT` environment variable is set
- Check start command: `npm start`
- Review application logs

### **API Errors**
- Ensure environment variables are set
- Check Solana RPC URL is accessible
- Verify CORS settings

### **Database Issues**
- App works without database in development mode
- For production, add PostgreSQL database
- Set `DATABASE_URL` environment variable

## 🚀 Production Optimizations

### **Add PostgreSQL Database**
1. In Render Dashboard: **"New +"** → **"PostgreSQL"**
2. Copy connection string to `DATABASE_URL`
3. Database will auto-initialize on first run

### **Custom Domain**
1. Go to your service settings
2. Add custom domain
3. Configure DNS records

### **Environment-Specific Settings**
```bash
# Development
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com

# Production
SOLANA_NETWORK=mainnet-beta
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

## 📊 Monitoring

### **Health Check**
- Endpoint: `https://your-app.onrender.com/health`
- Returns: Server status, pricing, environment info

### **Logs**
- View real-time logs in Render Dashboard
- Monitor API requests and errors
- Track token creation activity

## 🔐 Security Considerations

### **Environment Variables**
- Never commit secrets to Git
- Use Render's environment variable system
- Rotate keys regularly

### **CORS Configuration**
- Production: Set specific origins
- Development: Use `*` for testing

### **Rate Limiting**
- Built-in rate limiting (100 requests/15min)
- Adjust in `server/config.js` if needed

## 💡 Tips for Success

1. **Test Locally First**: Ensure everything works with `npm run build:all && npm start`
2. **Monitor Costs**: Render's starter plan should be sufficient for testing
3. **Scale Gradually**: Upgrade plan as usage grows
4. **Backup Data**: Export token launch data regularly
5. **Update Dependencies**: Keep packages updated for security

## 🎯 Next Steps After Deployment

1. **Test Token Creation**: Create a test token to verify functionality
2. **Monitor Performance**: Check response times and error rates
3. **Set Up Analytics**: Track user engagement and token launches
4. **Marketing**: Share your platform with the Solana community
5. **Iterate**: Add features based on user feedback

---

**🎉 Your Meteora Token Launcher is now live on Render.com!**

**Estimated Deployment Time**: 5-10 minutes
**Monthly Cost**: ~$7 (Render Starter Plan)
**Scaling**: Automatic with traffic 