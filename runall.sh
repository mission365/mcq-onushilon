#!/usr/bin/env bash

# ==============================================================================
# MCQOnushilon - Unified Development Runner
# Starts both the Express backend API (:8787) and Vite frontend client (:3000)
# ==============================================================================

set -m # Enable job control

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# Text Colors
CLR_RESET="\033[0m"
CLR_BOLD="\033[1m"
CLR_BLUE="\033[1;34m"
CLR_CYAN="\033[1;36m"
CLR_GREEN="\033[1;32m"
CLR_YELLOW="\033[1;33m"
CLR_RED="\033[1;31m"
CLR_MAGENTA="\033[1;35m"

log_info() {
  echo -e "${CLR_BLUE}[MCQOnushilon]${CLR_RESET} $1"
}

log_server() {
  echo -e "${CLR_CYAN}[SERVER :8787]${CLR_RESET} $1"
}

log_client() {
  echo -e "${CLR_GREEN}[CLIENT :3000]${CLR_RESET} $1"
}

log_warn() {
  echo -e "${CLR_YELLOW}[WARNING]${CLR_RESET} $1"
}

log_err() {
  echo -e "${CLR_RED}[ERROR]${CLR_RESET} $1"
}

# 1. Check prerequisites
if ! command -v node >/dev/null 2>&1; then
  log_err "Node.js is not installed or not found in PATH."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  log_err "npm is not installed or not found in PATH."
  exit 1
fi

# 2. Check dependencies
if [ ! -d "node_modules" ]; then
  log_warn "node_modules not found. Installing dependencies..."
  npm install
fi

# 3. Check environment file
if [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
  if [ -f ".env.example" ]; then
    log_warn "No .env file found. Creating .env from .env.example..."
    cp .env.example .env
    log_info "Created .env. Please configure your Firebase and bKash credentials."
  fi
fi

# 4. Check if ports are already in use and free them if needed
free_port() {
  local port=$1
  local name=$2
  local pids=$(lsof -ti tcp:"$port" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    log_warn "Port $port ($name) is currently occupied by PID(s): $pids"
    log_info "Releasing port $port..."
    kill -9 $pids 2>/dev/null || true
    sleep 1
  fi
}

free_port 8787 "Express API"
free_port 3000 "Vite Frontend"

# 5. PIDs tracking and clean shutdown trap
SERVER_PID=""
CLIENT_PID=""

cleanup() {
  echo ""
  log_info "Shutting down all services..."

  if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
  fi

  if [ -n "$CLIENT_PID" ] && kill -0 "$CLIENT_PID" 2>/dev/null; then
    kill "$CLIENT_PID" 2>/dev/null || true
  fi

  # Wait briefly for graceful shutdown
  sleep 0.5

  # Ensure no lingering processes remain on ports
  lsof -ti tcp:8787 2>/dev/null | xargs kill -9 2>/dev/null || true
  lsof -ti tcp:3000 2>/dev/null | xargs kill -9 2>/dev/null || true

  log_info "All services stopped successfully."
  exit 0
}

trap cleanup SIGINT SIGTERM EXIT

echo -e "${CLR_BOLD}${CLR_MAGENTA}======================================================${CLR_RESET}"
echo -e "${CLR_BOLD}${CLR_MAGENTA}          MCQOnushilon Development Environment       ${CLR_RESET}"
echo -e "${CLR_BOLD}${CLR_MAGENTA}======================================================${CLR_RESET}"
echo -e "  ${CLR_CYAN}• Backend API :${CLR_RESET}  http://localhost:8787 (tsx server/index.ts)"
echo -e "  ${CLR_GREEN}• Frontend UI :${CLR_RESET}  http://localhost:3000 (vite)"
echo -e "  ${CLR_YELLOW}• Press Ctrl+C at any time to stop both.${CLR_RESET}"
echo -e "${CLR_BOLD}${CLR_MAGENTA}======================================================${CLR_RESET}\n"

# 6. Start backend server
log_server "Starting Express backend on port 8787..."
npm run dev:server 2>&1 | sed "s/^/$(echo -e "${CLR_CYAN}[SERVER]${CLR_RESET} ")/" &
SERVER_PID=$!

# Wait briefly for backend to initialize
sleep 1.5

# 7. Start frontend client
log_client "Starting Vite client on port 3000..."
npm run dev:client 2>&1 | sed "s/^/$(echo -e "${CLR_GREEN}[CLIENT]${CLR_RESET} ")/" &
CLIENT_PID=$!

# Wait on background processes
wait
