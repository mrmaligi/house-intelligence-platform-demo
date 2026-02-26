#!/bin/bash
# House Intelligence Platform - Startup Script

echo "╔══════════════════════════════════════════════════════════╗"
echo "║     🏠 HOUSE INTELLIGENCE PLATFORM                       ║"
echo "║                                                          ║"
echo "║     698 Armstrong Road, Wyndham Vale                     ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Node.js 18+ required. Current version: $(node -v)"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Create data directory if it doesn't exist
mkdir -p data/698-armstrong-road-wyndham-vale

echo "What would you like to do?"
echo ""
echo "1) Start Web Server (Dashboard)"
echo "2) Gather Property Data"
echo "3) Run Questionnaire (CLI)"
echo "4) Generate Budget Estimate"
echo "5) Allocate Contractors"
echo "6) Run Full Pipeline"
echo "7) Exit"
echo ""

read -p "Enter choice [1-7]: " choice

case $choice in
    1)
        echo ""
        echo "🚀 Starting web server..."
        echo ""
        npm start
        ;;
    2)
        echo ""
        echo "🔍 Gathering property data..."
        echo ""
        node scripts/gather-property-data.js "698 Armstrong Road, Wyndham Vale, VIC 3024"
        ;;
    3)
        echo ""
        echo "📝 Starting questionnaire..."
        echo ""
        node scripts/customer-questionnaire.js
        ;;
    4)
        echo ""
        echo "💰 Generating budget estimate..."
        echo ""
        node scripts/estimate-budget.js
        ;;
    5)
        echo ""
        echo "🔨 Allocating contractors..."
        echo ""
        node scripts/allocate-contractors.js
        ;;
    6)
        echo ""
        echo "🔄 Running full pipeline..."
        echo ""
        node scripts/gather-property-data.js "698 Armstrong Road, Wyndham Vale, VIC 3024" && \
        node scripts/estimate-budget.js && \
        node scripts/allocate-contractors.js
        ;;
    7)
        echo ""
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo ""
        echo "❌ Invalid choice"
        exit 1
        ;;
esac
