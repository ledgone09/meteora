// Root index.js - Entry point for Render.com deployment
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Meteora Token Launcher...');
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);

// Check if server directory exists
const serverPath = path.join(__dirname, 'server');
const serverIndexPath = path.join(serverPath, 'index.js');

console.log('Looking for server at:', serverIndexPath);

if (fs.existsSync(serverIndexPath)) {
  console.log('✅ Server file found, starting server...');
  // Change working directory to server folder
  process.chdir(serverPath);
  console.log('Changed working directory to:', process.cwd());
  
  // Start the server
  require('./server/index.js');
} else {
  console.log('❌ Server file not found!');
  console.log('📂 Available files in root:');
  
  try {
    const files = fs.readdirSync(__dirname);
    files.forEach(file => {
      const stats = fs.statSync(path.join(__dirname, file));
      console.log(`${stats.isDirectory() ? '📁' : '📄'} ${file}`);
    });
  } catch (error) {
    console.log('Error reading directory:', error.message);
  }
  
  console.log('\n🎯 Please ensure the server folder and files are uploaded to GitHub');
  process.exit(1);
} 