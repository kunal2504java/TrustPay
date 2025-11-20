@echo off
echo ========================================
echo   TrustPay Frontend - Vercel Deployment
echo ========================================
echo.

cd frontend

echo [1/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b %errorlevel%
)

echo.
echo [2/4] Building project...
call npm run build
if %errorlevel% neq 0 (
    echo Error: Build failed
    pause
    exit /b %errorlevel%
)

echo.
echo [3/4] Checking Vercel CLI...
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo Vercel CLI not found. Installing...
    call npm install -g vercel
)

echo.
echo [4/4] Deploying to Vercel...
echo.
echo Choose deployment type:
echo 1. Preview (staging)
echo 2. Production
echo.
set /p choice="Enter choice (1 or 2): "

if "%choice%"=="1" (
    echo Deploying to preview...
    call vercel
) else if "%choice%"=="2" (
    echo Deploying to production...
    call vercel --prod
) else (
    echo Invalid choice. Deploying to preview by default...
    call vercel
)

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
pause
