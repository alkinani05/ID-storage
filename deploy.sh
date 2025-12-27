#!/bin/bash

# Wathiqati Deployment Script
# Usage: ./deploy.sh [build|start|stop|restart|logs|clean]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
check_env() {
    if [ ! -f .env ]; then
        echo -e "${YELLOW}No .env file found. Creating from .env.example...${NC}"
        if [ -f .env.example ]; then
            cp .env.example .env
            echo -e "${YELLOW}Please edit .env with your configuration before deploying.${NC}"
            exit 1
        else
            echo -e "${RED}No .env.example found. Please create a .env file.${NC}"
            exit 1
        fi
    fi
}

# Build all containers
build() {
    echo -e "${GREEN}Building all containers...${NC}"
    docker compose build --parallel
    echo -e "${GREEN}Build complete!${NC}"
}

# Start all services
start() {
    check_env
    echo -e "${GREEN}Starting all services...${NC}"
    docker compose up -d
    echo -e "${GREEN}Services started!${NC}"
    echo ""
    echo -e "Frontend:  ${GREEN}http://localhost:3000${NC}"
    echo -e "Backend:   ${GREEN}http://localhost:3001${NC}"
    echo -e "Database:  ${GREEN}localhost:5432${NC}"
}

# Stop all services
stop() {
    echo -e "${YELLOW}Stopping all services...${NC}"
    docker compose down
    echo -e "${GREEN}Services stopped.${NC}"
}

# Restart all services
restart() {
    stop
    start
}

# Show logs
logs() {
    docker compose logs -f
}

# Clean everything (including volumes)
clean() {
    echo -e "${RED}Warning: This will remove all containers, images, and volumes!${NC}"
    read -p "Are you sure? (y/N): " confirm
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        docker compose down -v --rmi all
        echo -e "${GREEN}Cleanup complete.${NC}"
    else
        echo "Cancelled."
    fi
}

# Quick deploy (build + start)
deploy() {
    check_env
    build
    start
}

# Show status
status() {
    docker compose ps
}

# Main
case "$1" in
    build)
        build
        ;;
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs
        ;;
    clean)
        clean
        ;;
    deploy)
        deploy
        ;;
    status)
        status
        ;;
    *)
        echo "Wathiqati Deployment Script"
        echo ""
        echo "Usage: $0 {build|start|stop|restart|logs|clean|deploy|status}"
        echo ""
        echo "Commands:"
        echo "  build    - Build all Docker images"
        echo "  start    - Start all services"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  logs     - Show live logs"
        echo "  clean    - Remove all containers, images, and volumes"
        echo "  deploy   - Build and start (full deployment)"
        echo "  status   - Show service status"
        exit 1
        ;;
esac
