#!/bin/bash

# 🧪 Local Setup Verification Script
# Checks if everything is configured correctly for local deployment

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    ((ERRORS++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo ""
echo "🔍 Wathiqni Local Setup Verification"
echo "====================================="
echo ""

# Check Docker
echo "🐳 Checking Docker..."
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
else
    print_success "Docker is installed"
    if docker info > /dev/null 2>&1; then
        print_success "Docker daemon is running"
    else
        print_error "Docker daemon is not running"
    fi
fi

# Check Docker Compose
echo ""
echo "🐳 Checking Docker Compose..."
if docker compose version &> /dev/null 2>&1; then
    print_success "Docker Compose is available (v2)"
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    print_success "Docker Compose is available (v1)"
    COMPOSE_CMD="docker-compose"
else
    print_error "Docker Compose is not installed"
    COMPOSE_CMD=""
fi

# Check docker-compose.yml
echo ""
echo "📋 Checking Configuration Files..."
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found"
else
    print_success "docker-compose.yml exists"
    
    if [ -n "$COMPOSE_CMD" ]; then
        CONFIG_OUTPUT=$($COMPOSE_CMD config --quiet 2>&1)
        if [ $? -eq 0 ]; then
            print_success "docker-compose.yml is valid"
        else
            print_warning "docker-compose.yml validation had warnings (may be okay)"
        fi
    fi
fi

# Check .env file
if [ ! -f ".env" ]; then
    print_warning ".env file not found"
    print_info "Run: cp .env.example .env"
else
    print_success ".env file exists"
    
    # Check required variables
    if grep -q "POSTGRES_USER=" .env && grep -q "POSTGRES_PASSWORD=" .env; then
        print_success "Database credentials configured"
    else
        print_error "Database credentials missing in .env"
    fi
    
    if grep -q "JWT_SECRET=" .env; then
        print_success "JWT_SECRET configured"
        if grep -q "JWT_SECRET=your-jwt-secret-change-in-production" .env; then
            print_warning "Using default JWT_SECRET (change for production)"
        fi
    else
        print_error "JWT_SECRET missing in .env"
    fi
fi

# Check project structure
echo ""
echo "📁 Checking Project Structure..."

if [ -d "server" ]; then
    print_success "Server directory exists"
    
    if [ -f "server/Dockerfile" ]; then
        print_success "Server Dockerfile exists"
    else
        print_error "Server Dockerfile missing"
    fi
    
    if [ -f "server/package.json" ]; then
        print_success "Server package.json exists"
    else
        print_error "Server package.json missing"
    fi
    
    if [ -d "server/prisma" ]; then
        print_success "Prisma directory exists"
    else
        print_error "Prisma directory missing"
    fi
else
    print_error "Server directory not found"
fi

if [ -d "client" ]; then
    print_success "Client directory exists"
    
    if [ -f "client/Dockerfile" ]; then
        print_success "Client Dockerfile exists"
    else
        print_error "Client Dockerfile missing"
    fi
    
    if [ -f "client/package.json" ]; then
        print_success "Client package.json exists"
    else
        print_error "Client package.json missing"
    fi
else
    print_error "Client directory not found"
fi

# Check documentation
echo ""
echo "📚 Checking Documentation..."

if [ -f "LOCAL_SETUP.md" ]; then
    print_success "LOCAL_SETUP.md exists"
else
    print_warning "LOCAL_SETUP.md not found"
fi

if [ -f "README.md" ]; then
    print_success "README.md exists"
else
    print_warning "README.md not found"
fi

# Check ports
echo ""
echo "🔌 Checking Port Availability..."

check_port() {
    local port=$1
    if command -v lsof &> /dev/null; then
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
            print_warning "Port $port is already in use"
            return 1
        else
            print_success "Port $port is available"
            return 0
        fi
    else
        print_info "Port $port (lsof not available to check)"
        return 0
    fi
}

check_port 3000
check_port 3001
check_port 5432

# Summary
echo ""
echo "====================================="
echo "📊 Verification Summary"
echo "====================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✨ Perfect! Everything looks good!${NC}"
    echo ""
    echo "Ready to start? Run:"
    echo -e "${BLUE}  ./test-local.sh${NC}"
    echo "or"
    echo -e "${BLUE}  docker compose up --build -d${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Found $WARNINGS warning(s).${NC}"
    echo "You can proceed, but review the warnings above."
    echo ""
    echo "To start anyway, run:"
    echo -e "${BLUE}  ./test-local.sh${NC}"
    exit 0
else
    echo -e "${RED}❌ Found $ERRORS error(s) and $WARNINGS warning(s).${NC}"
    echo -e "${RED}Please fix the errors before starting!${NC}"
    echo ""
    echo "Need help? Check LOCAL_SETUP.md for detailed instructions."
    exit 1
fi
