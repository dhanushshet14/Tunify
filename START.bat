@echo off
echo ========================================
echo Spotify Clone - Starting Application
echo ========================================
echo.

echo Checking MongoDB...
net start MongoDB >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: MongoDB is not running!
    echo Please start MongoDB manually
    pause
    exit /b 1
)
echo MongoDB is running!
echo.

echo Starting backend server...
start "Spotify Backend" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
echo.

echo Starting frontend server...
start "Spotify Frontend" cmd /k "cd frontend && npm start"
echo.

echo ========================================
echo Application Starting!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:8080
echo.
echo Two terminal windows have been opened:
echo 1. Backend Server (Node.js)
echo 2. Frontend Server (http-server)
echo.
echo Open http://localhost:8080 in your browser
echo.
echo Press any key to exit this window...
pause >nul
