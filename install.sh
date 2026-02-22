#!/bin/bash
# ╔══════════════════════════════════════════════════════════════╗
# ║  LocalAgent Installer                                        ║
# ║  Your AI. Your Machine. Your Rules.                         ║
# ║                                                              ║
# ║  One-time setup — runs locally forever                      ║
# ╚══════════════════════════════════════════════════════════════╝

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     LocalAgent - Installing...       ║${NC}"
echo -e "${CYAN}║     Your AI. Your Machine.           ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""

# ── CHECK PREREQUISITES ──────────────────────────────────────
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Python 3
if ! command -v python3 &>/dev/null; then
    echo -e "${RED}✗ Python 3 is required.${NC}"
    echo "  Install: https://python.org"
    exit 1
fi
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo -e "${GREEN}✓${NC} Python $PYTHON_VERSION"

# Node.js
if ! command -v node &>/dev/null; then
    echo -e "${RED}✗ Node.js is required.${NC}"
    echo "  Install: https://nodejs.org"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✓${NC} Node.js $NODE_VERSION"

# npm
if ! command -v npm &>/dev/null; then
    echo -e "${RED}✗ npm is required.${NC}"
    echo "  Comes with Node.js: https://nodejs.org"
    exit 1
fi
echo -e "${GREEN}✓${NC} npm $(npm --version)"

# Ollama
if ! command -v ollama &>/dev/null; then
    echo -e "${RED}✗ Ollama is required.${NC}"
    echo "  Install: https://ollama.ai"
    exit 1
fi
echo -e "${GREEN}✓${NC} Ollama installed"

# Check if Ollama is running
if curl -s http://localhost:11434/api/tags &>/dev/null; then
    echo -e "${GREEN}✓${NC} Ollama is running"
else
    echo -e "${YELLOW}⚠ Ollama is not running. Starting...${NC}"
    ollama serve &>/dev/null &
    sleep 2
    if curl -s http://localhost:11434/api/tags &>/dev/null; then
        echo -e "${GREEN}✓${NC} Ollama started"
    else
        echo -e "${YELLOW}⚠ Could not start Ollama. Please start it manually.${NC}"
    fi
fi

echo ""

# ── DETERMINE INSTALL DIRECTORY ──────────────────────────────
INSTALL_DIR="${LOCALAGENT_DIR:-$HOME/LocalAgent}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -d "$INSTALL_DIR" ] && [ -f "$INSTALL_DIR/backend/main.py" ]; then
    echo -e "${GREEN}✓${NC} LocalAgent found at $INSTALL_DIR"
else
    echo -e "${YELLOW}Setting up LocalAgent at $INSTALL_DIR...${NC}"

    # If running from the repo directory, use it
    if [ -f "$SCRIPT_DIR/backend/main.py" ]; then
        if [ "$SCRIPT_DIR" != "$INSTALL_DIR" ]; then
            cp -r "$SCRIPT_DIR" "$INSTALL_DIR" 2>/dev/null || true
        fi
    else
        echo -e "${RED}✗ Could not find LocalAgent source files.${NC}"
        echo "  Make sure you're running this script from the LocalAgent directory."
        exit 1
    fi
fi

echo ""

# ── BACKEND SETUP ────────────────────────────────────────────
echo -e "${YELLOW}Setting up backend...${NC}"
cd "$INSTALL_DIR/backend"

# Create virtual environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✓${NC} Virtual environment created"
fi

# Activate venv
source venv/bin/activate

# Install dependencies
pip install -q -r requirements.txt 2>/dev/null
echo -e "${GREEN}✓${NC} Backend dependencies installed"

# Create .env if not exists
if [ ! -f .env ]; then
    if [ -f .env.template ]; then
        cp .env.template .env
    else
        cat > .env << 'ENVEOF'
# LocalAgent Configuration
# All optional — core chat works without any of these
# ELEVENLABS_API_KEY=sk-your-key-here
# TWILIO_ACCOUNT_SID=your-sid
# TWILIO_AUTH_TOKEN=your-token
# TWILIO_PHONE_NUMBER=+1234567890
ENVEOF
    fi
    echo -e "${GREEN}✓${NC} Created .env (edit to add optional API keys)"
fi

cd "$INSTALL_DIR"

# ── FRONTEND SETUP ───────────────────────────────────────────
echo -e "${YELLOW}Setting up frontend...${NC}"
cd frontend

# Install node modules
npm install --silent 2>/dev/null
echo -e "${GREEN}✓${NC} Frontend dependencies installed"

cd "$INSTALL_DIR"

# ── PULL AI MODEL ────────────────────────────────────────────
echo ""
echo -e "${YELLOW}Pulling AI model (first time may take a few minutes)...${NC}"
if ollama list 2>/dev/null | grep -q "llama3.2"; then
    echo -e "${GREEN}✓${NC} llama3.2 already available"
else
    ollama pull llama3.2 2>/dev/null || echo -e "${YELLOW}⚠ Could not pull model. Make sure Ollama is running.${NC}"
fi

# ── START SERVICES ───────────────────────────────────────────
echo ""
echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     Starting LocalAgent...           ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""

# Start backend
cd "$INSTALL_DIR/backend"
source venv/bin/activate
python3 main.py &
BACKEND_PID=$!
echo -e "${GREEN}✓${NC} Backend starting (PID: $BACKEND_PID)"

# Start frontend
cd "$INSTALL_DIR/frontend"
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✓${NC} Frontend starting (PID: $FRONTEND_PID)"

# Wait for services
sleep 3

echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                      ║${NC}"
echo -e "${GREEN}║     LocalAgent is LIVE!               ║${NC}"
echo -e "${GREEN}║                                      ║${NC}"
echo -e "${GREEN}║  Open: ${CYAN}http://localhost:3002${GREEN}          ║${NC}"
echo -e "${GREEN}║                                      ║${NC}"
echo -e "${GREEN}║  Backend:  http://localhost:8000     ║${NC}"
echo -e "${GREEN}║  Frontend: http://localhost:3002     ║${NC}"
echo -e "${GREEN}║                                      ║${NC}"
echo -e "${GREEN}║  Press ${YELLOW}Ctrl+C${GREEN} to stop                ║${NC}"
echo -e "${GREEN}║                                      ║${NC}"
echo -e "${GREEN}║  Your AI. Your Machine. Your Rules.  ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""

# Open browser
if command -v open &>/dev/null; then
    open "http://localhost:3002" 2>/dev/null || true
elif command -v xdg-open &>/dev/null; then
    xdg-open "http://localhost:3002" 2>/dev/null || true
fi

# Trap Ctrl+C to cleanup
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down LocalAgent...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo -e "${GREEN}✓${NC} Stopped. See you next time!"
    exit 0
}
trap cleanup INT TERM

# Wait for either process
wait $BACKEND_PID $FRONTEND_PID
