@echo off
echo ========================================
echo Spotify Clone - Installation Script
echo ========================================
echo.

echo [1/4] Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend installation failed!
    pause
    exit /b 1
)
echo Backend dependencies installed successfully!
echo.

echo [2/4] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend installation failed!
    pause
    exit /b 1
)
cd ..
echo Frontend dependencies installed successfully!
echo.

echo [3/4] Creating uploads directory...
if not exist "uploads" mkdir uploads
echo Uploads directory created!
echo.

echo [4/4] Checking MongoDB...
net start MongoDB >nul 2>&1
if %errorlevel% equ 0 (
    echo MongoDB is running!
) else (
    echo WARNING: MongoDB is not running or not installed
    echo Please install MongoDB and start it manually
)
echo.

echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Ensure MongoDB is running
echo 2. Update .env file if needed
echo 3. Run 'npm run dev' to start backend
echo 4. Run 'cd frontend && npm start' to start frontend
echo 5. Open http://localhost:8080 in your browser
echo.
echo For detailed instructions, see QUICKSTART.md
echo.
pause
