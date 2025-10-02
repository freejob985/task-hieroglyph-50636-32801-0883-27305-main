#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Preparing deployment...');

// Create deployment configuration
const createDeploymentConfig = () => {
    const config = {
        version: process.env.npm_package_version || '1.0.0',
        buildTime: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
        domain: process.env.VITE_CUSTOM_DOMAIN || 'localhost',
        ssl: process.env.VITE_SSL_ENABLED === 'true',
        features: {
            pwa: true,
            analytics: false,
            monitoring: true,
            compression: true
        }
    };

    const configPath = path.join(__dirname, '..', 'dist', 'deployment-config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('✅ Created deployment configuration');
};

// Create .htaccess for Apache servers
const createHtaccess = () => {
    const htaccess = `# Apache Configuration for SPA
RewriteEngine On

# Handle client-side routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "no-referrer-when-downgrade"
    Header always set Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

# MIME types
<IfModule mod_mime.c>
    AddType application/javascript .js
    AddType text/css .css
    AddType image/svg+xml .svg
    AddType font/woff .woff
    AddType font/woff2 .woff2
</IfModule>
`;

    const htaccessPath = path.join(__dirname, '..', 'dist', '.htaccess');
    fs.writeFileSync(htaccessPath, htaccess);
    console.log('✅ Created .htaccess file');
};

// Create robots.txt
const createRobotsTxt = () => {
    const robots = `User-agent: *
Allow: /

Sitemap: https://${process.env.VITE_CUSTOM_DOMAIN || 'localhost'}/sitemap.xml
`;

    const robotsPath = path.join(__dirname, '..', 'dist', 'robots.txt');
    fs.writeFileSync(robotsPath, robots);
    console.log('✅ Created robots.txt');
};

// Create sitemap.xml
const createSitemap = () => {
    const domain = process.env.VITE_CUSTOM_DOMAIN || 'localhost';
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://${domain}/</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
</urlset>`;

    const sitemapPath = path.join(__dirname, '..', 'dist', 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap);
    console.log('✅ Created sitemap.xml');
};

// Create deployment script
const createDeploymentScript = () => {
    const deployScript = `#!/bin/bash

# Deployment Script
# This script will deploy your application to the server

DOMAIN="${process.env.VITE_CUSTOM_DOMAIN || 'your-domain.com'}"
SERVER_USER="root"
SERVER_HOST="your-server-ip"
DEPLOY_PATH="/var/www/$DOMAIN"
BACKUP_PATH="/var/backups/$DOMAIN"

echo "🚀 Starting deployment to $DOMAIN..."

# Create backup
echo "📦 Creating backup..."
ssh $SERVER_USER@$SERVER_HOST "mkdir -p $BACKUP_PATH && cp -r $DEPLOY_PATH $BACKUP_PATH/backup-\$(date +%Y%m%d-%H%M%S) || true"

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
`;

    const scriptPath = path.join(__dirname, '..', 'deploy.sh');
    fs.writeFileSync(scriptPath, deployScript);
    
    try {
        execSync(`chmod +x "${scriptPath}"`, { stdio: 'inherit' });
        console.log('✅ Created deployment script');
    } catch (error) {
        console.log('⚠️  Could not make script executable (this is normal on Windows)');
    }
};

// Main execution
try {
    createDeploymentConfig();
    createHtaccess();
    createRobotsTxt();
    createSitemap();
    createDeploymentScript();
    
    console.log('\n🎉 Deployment preparation completed!');
    console.log('📝 Files created:');
    console.log('  - dist/deployment-config.json');
    console.log('  - dist/.htaccess');
    console.log('  - dist/robots.txt');
    console.log('  - dist/sitemap.xml');
    console.log('  - deploy.sh');
    console.log('\n🚀 Ready for deployment!');
    console.log('Run: npm run deploy:production');
    
} catch (error) {
    console.error('❌ Error during deployment preparation:', error.message);
    process.exit(1);
}
