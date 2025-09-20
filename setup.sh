#!/bin/bash

# REALagent Setup Script
echo "🏠 Setting up REALagent..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Node.js dependencies"
    exit 1
fi

echo "✅ Node.js dependencies installed"

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
cd worker
pip3 install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Python dependencies"
    exit 1
fi

cd ..

echo "✅ Python dependencies installed"

# Check for environment files
if [ ! -f ".env.local" ]; then
    echo "⚠️  Environment file not found. Creating from template..."
    cp env.example .env.local
    echo "📝 Please update .env.local with your Supabase credentials"
fi

if [ ! -f "worker/.env" ]; then
    echo "⚠️  Worker environment file not found. Creating from template..."
    cp worker/env.example worker/.env
    echo "📝 Please update worker/.env with your Supabase credentials"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Set up your Supabase project (see SETUP.md)"
echo "2. Update environment variables in .env.local and worker/.env"
echo "3. Run the database schema in Supabase"
echo "4. Run: cd worker && python3 data_ingestion.py"
echo "5. Start the app: npm run dev"
echo ""
echo "📖 For detailed instructions, see SETUP.md"
