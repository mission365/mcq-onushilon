@echo off
setlocal enabledelayedexpansion
title MCQOnushilon - Unified Development Runner (Windows)

echo ======================================================================
echo             MCQOnushilon Unified Development Runner
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
        echo [INFO] Created .env. Please configure your DATABASE_URL and SMTP credentials.
    ) else (
        echo [WARN] Neither .env nor .env.example found!
    )
)

echo.
echo [INFO] Environment check complete.
echo.
echo Starting Services:
echo   * [SERVER :8787] Express Backend API (tsx watch server/index.ts)
echo   * [CLIENT :3000] Vite Frontend Client (http://localhost:3000)
echo.
echo Press Ctrl+C at any time in this window to stop both services.
echo ======================================================================
echo.

:: 5. Launch both server and client together using concurrently
call npx concurrently -n "SERVER,CLIENT" -c "cyan,green" "npm run dev:server" "npm run dev:client"

pause
