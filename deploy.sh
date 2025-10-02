#!/bin/bash

# Deployment Script
# This script will deploy your application to the server

DOMAIN="your-domain.com"
SERVER_USER="root"
SERVER_HOST="your-server-ip"
DEPLOY_PATH="/var/www/$DOMAIN"
BACKUP_PATH="/var/backups/$DOMAIN"

echo "🚀 Starting deployment to $DOMAIN..."

# Create backup
echo "📦 Creating backup..."
ssh $SERVER_USER@$SERVER_HOST "mkdir -p $BACKUP_PATH && cp -r $DEPLOY_PATH $BACKUP_PATH/backup-$(date +%Y%m%d-%H%M%S) || true"

# Upload files
echo "📤 Uploading files..."
rsync -avz --delete dist/ $SERVER_USER@$SERVER_HOST:$DEPLOY_PATH/

# Set permissions
echo "🔐 Setting permissions..."
ssh $SERVER_USER@$SERVER_HOST "chown -R www-data:www-data $DEPLOY_PATH && chmod -R 755 $DEPLOY_PATH"

# Reload nginx
echo "🔄 Reloading nginx..."
ssh $SERVER_USER@$SERVER_HOST "nginx -t && systemctl reload nginx"

echo "✅ Deployment completed successfully!"
echo "🌐 Your site is now live at: https://$DOMAIN"
