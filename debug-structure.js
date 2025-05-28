const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging file structure...');
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);

// Check if files exist
const filesToCheck = [
  'package.json',
  'server/index.js',
  'server/package.json',
  'client/package.json',
  'render.yaml'
];

console.log('\n📁 File existence check:');
filesToCheck.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// List directory contents
console.log('\n📂 Root directory contents:');
try {
  const files = fs.readdirSync('.');
  files.forEach(file => {
    const stats = fs.statSync(file);
    console.log(`${stats.isDirectory() ? '📁' : '📄'} ${file}`);
  });
} catch (error) {
  console.log('❌ Error reading directory:', error.message);
}

// Check server directory
console.log('\n📂 Server directory contents:');
try {
  const serverFiles = fs.readdirSync('./server');
  serverFiles.forEach(file => {
    const stats = fs.statSync(path.join('./server', file));
    console.log(`${stats.isDirectory() ? '📁' : '📄'} server/${file}`);
  });
} catch (error) {
  console.log('❌ Server directory not found or error:', error.message);
}

console.log('\n🎯 Recommended fixes:');
console.log('1. Ensure all files are uploaded to GitHub');
console.log('2. Use "npm start" as start command');
console.log('3. Check build logs for missing dependencies'); 