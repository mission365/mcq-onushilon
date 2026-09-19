@echo off
setlocal enabledelayedexpansion
title MCQOnushilon - Unified Development Runner (Windows)

echo ======================================================================
echo             MCQOnushilon Unified Development Runner (Windows)
echo ======================================================================
echo.

cd /d "%~dp0"

:: 1. Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not found in PATH!
    echo Please download and install Node.js (LTS version) from:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: 2. Check npm
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm is not found in PATH!
    pause
    exit /b 1
)

:: 3. Check node_modules
if not exist "node_modules\" (
    echo [INFO] node_modules not found. Installing dependencies...
    echo Running "npm install"...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] npm install failed. Please check your internet connection or Node version.
        pause
        exit /b 1
    )
)

:: 4. Check .env file
if not exist ".env" (
    if exist ".env.example" (
        echo [WARN] No .env file found. Copying .env.example to .env...
        copy ".env.example" ".env" >nul
        echo [INFO] Created .env. Please configure your DATABASE_URL and Firebase/bKash credentials.
    ) else (
        echo [WARN] Neither .env nor .env.example found!
    )
)

:: 5. Free occupied ports (8787 and 3000) if lingering from previous run
echo [INFO] Checking for lingering processes on ports 8787 and 3000...
for /f "tokens=5" %%p in ('netstat -aon ^| findstr /r /c:":8787 .*LISTENING"') do (
    echo [WARN] Port 8787 is occupied by PID %%p. Freeing port...
    taskkill /f /pid %%p >nul 2>&1
)
for /f "tokens=5" %%p in ('netstat -aon ^| findstr /r /c:":3000 .*LISTENING"') do (
    echo [WARN] Port 3000 is occupied by PID %%p. Freeing port...
    taskkill /f /pid %%p >nul 2>&1
)

:: 6. Check PostgreSQL port 5432
netstat -aon | findstr /r /c:":5432 .*LISTENING" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [WARN] PostgreSQL does not appear to be listening on port 5432.
    echo Ensure PostgreSQL service is Running in Windows Services (services.msc).
)

echo.
echo [INFO] Environment check complete.
echo.
echo ======================================================================
echo          MCQOnushilon Development Environment (Windows)
echo ======================================================================
echo   * Backend API :  http://localhost:8787 (Express API)
echo   * Frontend UI :  http://localhost:3000 (Vite Client)
echo   * Press Ctrl+C at any time to stop both services cleanly.
echo ======================================================================
echo.

:: 7. Launch both server and client together using concurrently with -k (kill others on exit)
call npx concurrently -k -n "SERVER,CLIENT" -c "cyan,green" "npm run dev:server" "npm run dev:client"

:: 8. Clean up any remaining processes on ports when terminated
for /f "tokens=5" %%p in ('netstat -aon ^| findstr /r /c:":8787 .*LISTENING"') do (
    taskkill /f /pid %%p >nul 2>&1
)
for /f "tokens=5" %%p in ('netstat -aon ^| findstr /r /c:":3000 .*LISTENING"') do (
    taskkill /f /pid %%p >nul 2>&1
)

echo.
echo [INFO] All services stopped successfully.
pause
