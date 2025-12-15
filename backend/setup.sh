#!/bin/bash

# Quantum-Resistant Crypto Analyzer Backend Setup Script
# This script automates the setup process for development and production

set -e  # Exit on error

echo "==================================="
echo "Crypto Analyzer Backend Setup"
echo "==================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Python version
echo "Checking Python version..."
python_version=$(python3 --version 2>&1 | awk '{print $2}')
required_version="3.10"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then 
    echo -e "${RED}Error: Python 3.10+ required. Found: $python_version${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python $python_version${NC}"

# Check Git
echo "Checking Git..."
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: Git not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Git installed${NC}"

# Create virtual environment
echo ""
echo "Creating virtual environment..."
if [ -d "venv" ]; then
    echo -e "${YELLOW}Virtual environment already exists${NC}"
else
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip > /dev/null 2>&1
echo -e "${GREEN}✓ Pip upgraded${NC}"

# Install dependencies
echo ""
echo "Installing dependencies..."
pip install -r requirements.txt
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Create directories
echo ""
echo "Creating required directories..."
mkdir -p uploads reports ai_outputs
echo -e "${GREEN}✓ Directories created${NC}"

# Check AI outputs
echo ""
echo "Checking AI output files..."
required_files=("risk_output.json" "risk_output.csv" "shap_feature_importance.csv")
missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "ai_outputs/$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    echo -e "${GREEN}✓ All required AI output files present${NC}"
else
    echo -e "${YELLOW}⚠ Missing AI output files:${NC}"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
    echo -e "${YELLOW}Please add these files to ai_outputs/ directory${NC}"
fi

# Create .env if not exists
echo ""
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}⚠ Please review and update .env with your configuration${NC}"
else
    echo -e "${YELLOW}.env file already exists${NC}"
fi

# Initialize database
echo ""
echo "Initializing database..."
python3 -c "
from app.database import engine, Base
Base.metadata.create_all(bind=engine)
print('Database tables created')
"
echo -e "${GREEN}✓ Database initialized${NC}"

# Run tests if available
if [ -d "tests" ]; then
    echo ""
    echo "Running tests..."
    pytest tests/ -v --tb=short || echo -e "${YELLOW}Some tests failed${NC}"
fi

# Final summary
echo ""
echo "==================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "==================================="
echo ""
echo "To start the server:"
echo "  source venv/bin/activate"
echo "  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "Or use Docker:"
echo "  docker-compose up -d"
echo ""
echo "API Documentation will be available at:"
echo "  http://localhost:8000/docs"
echo ""

# Test server startup
read -p "Do you want to test the server startup? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Starting server (Ctrl+C to stop)..."
    uvicorn app.main:app --host 0.0.0.0 --port 8000
fi