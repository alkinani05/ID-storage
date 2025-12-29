#!/bin/bash

# 🚀 Wathiqni Deployment Verification Script
# This script checks for common deployment issues before deploying to Railway

set -e

echo "🔍 Starting Wathiqni Deployment Verification..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track errors
ERRORS=0
WARNINGS=0

# Function to print colored output
print_error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
    ((ERRORS++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    ((WARNINGS++))
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

echo ""
echo "📦 Checking Server Configuration..."
echo "-----------------------------------"

# Check if server directory exists
if [ ! -d "server" ]; then
    print_error "Server directory not found!"
else
    print_success "Server directory exists"
fi

# Check server Dockerfile
if [ ! -f "server/Dockerfile" ]; then
    print_error "Server Dockerfile not found!"
else
    print_success "Server Dockerfile exists"
    
    # Check for critical Dockerfile components
    if grep -q "tesseract-ocr" server/Dockerfile; then
        print_success "Tesseract OCR configured in Dockerfile"
    else
        print_error "Tesseract OCR not found in Dockerfile"
    fi
    
    if grep -q "prisma generate" server/Dockerfile; then
        print_success "Prisma generate configured in Dockerfile"
    else
        print_warning "Prisma generate not found in Dockerfile"
    fi
fi

# Check server package.json
if [ ! -f "server/package.json" ]; then
    print_error "Server package.json not found!"
else
    print_success "Server package.json exists"
    
    # Check for postinstall script
    if grep -q "postinstall" server/package.json; then
        print_success "Postinstall script configured"
    else
        print_warning "Postinstall script not found (Prisma may not generate)"
    fi
fi

# Check Prisma schema
if [ ! -f "server/prisma/schema.prisma" ]; then
    print_error "Prisma schema not found!"
else
    print_success "Prisma schema exists"
    
    # Check for linux-musl target
    if grep -q "linux-musl" server/prisma/schema.prisma; then
        print_success "Linux-musl binary target configured for Alpine"
    else
        print_warning "Linux-musl binary target not found (may cause issues on Railway)"
    fi
fi

# Check for migrations
if [ ! -d "server/prisma/migrations" ]; then
    print_error "No Prisma migrations found!"
else
    MIGRATION_COUNT=$(find server/prisma/migrations -maxdepth 1 -type d | wc -l)
    if [ $MIGRATION_COUNT -gt 1 ]; then
        print_success "Prisma migrations exist ($((MIGRATION_COUNT - 1)) migration(s))"
    else
        print_error "No migration folders found"
    fi
fi

echo ""
echo "📦 Checking Client Configuration..."
echo "-----------------------------------"

# Check if client directory exists
if [ ! -d "client" ]; then
    print_error "Client directory not found!"
else
    print_success "Client directory exists"
fi

# Check client Dockerfile
if [ ! -f "client/Dockerfile" ]; then
    print_error "Client Dockerfile not found!"
else
    print_success "Client Dockerfile exists"
    
    # Check for standalone output
    if grep -q "standalone" client/Dockerfile; then
        print_success "Standalone output configured in Dockerfile"
    else
        print_warning "Standalone output not found in Dockerfile"
    fi
fi

# Check Next.js config
if [ ! -f "client/next.config.ts" ]; then
    print_error "Next.js config not found!"
else
    print_success "Next.js config exists"
    
    # Check for standalone output
    if grep -q "standalone" client/next.config.ts; then
        print_success "Standalone output configured in next.config.ts"
    else
        print_error "Standalone output not configured (required for Docker)"
    fi
fi

# Check client package.json
if [ ! -f "client/package.json" ]; then
    print_error "Client package.json not found!"
else
    print_success "Client package.json exists"
fi

echo ""
echo "🔧 Testing Builds..."
echo "-------------------"

# Test server build
echo "Building server..."
cd server
if npm run build > /dev/null 2>&1; then
    print_success "Server builds successfully"
else
    print_error "Server build failed! Run 'cd server && npm run build' for details"
fi
cd ..

# Test client build
echo "Building client..."
cd client
if npm run build > /dev/null 2>&1; then
    print_success "Client builds successfully"
else
    print_error "Client build failed! Run 'cd client && npm run build' for details"
fi
cd ..

echo ""
echo "📋 Environment Variables Check..."
echo "---------------------------------"

# Check .env.example files
if [ ! -f "server/.env.example" ]; then
    print_warning "Server .env.example not found"
else
    print_success "Server .env.example exists"
    
    # Check for required variables
    REQUIRED_VARS=("DATABASE_URL" "JWT_SECRET" "CORS_ORIGIN" "PORT")
    for VAR in "${REQUIRED_VARS[@]}"; do
        if grep -q "$VAR" server/.env.example; then
            print_success "  $VAR documented"
        else
            print_warning "  $VAR not documented in .env.example"
        fi
    done
fi

echo ""
echo "📄 Deployment Documentation Check..."
echo "------------------------------------"

if [ ! -f "RAILWAY_DEPLOY.md" ]; then
    print_warning "RAILWAY_DEPLOY.md not found"
else
    print_success "RAILWAY_DEPLOY.md exists"
fi

if [ ! -f "README.md" ]; then
    print_warning "README.md not found"
else
    print_success "README.md exists"
fi

echo ""
echo "================================================"
echo "📊 Verification Summary"
echo "================================================"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✨ Perfect! No issues found. Ready to deploy!${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Found $WARNINGS warning(s). Review before deploying.${NC}"
    exit 0
else
    echo -e "${RED}❌ Found $ERRORS error(s) and $WARNINGS warning(s).${NC}"
    echo -e "${RED}Please fix the errors before deploying!${NC}"
    exit 1
fi
