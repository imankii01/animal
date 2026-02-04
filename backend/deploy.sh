#!/bin/bash

# 🚀 Moo Music Tracker Backend - Quick Deployment Script
# Usage: bash deploy.sh [dev|prod]

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get environment from argument
ENV=${1:-prod}

echo -e "${YELLOW}🚀 Moo Music Tracker Backend Deployment${NC}"
echo -e "${YELLOW}Environment: $ENV${NC}\n"

# Validate environment
if [[ "$ENV" != "dev" && "$ENV" != "prod" ]]; then
    echo -e "${RED}❌ Invalid environment: $ENV${NC}"
    echo "Usage: bash deploy.sh [dev|prod]"
    exit 1
fi

# Step 1: Check if .env file exists
echo -e "${YELLOW}1️⃣ Checking environment file...${NC}"
if [[ "$ENV" == "dev" ]]; then
    ENV_FILE=".env.dev"
else
    ENV_FILE=".env.prod"
fi

if [[ ! -f "$ENV_FILE" ]]; then
    echo -e "${RED}❌ Error: $ENV_FILE not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ $ENV_FILE found${NC}\n"

# Step 2: Check if node_modules exists
echo -e "${YELLOW}2️⃣ Checking dependencies...${NC}"
if [[ ! -d "node_modules" ]]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi
echo ""

# Step 3: Check if PM2 is installed
echo -e "${YELLOW}3️⃣ Checking PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 Installing PM2 globally...${NC}"
    sudo npm install -g pm2
fi
echo -e "${GREEN}✅ PM2 is available${NC}\n"

# Step 4: Stop existing process if any
echo -e "${YELLOW}4️⃣ Checking for running processes...${NC}"
if pm2 list | grep -q "moo-music-tracker-api"; then
    echo -e "${YELLOW}🛑 Stopping existing process...${NC}"
    pm2 stop moo-music-tracker-api
    sleep 2
fi
echo -e "${GREEN}✅ Ready to start${NC}\n"

# Step 5: Start the app
echo -e "${YELLOW}5️⃣ Starting backend in $ENV mode...${NC}"
if [[ "$ENV" == "dev" ]]; then
    npm run start:dev
    echo -e "${GREEN}✅ Development server started with PM2${NC}"
else
    npm run start:prod
    echo -e "${GREEN}✅ Production server started with PM2${NC}"
fi

# Step 6: Wait and display status
sleep 3
echo ""
echo -e "${YELLOW}6️⃣ Process Status:${NC}"
pm2 list

# Step 7: Show logs
echo ""
echo -e "${YELLOW}7️⃣ Latest logs:${NC}"
pm2 logs moo-music-tracker-api --lines 10

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}📊 Monitor with: pm2 monit${NC}"
echo -e "${GREEN}📝 View logs with: pm2 logs moo-music-tracker-api${NC}"
echo ""
