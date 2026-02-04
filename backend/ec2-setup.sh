#!/bin/bash

# 🚀 Moo Music Tracker Backend - EC2 First Time Setup
# Run this script on a fresh EC2 instance to setup everything

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🎵 MOO MUSIC TRACKER - EC2 SETUP SCRIPT 🎵                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}\n"

# Step 1: Update system
echo -e "${YELLOW}1️⃣ Updating system packages...${NC}"
sudo apt update
sudo apt upgrade -y
echo -e "${GREEN}✅ System updated${NC}\n"

# Step 2: Install Node.js
echo -e "${YELLOW}2️⃣ Installing Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js already installed: $NODE_VERSION${NC}"
else
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo -e "${GREEN}✅ Node.js installed${NC}"
fi
echo ""

# Step 3: Install PM2
echo -e "${YELLOW}3️⃣ Installing PM2...${NC}"
sudo npm install -g pm2
echo -e "${GREEN}✅ PM2 installed globally${NC}"
echo ""

# Step 4: Create app directory
echo -e "${YELLOW}4️⃣ Setting up application directory...${NC}"
APP_DIR="/home/ubuntu/moo-tracker"
if [[ -d "$APP_DIR" ]]; then
    echo -e "${YELLOW}⚠️  Directory already exists, skipping...${NC}"
else
    mkdir -p "$APP_DIR"
    echo -e "${GREEN}✅ Created directory: $APP_DIR${NC}"
fi
echo ""

# Step 5: Clone repository (user needs to provide repo URL)
echo -e "${YELLOW}5️⃣ Repository Setup${NC}"
echo -e "${BLUE}📝 Please provide your GitHub repository URL${NC}"
echo -e "${BLUE}   (e.g., https://github.com/yourname/moo-tracker.git)${NC}"
read -p "Repository URL: " REPO_URL

if [[ -z "$REPO_URL" ]]; then
    echo -e "${RED}❌ Repository URL cannot be empty${NC}"
    exit 1
fi

if [[ ! -d "$APP_DIR/.git" ]]; then
    cd "$APP_DIR"
    git clone "$REPO_URL" . || {
        echo -e "${RED}❌ Failed to clone repository${NC}"
        exit 1
    }
    echo -e "${GREEN}✅ Repository cloned${NC}"
else
    echo -e "${YELLOW}⚠️  Repository already cloned, pulling latest...${NC}"
    cd "$APP_DIR"
    git pull origin main
fi
echo ""

# Step 6: Navigate to backend and install dependencies
echo -e "${YELLOW}6️⃣ Installing backend dependencies...${NC}"
cd "$APP_DIR/backend"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 7: Verify .env.prod
echo -e "${YELLOW}7️⃣ Verifying production configuration...${NC}"
if [[ ! -f ".env.prod" ]]; then
    echo -e "${RED}❌ .env.prod not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ .env.prod found${NC}"
echo -e "${BLUE}📝 Current MongoDB URI:${NC}"
grep MONGODB_URI .env.prod | head -c 80
echo "..."
echo -e "${BLUE}📝 Current Frontend URL:${NC}"
grep FRONTEND_URL .env.prod
echo ""

# Step 8: Create logs directory
echo -e "${YELLOW}8️⃣ Creating logs directory...${NC}"
mkdir -p "$APP_DIR/backend/logs"
echo -e "${GREEN}✅ Logs directory created${NC}"
echo ""

# Step 9: Test MongoDB connection
echo -e "${YELLOW}9️⃣ Testing MongoDB connection...${NC}"
cat > /tmp/test-mongo.js << 'EOF'
require('dotenv').config({ path: '.env.prod' });
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ MongoDB connection successful');
    process.exit(0);
  })
  .catch((err) => {
    console.log('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
EOF

cd "$APP_DIR/backend"
node /tmp/test-mongo.js || {
    echo -e "${RED}⚠️  MongoDB connection test failed${NC}"
    echo -e "${YELLOW}   Make sure MongoDB URI in .env.prod is correct${NC}"
}
echo ""

# Step 10: Enable PM2 startup
echo -e "${YELLOW}🔟 Enabling PM2 auto-startup...${NC}"
pm2 startup systemd -u ubuntu --hp /home/ubuntu > /dev/null 2>&1
echo -e "${GREEN}✅ PM2 startup enabled${NC}"
echo ""

# Step 11: Start the app
echo -e "${YELLOW}1️⃣1️⃣ Starting backend application...${NC}"
cd "$APP_DIR/backend"
npm run start:prod
sleep 3

# Save PM2 configuration
pm2 save
echo -e "${GREEN}✅ Application started and saved${NC}"
echo ""

# Final status
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    ✅ SETUP COMPLETE!                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}📊 Process Status:${NC}"
pm2 list
echo ""

echo -e "${GREEN}📝 Useful Commands:${NC}"
echo -e "  ${YELLOW}View logs:${NC}          pm2 logs moo-music-tracker-api"
echo -e "  ${YELLOW}Monitor:${NC}            pm2 monit"
echo -e "  ${YELLOW}Restart app:${NC}        pm2 restart moo-music-tracker-api"
echo -e "  ${YELLOW}Stop app:${NC}           pm2 stop moo-music-tracker-api"
echo -e "  ${YELLOW}View process info:${NC}  pm2 info moo-music-tracker-api"
echo ""

echo -e "${GREEN}🔗 Backend running at:${NC} http://your-ec2-ip:5000"
echo -e "${GREEN}📚 API Documentation:${NC} http://your-ec2-ip:5000/api"
echo ""

echo -e "${BLUE}Next Steps:${NC}"
echo -e "  1. Update your security groups to allow port 5000"
echo -e "  2. Configure your domain to point to this EC2 instance"
echo -e "  3. Deploy frontend and update FRONTEND_URL if needed"
echo ""

echo -e "${YELLOW}⚠️  Security Notes:${NC}"
echo -e "  - MongoDB credentials are in .env.prod"
echo -e "  - Ensure .env.prod is never committed to git"
echo -e "  - Add .env.prod to .gitignore if not already"
echo ""

echo -e "${GREEN}🎉 Happy deploying! 🚀${NC}\n"
