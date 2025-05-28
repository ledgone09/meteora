# Deployment Guide - Meteora Token Launcher

This guide covers deploying the Meteora Token Launcher to production environments.

## 🚀 Production Deployment

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Domain name with SSL certificate
- Solana mainnet RPC endpoint
- IPFS storage solution (Infura, Pinata, or self-hosted)

### Environment Setup

#### 1. Server Configuration

Create `server/config.js` for production:

```javascript
module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: 'production',
  
  solana: {
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    network: 'mainnet-beta',
    commitment: 'confirmed'
  },
  
  database: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  },
  
  ipfs: {
    apiUrl: process.env.IPFS_API_URL,
    projectId: process.env.IPFS_PROJECT_ID,
    projectSecret: process.env.IPFS_PROJECT_SECRET,
    gateway: 'https://ipfs.io/ipfs/'
  },
  
  security: {
    jwtSecret: process.env.JWT_SECRET,
    corsOrigin: process.env.CORS_ORIGIN || 'https://yourdomain.com'
  }
};
```

#### 2. Environment Variables

Set these environment variables in your production environment:

```bash
# Server
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/database
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
PLATFORM_PRIVATE_KEY=[your_solana_private_key_array]

# IPFS
IPFS_API_URL=https://ipfs.infura.io:5001
IPFS_PROJECT_ID=your_infura_project_id
IPFS_PROJECT_SECRET=your_infura_project_secret

# Security
JWT_SECRET=your_secure_jwt_secret
CORS_ORIGIN=https://yourdomain.com

# Client
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_SOLANA_NETWORK=mainnet-beta
REACT_APP_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

### Deployment Options

## Option 1: Vercel + Railway

### Frontend (Vercel)

1. **Build the client:**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Vercel:**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **Configure environment variables in Vercel dashboard**

### Backend (Railway)

1. **Create `railway.json`:**
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "cd server && npm start",
       "healthcheckPath": "/health"
     }
   }
   ```

2. **Deploy to Railway:**
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   railway up
   ```

## Option 2: Docker Deployment

### 1. Create Dockerfiles

**Root Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci --only=production
RUN cd server && npm ci --only=production
RUN cd client && npm ci --only=production

# Copy source code
COPY . .

# Build client
RUN cd client && npm run build

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/meteora_launcher
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=meteora_launcher
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

### 2. Deploy with Docker

```bash
# Build and start
docker-compose up -d

# Check logs
docker-compose logs -f

# Update deployment
docker-compose pull
docker-compose up -d
```

## Option 3: VPS Deployment

### 1. Server Setup (Ubuntu 22.04)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

### 2. Database Setup

```bash
# Create database
sudo -u postgres createdb meteora_launcher
sudo -u postgres createuser --interactive

# Run migrations
cd server
npm run setup-db
```

### 3. Application Setup

```bash
# Clone repository
git clone <your-repo>
cd meteora-token-launcher

# Install dependencies
npm run install-all

# Build client
cd client && npm run build

# Setup PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'meteora-launcher',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
```

### 4. Nginx Configuration

**/etc/nginx/sites-available/meteora-launcher:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;

    # Serve static files
    location / {
        root /path/to/meteora-token-launcher/client/build;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/meteora-launcher /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit private keys or secrets
- Use environment variable management (Railway Variables, Vercel Environment Variables)
- Rotate secrets regularly

### 2. Database Security
- Use strong passwords
- Enable SSL connections
- Regular backups
- Restrict network access

### 3. API Security
- Rate limiting (already implemented)
- CORS configuration
- Input validation
- File upload restrictions

### 4. Solana Security
- Use dedicated wallet for platform operations
- Monitor wallet balance
- Implement transaction limits
- Regular security audits

## 📊 Monitoring & Maintenance

### 1. Application Monitoring

```bash
# PM2 monitoring
pm2 monit

# Check logs
pm2 logs meteora-launcher

# Restart application
pm2 restart meteora-launcher
```

### 2. Database Monitoring

```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('meteora_launcher'));

-- Monitor active connections
SELECT count(*) FROM pg_stat_activity;

-- Check recent launches
SELECT COUNT(*) FROM token_launches WHERE created_at > NOW() - INTERVAL '24 hours';
```

### 3. Health Checks

Set up monitoring for:
- `/health` endpoint
- Database connectivity
- IPFS availability
- Solana RPC status

### 4. Backup Strategy

```bash
# Database backup
pg_dump meteora_launcher > backup_$(date +%Y%m%d).sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump meteora_launcher | gzip > $BACKUP_DIR/meteora_launcher_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "meteora_launcher_*.sql.gz" -mtime +7 -delete
```

## 🚀 Performance Optimization

### 1. Client Optimization
- Enable gzip compression
- Use CDN for static assets
- Implement caching headers
- Optimize images

### 2. Server Optimization
- Database indexing
- Connection pooling
- Caching frequently accessed data
- Load balancing for high traffic

### 3. Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX CONCURRENTLY idx_token_launches_created_at ON token_launches(created_at DESC);
CREATE INDEX CONCURRENTLY idx_pool_statistics_volume ON pool_statistics(volume_24h DESC);
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Multiple server instances behind load balancer
- Database read replicas
- Separate IPFS storage service
- CDN for global distribution

### Vertical Scaling
- Increase server resources
- Database performance tuning
- Memory optimization
- CPU optimization

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check connection string
   - Verify database is running
   - Check firewall settings

2. **IPFS Upload Failures**
   - Verify IPFS credentials
   - Check file size limits
   - Monitor IPFS service status

3. **Solana Transaction Failures**
   - Check RPC endpoint status
   - Verify wallet balance
   - Monitor network congestion

4. **Build Failures**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify environment variables

### Logs and Debugging

```bash
# Server logs
tail -f server/logs/app.log

# PM2 logs
pm2 logs meteora-launcher --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

This deployment guide provides comprehensive instructions for deploying the Meteora Token Launcher to production. Choose the deployment option that best fits your infrastructure and requirements. 