#!/bin/bash

# Health Platform - Production Deployment Script
# This script helps you deploy your health platform to production

echo "🏥 Health Platform - Production Deployment"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm version: $(npm -v)"
echo ""

# Check for .env file
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "   Creating .env from .env.example..."
    if [ -f env.example ]; then
        cp env.example .env
        echo "   ✅ Created .env file. Please edit it with your credentials."
    else
        echo "   ❌ env.example not found. Please create .env manually."
    fi
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Run database migrations
echo "🗄️  Running database migrations..."
if [ -f scripts/run-create-translations.js ]; then
    node scripts/run-create-translations.js
fi
echo "✅ Migrations complete"
echo ""

# Build the application
echo "🏗️  Building application..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Build complete"
echo ""

# Ask deployment target
echo "🚀 Where would you like to deploy?"
echo "1) Start local production server (npm start)"
echo "2) Deploy to Vercel"
echo "3) Generate Docker image"
echo "4) Exit"
echo ""
read -p "Select option (1-4): " option

case $option in
    1)
        echo ""
        echo "🚀 Starting production server..."
        echo "   Server will run on http://localhost:3000"
        echo "   Press Ctrl+C to stop"
        echo ""
        npm start
        ;;
    2)
        echo ""
        if ! command -v vercel &> /dev/null; then
            echo "📦 Installing Vercel CLI..."
            npm install -g vercel
        fi
        echo "🚀 Deploying to Vercel..."
        echo ""
        echo "⚠️  Make sure to set environment variables in Vercel:"
        echo "   - DATABASE_URL"
        echo "   - JWT_SECRET"
        echo "   - NODE_ENV=production"
        echo ""
        read -p "Press Enter to continue with deployment..."
        vercel --prod
        ;;
    3)
        echo ""
        echo "🐳 Building Docker image..."
        if ! command -v docker &> /dev/null; then
            echo "❌ Docker is not installed"
            exit 1
        fi
        docker build -t health-platform:latest .
        echo "✅ Docker image built: health-platform:latest"
        echo ""
        echo "To run the container:"
        echo "  docker run -p 3000:3000 \\"
        echo "    -e DATABASE_URL=your-db-url \\"
        echo "    -e JWT_SECRET=your-secret \\"
        echo "    health-platform:latest"
        ;;
    4)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📚 For more information, see PRODUCTION_BUILD_GUIDE.md"

