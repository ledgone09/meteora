@echo off
echo 🚀 Starting Meteora Token Launcher...
echo.

echo 📦 Installing dependencies...
call npm run install-all

echo.
echo 🌟 Starting servers...
echo Backend API will run on: http://localhost:5000
echo Frontend App will run on: http://localhost:3000
echo.

start "Backend Server" cmd /k "cd server && npm run dev"
timeout /t 3 /nobreak > nul
start "Frontend App" cmd /k "cd client && npm start"

echo ✅ Both servers are starting...
echo 📖 Check the opened terminal windows for detailed logs
echo.
echo 🌐 Open your browser and go to: http://localhost:3000
pause 