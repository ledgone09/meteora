#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Meteora Token Launcher...\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Please run this script from the project root directory');
  process.exit(1);
}

// Function to run commands
function runCommand(command, description) {
  console.log(`📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

// Function to copy file if it doesn't exist
function copyFileIfNotExists(source, destination, description) {
  if (!fs.existsSync(destination)) {
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, destination);
      console.log(`✅ ${description} created`);
    } else {
      console.log(`⚠️  ${source} not found, skipping ${description}`);
    }
  } else {
    console.log(`✅ ${description} already exists`);
  }
}

// Function to create directory if it doesn't exist
function createDirIfNotExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
}

try {
  // 1. Install root dependencies
  runCommand('npm install', 'Installing root dependencies');

  // 2. Install server dependencies
  runCommand('cd server && npm install', 'Installing server dependencies');

  // 3. Install client dependencies
  runCommand('cd client && npm install', 'Installing client dependencies');

  // 4. Copy environment files
  console.log('📋 Setting up environment files...');
  copyFileIfNotExists('server/config.example.js', 'server/config.js', 'Server config');
  copyFileIfNotExists('client/env.example', 'client/.env', 'Client environment');

  // 5. Create necessary directories
  console.log('📁 Creating necessary directories...');
  createDirIfNotExists('server/temp');
  createDirIfNotExists('server/logs');

  // 6. Setup database (optional)
  console.log('🗄️  Database setup...');
  try {
    runCommand('cd server && npm run setup-db', 'Setting up database');
  } catch (error) {
    console.log('⚠️  Database setup failed - you may need to configure PostgreSQL first');
    console.log('   See README.md for database setup instructions');
  }

  // Success message
  console.log('🎉 Setup completed successfully!\n');
  console.log('📚 Next steps:');
  console.log('   1. Configure your environment variables in server/config.js and client/.env');
  console.log('   2. Set up PostgreSQL database (if not done automatically)');
  console.log('   3. Add your Solana private key to server/config.js');
  console.log('   4. Configure IPFS settings for file uploads');
  console.log('   5. Run "npm run dev" to start the development server\n');
  
  console.log('🔗 Useful commands:');
  console.log('   npm run dev        - Start both client and server');
  console.log('   npm run server     - Start only the server');
  console.log('   npm run client     - Start only the client');
  console.log('   npm run build      - Build for production\n');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
} 