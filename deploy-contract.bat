@echo off
REM TrustPay Smart Contract Deployment Script for Windows

echo ========================================
echo TrustPay Smart Contract Deployment
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "blockchain" (
    echo Error: blockchain directory not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

cd blockchain

echo Step 1: Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo Dependencies already installed.
)

echo.
echo Step 2: Checking environment configuration...
if not exist ".env" (
    echo Warning: .env file not found!
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit blockchain/.env and add your:
    echo   - PRIVATE_KEY
    echo   - POLYGONSCAN_API_KEY (optional)
    echo.
    echo After updating .env, run this script again.
    pause
    exit /b 1
)

echo.
echo Step 3: Compiling contract...
call npm run compile
if errorlevel 1 (
    echo Error: Compilation failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo Select Deployment Network:
echo ========================================
echo 1. Amoy Testnet (Recommended for testing)
echo 2. Polygon Mainnet (Production)
echo 3. Local Hardhat Network
echo 4. Cancel
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo.
    echo Deploying to Amoy Testnet...
    echo Make sure you have test POL from https://faucet.polygon.technology/
    echo.
    pause
    call npm run deploy:amoy
) else if "%choice%"=="2" (
    echo.
    echo WARNING: You are about to deploy to MAINNET!
    echo This will cost real MATIC tokens.
    echo.
    set /p confirm="Are you sure? Type YES to continue: "
    if /i "%confirm%"=="YES" (
        call npm run deploy:polygon
    ) else (
        echo Deployment cancelled.
        pause
        exit /b 0
    )
) else if "%choice%"=="3" (
    echo.
    echo Deploying to Local Hardhat Network...
    call npm run deploy:local
) else (
    echo Deployment cancelled.
    pause
    exit /b 0
)

if errorlevel 1 (
    echo.
    echo ========================================
    echo Deployment Failed!
    echo ========================================
    echo.
    echo Common issues:
    echo - Insufficient MATIC for gas fees
    echo - Invalid private key in .env
    echo - Network connection issues
    echo.
    echo Check SMART_CONTRACT_DEPLOYMENT.md for troubleshooting.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Deployment Successful!
echo ========================================
echo.
echo Next steps:
echo 1. Check deployments/ folder for contract address
echo 2. Update backend/.env with CONTRACT_ADDRESS
echo 3. Restart your backend service
echo.
echo View deployment details:
if "%choice%"=="1" (
    type deployments\amoy.json
    echo.
    echo View on explorer: https://amoy.polygonscan.com/
) else if "%choice%"=="2" (
    type deployments\polygon.json
    echo.
    echo View on explorer: https://polygonscan.com/
)

cd ..
echo.
pause
