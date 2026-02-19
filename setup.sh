#!/bin/bash

# PWA Order System - Setup Script
# This script helps you get started quickly

set -e  # Exit on error

echo "🚀 PWA Order System - Setup Script"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm version: $(npm -v)${NC}"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi

echo ""

# Install function dependencies
echo "📦 Installing Netlify Function dependencies..."
cd netlify/functions
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Function dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install function dependencies${NC}"
    exit 1
fi

cd ../..
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env and add your API keys:${NC}"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_SERVICE_KEY"
    echo "   - RESEND_API_KEY"
    echo "   - FROM_EMAIL"
    echo "   - REPLY_TO_EMAIL"
else
    echo -e "${YELLOW}⚠️  .env file already exists, skipping${NC}"
fi

echo ""

# Check for icons
if [ ! -f public/icons/icon-192x192.png ] || [ ! -f public/icons/icon-512x512.png ]; then
    echo -e "${YELLOW}⚠️  PWA icons not found${NC}"
    echo "Please create icons in public/icons/"
    echo "See public/icons/README.md for instructions"

    # Check if ImageMagick is installed
    if command -v convert &> /dev/null; then
        echo ""
        echo -e "${GREEN}ImageMagick is installed. Would you like to create placeholder icons? (y/n)${NC}"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            echo "Creating placeholder icons..."
            cd public/icons
            convert -size 192x192 xc:#4F46E5 -pointsize 72 -fill white -gravity center -annotate +0+0 "OA" icon-192x192.png
            convert -size 512x512 xc:#4F46E5 -pointsize 192 -fill white -gravity center -annotate +0+0 "OA" icon-512x512.png
            cd ../..
            echo -e "${GREEN}✅ Placeholder icons created${NC}"
        fi
    else
        echo -e "${YELLOW}ImageMagick not installed. Install it to auto-generate icons:${NC}"
        echo "  macOS: brew install imagemagick"
        echo "  Linux: sudo apt-get install imagemagick"
    fi
else
    echo -e "${GREEN}✅ PWA icons found${NC}"
fi

echo ""
echo "======================================"
echo -e "${GREEN}✨ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your API keys"
echo "2. Create Supabase project and run database-schema.sql"
echo "3. Create Resend account and get API key"
echo "4. Run 'npm run netlify' to start development server"
echo ""
echo "For detailed instructions, see:"
echo "  - README.md (overview and features)"
echo "  - DEPLOYMENT.md (deployment guide)"
echo "  - PROJECT_SUMMARY.md (quick reference)"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"
