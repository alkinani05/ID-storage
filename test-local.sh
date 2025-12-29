#!/bin/bash

# 🧪 Local Test Script for Wathiqni
# This script starts the application locally using Docker Compose

echo "🚀 Starting Wathiqni Local Test Environment..."
echo "=============================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
    echo "❌ Docker Compose is not installed."
    exit 1
fi

echo ""
echo "📦 Building and starting containers..."
echo "This may take a few minutes on first run..."
echo ""

# Use docker compose (newer) or docker-compose (older)
if docker compose version &> /dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

# Start services
$COMPOSE_CMD up --build -d

if [ $? -ne 0 ]; then
    echo "❌ Failed to start services"
    exit 1
fi

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check backend health
echo ""
echo "🔍 Checking backend health..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health 2>/dev/null || echo "000")

if [ "$BACKEND_STATUS" = "200" ]; then
    echo "✅ Backend is healthy!"
else
    echo "⚠️  Backend returned status: $BACKEND_STATUS"
    echo "   Checking logs..."
    $COMPOSE_CMD logs server | tail -20
fi

# Check frontend
echo ""
echo "🔍 Checking frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")

if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend is healthy!"
else
    echo "⚠️  Frontend returned status: $FRONTEND_STATUS"
    echo "   Checking logs..."
    $COMPOSE_CMD logs client | tail -20
fi

echo ""
echo "=============================================="
echo "📊 Test Environment Status"
echo "=============================================="
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   Health:   http://localhost:3001/health"
echo ""
echo "📋 Services:"
$COMPOSE_CMD ps
echo ""
echo "💡 Useful Commands:"
echo "   View logs:        $COMPOSE_CMD logs -f"
echo "   Stop services:    $COMPOSE_CMD down"
echo "   Restart:          $COMPOSE_CMD restart"
echo "   View DB:          $COMPOSE_CMD exec postgres psql -U dev -d wathiqati"
echo ""

if [ "$BACKEND_STATUS" = "200" ] && [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✨ All services are running!"
    echo ""
    echo "🎯 Next Steps:"
    echo "   1. Open http://localhost:3000 in your browser"
    echo "   2. Register a new account"
    echo "   3. Upload a test document"
    echo "   4. Test OCR functionality"
    echo ""
else
    echo "⚠️  Some services may not be ready yet."
    echo "   Wait a few more seconds and check the logs:"
    echo "   $COMPOSE_CMD logs -f"
    echo ""
fi
