@echo off
echo ========================================
echo TUNIFY DIAGNOSTIC VERIFICATION
echo ========================================
echo.

echo [1/5] Checking Backend Server...
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Backend server is running
) else (
    echo ✗ Backend server is NOT running
    echo   Run: npm run dev
)
echo.

echo [2/5] Checking Frontend Server...
curl -s http://localhost:8080 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Frontend server is running
) else (
    echo ✗ Frontend server is NOT running
    echo   Run: cd frontend ^&^& npm start
)
echo.

echo [3/5] Checking Diagnostic Files...
if exist "DIAGNOSTIC_LOGGING_COMPLETE.md" (
    echo ✓ DIAGNOSTIC_LOGGING_COMPLETE.md
) else (
    echo ✗ Missing DIAGNOSTIC_LOGGING_COMPLETE.md
)

if exist "TEST_INSTRUCTIONS.md" (
    echo ✓ TEST_INSTRUCTIONS.md
) else (
    echo ✗ Missing TEST_INSTRUCTIONS.md
)

if exist "ROOT_CAUSE_ANALYSIS.md" (
    echo ✓ ROOT_CAUSE_ANALYSIS.md
) else (
    echo ✗ Missing ROOT_CAUSE_ANALYSIS.md
)

if exist "DIAGNOSTIC_SUMMARY.md" (
    echo ✓ DIAGNOSTIC_SUMMARY.md
) else (
    echo ✗ Missing DIAGNOSTIC_SUMMARY.md
)
echo.

echo [4/5] Checking Backend Logging Files...
if exist "backend\middleware\logger.js" (
    echo ✓ backend\middleware\logger.js
) else (
    echo ✗ Missing backend\middleware\logger.js
)

if exist "backend\tests\auth.test.js" (
    echo ✓ backend\tests\auth.test.js
) else (
    echo ✗ Missing backend\tests\auth.test.js
)

if exist "backend\tests\songs.test.js" (
    echo ✓ backend\tests\songs.test.js
) else (
    echo ✗ Missing backend\tests\songs.test.js
)
echo.

echo [5/5] Checking Frontend Logging...
findstr /C:"[AUDIO]" "frontend\app\services\PlayerService.js" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Audio event logging implemented
) else (
    echo ✗ Audio event logging NOT found
)

findstr /C:"PLAY SONG" "frontend\app\services\PlayerService.js" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Play song logging implemented
) else (
    echo ✗ Play song logging NOT found
)
echo.

echo ========================================
echo VERIFICATION COMPLETE
echo ========================================
echo.
echo Next Steps:
echo 1. Open browser to http://localhost:8080
echo 2. Open DevTools (F12) and go to Console tab
echo 3. Watch backend terminal for logs
echo 4. Test features and observe logs
echo.
echo Documentation:
echo - DIAGNOSTIC_SUMMARY.md - Overview
echo - TEST_INSTRUCTIONS.md - Testing guide
echo - ROOT_CAUSE_ANALYSIS.md - Issue solutions
echo.
pause
