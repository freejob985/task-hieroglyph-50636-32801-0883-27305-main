#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🌐 Setting up custom domain configuration...');

// Create .env file for domain configuration
const envContent = `# Custom Domain Configuration
VITE_CUSTOM_DOMAIN=your-custom-domain.com
VITE_APP_TITLE=Todo App
VITE_APP_DESCRIPTION=Advanced Todo Management Application
VITE_API_URL=https://api.your-custom-domain.com
VITE_CDN_URL=https://cdn.your-custom-domain.com

# SSL Configuration
VITE_SSL_ENABLED=true
VITE_SSL_CERT_PATH=./certs/certificate.crt
VITE_SSL_KEY_PATH=./certs/private.key

# Build Configuration
VITE_BUILD_MODE=production
VITE_SOURCE_MAP=false
VITE_MINIFY=true
`;

const envPath = path.join(__dirname, '..', '.env');
fs.writeFileSync(envPath, envContent);
console.log('✅ Created .env file with domain configuration');

// Create nginx configuration template
const nginxConfig = `server {
    listen 80;
    server_name your-custom-domain.com www.your-custom-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-custom-domain.com www.your-custom-domain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
    
    # Root directory
    root /var/www/your-custom-domain.com;
    index index.html;
    
    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security
    location ~ /\\. {
        deny all;
    }
}`;

const nginxPath = path.join(__dirname, '..', 'nginx.conf');
fs.writeFileSync(nginxPath, nginxConfig);
console.log('✅ Created nginx.conf template');

// Create certs directory
const certsDir = path.join(__dirname, '..', 'certs');
if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir, { recursive: true });
    console.log('✅ Created certs directory');
}

// Create domain setup instructions
const instructions = `# Custom Domain Setup Instructions

## 1. Domain Configuration
- Update .env file with your actual domain name
- Replace 'your-custom-domain.com' with your real domain

## 2. SSL Certificate Setup
- Place your SSL certificate in ./certs/certificate.crt
- Place your private key in ./certs/private.key
- Or run: npm run setup:ssl

## 3. DNS Configuration
- Point your domain A record to your server IP
- Add CNAME record for www subdomain

## 4. Server Setup
- Install nginx on your server
- Copy nginx.conf to /etc/nginx/sites-available/
- Enable the site: sudo ln -s /etc/nginx/sites-available/your-site /etc/nginx/sites-enabled/
- Test configuration: sudo nginx -t
- Reload nginx: sudo systemctl reload nginx

## 5. Build and Deploy
- Run: npm run build
- Upload dist/ folder to your server
- Set proper permissions: chmod -R 755 /var/www/your-domain

## 6. Automatic Deployment
- Run: npm run deploy:production
- This will build and upload automatically

## 7. Health Check
- Run: npm run health:check
- This will verify your domain is working correctly
`;

const instructionsPath = path.join(__dirname, '..', 'DOMAIN_SETUP.md');
fs.writeFileSync(instructionsPath, instructions);
console.log('✅ Created DOMAIN_SETUP.md with detailed instructions');

console.log('\n🎉 Domain setup completed!');
console.log('📝 Next steps:');
console.log('1. Update .env file with your domain name');
console.log('2. Run: npm run setup:ssl (for SSL certificates)');
console.log('3. Follow instructions in DOMAIN_SETUP.md');
console.log('4. Run: npm run build && npm run deploy:production');
