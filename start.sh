#!/bin/bash

# JurisAI2 Startup Script

echo "🚀 Starting JurisAI2 - White-label Legal Assistant"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
pip3 install -r requirements.txt
cd ..

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p backend/uploads
mkdir -p backend/metadata

# Copy environment file if it doesn't exist
if [ ! -f "config/.env" ]; then
    echo "📝 Creating environment file..."
    cp config/.env.example config/.env
    echo "⚠️  Please edit config/.env with your API keys before running the application"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "1. Frontend: npm run dev"
echo "2. Backend: npm run server (in another terminal)"
echo ""
echo "Or use the development script:"
echo "npm run dev:full"
echo ""
echo "📖 Check the README.md for more information"