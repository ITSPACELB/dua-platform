#!/bin/bash

echo "Starting deployment..."

# Navigate to project directory
cd /var/www/dua-platform

# Pull latest changes from GitHub
echo "Pulling updates from GitHub..."
git pull origin main

# Install new dependencies if any
echo "Installing dependencies..."
npm install

# Rebuild the project
echo "Building project..."
npm run build

# Restart PM2
echo "Restarting application..."
pm2 restart dua-platform

echo "Deployment completed successfully!"
pm2 logs dua-platform --lines 5
