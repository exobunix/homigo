#!/bin/bash

# 🚀 Urbanprox Automatic Deployment Script - Hostinger VPS

# Environment Setup
PROJECT_ROOT="/var/www/urbanprox"
API_URL="https://api.urbanprox.com"

echo "🏁 Starting Deployment at $(date)"

# 1. Pull Latest Changes
echo "⬇️ Pulling latest changes from GitHub..."
cd $PROJECT_ROOT
git pull origin main

# 2. Update Backend
echo "🏗️ Updating Backend API..."
cd $PROJECT_ROOT/Urbanvendor/backend
npm install
pm2 restart urbanprox-backend

# 3. Build Frontends
echo "🏗️ Building Admin Frontend..."
cd $PROJECT_ROOT/Adminurban
npm install
EXPO_PUBLIC_API_URL=$API_URL npx expo export --platform web

echo "🏗️ Building User Frontend..."
cd $PROJECT_ROOT/userurban
npm install
EXPO_PUBLIC_API_URL=$API_URL npx expo export --platform web

echo "🏗️ Building Vendor Frontend..."
cd $PROJECT_ROOT/Urbanvendor
npm install
EXPO_PUBLIC_API_URL=$API_URL npx expo export --platform web

# 4. Restart Nginx
echo "🔄 Restarting Nginx..."
sudo systemctl restart nginx

echo "✅ Deployment Successful at $(date)!"
pm2 status
