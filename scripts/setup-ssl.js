#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔒 Setting up SSL certificates...');

const certsDir = path.join(__dirname, '..', 'certs');

// Create certs directory if it doesn't exist
if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir, { recursive: true });
    console.log('✅ Created certs directory');
}

// Generate self-signed certificate for development
const generateSelfSignedCert = () => {
    try {
        console.log('🔧 Generating self-signed certificate for development...');
        
        // Generate private key
        execSync(`openssl genrsa -out "${path.join(certsDir, 'private.key')}" 2048`, { stdio: 'inherit' });
        
        // Generate certificate
        execSync(`openssl req -new -x509 -key "${path.join(certsDir, 'private.key')}" -out "${path.join(certsDir, 'certificate.crt')}" -days 365 -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"`, { stdio: 'inherit' });
        
        console.log('✅ Self-signed certificate generated successfully');
        console.log('⚠️  Note: This is for development only. Use a real certificate for production.');
        
    } catch (error) {
        console.error('❌ Error generating self-signed certificate:', error.message);
        console.log('💡 Make sure OpenSSL is installed on your system');
    }
};

// Create Let's Encrypt setup script
const createLetsEncryptScript = () => {
    const letsEncryptScript = `#!/bin/bash

# Let's Encrypt SSL Certificate Setup
# Run this script on your production server

DOMAIN="your-custom-domain.com"
EMAIL="your-email@example.com"

# Install certbot if not already installed
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# Stop nginx temporarily
sudo systemctl stop nginx

# Generate certificate
sudo certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive

# Update nginx configuration
sudo sed -i "s/your-custom-domain.com/$DOMAIN/g" /etc/nginx/sites-available/your-site
sudo sed -i "s|/path/to/your/certificate.crt|/etc/letsencrypt/live/$DOMAIN/fullchain.pem|g" /etc/nginx/sites-available/your-site
sudo sed -i "s|/path/to/your/private.key|/etc/letsencrypt/live/$DOMAIN/privkey.pem|g" /etc/nginx/sites-available/your-site

# Test nginx configuration
sudo nginx -t

# Start nginx
sudo systemctl start nginx

# Set up auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -

echo "SSL certificate setup completed!"
echo "Your site should now be accessible at https://$DOMAIN"
`;

    const scriptPath = path.join(__dirname, '..', 'setup-letsencrypt.sh');
    fs.writeFileSync(scriptPath, letsEncryptScript);
    
    // Make it executable
    try {
        execSync(`chmod +x "${scriptPath}"`, { stdio: 'inherit' });
        console.log('✅ Created Let\'s Encrypt setup script');
    } catch (error) {
        console.log('⚠️  Could not make script executable (this is normal on Windows)');
    }
};

// Create SSL configuration guide
const createSSLGuide = () => {
    const sslGuide = `# SSL Certificate Setup Guide

## Development (Self-Signed Certificate)
The self-signed certificate has been generated for local development.
- Certificate: ./certs/certificate.crt
- Private Key: ./certs/private.key

## Production (Let's Encrypt)
For production, use Let's Encrypt for free SSL certificates:

### Option 1: Automated Setup
1. Upload setup-letsencrypt.sh to your server
2. Update the DOMAIN and EMAIL variables in the script
3. Run: bash setup-letsencrypt.sh

### Option 2: Manual Setup
1. Install certbot: sudo apt install certbot python3-certbot-nginx
2. Generate certificate: sudo certbot --nginx -d your-domain.com
3. Update nginx configuration with certificate paths
4. Test: sudo nginx -t
5. Reload: sudo systemctl reload nginx

### Option 3: Cloudflare SSL
1. Add your domain to Cloudflare
2. Set SSL/TLS encryption mode to "Full (strict)"
3. Enable "Always Use HTTPS"
4. Your site will automatically use Cloudflare's SSL

## Certificate Files
- Certificate: /etc/letsencrypt/live/your-domain.com/fullchain.pem
- Private Key: /etc/letsencrypt/live/your-domain.com/privkey.pem

## Auto-Renewal
Let's Encrypt certificates expire every 90 days. The setup script includes auto-renewal via cron.

## Testing SSL
- Check certificate: openssl x509 -in certificate.crt -text -noout
- Test SSL: curl -I https://your-domain.com
- Online test: https://www.ssllabs.com/ssltest/

## Troubleshooting
- Make sure port 443 is open
- Check nginx error logs: sudo tail -f /var/log/nginx/error.log
- Verify certificate: sudo certbot certificates
- Renew manually: sudo certbot renew
`;

    const guidePath = path.join(__dirname, '..', 'SSL_SETUP.md');
    fs.writeFileSync(guidePath, sslGuide);
    console.log('✅ Created SSL setup guide');
};

// Main execution
console.log('🔧 Setting up SSL certificates...');

// Check if OpenSSL is available
try {
    execSync('openssl version', { stdio: 'pipe' });
    generateSelfSignedCert();
} catch (error) {
    console.log('⚠️  OpenSSL not found. Skipping self-signed certificate generation.');
    console.log('💡 Install OpenSSL to generate development certificates.');
}

createLetsEncryptScript();
createSSLGuide();

console.log('\n🎉 SSL setup completed!');
console.log('📝 Next steps:');
console.log('1. For development: Use the generated self-signed certificate');
console.log('2. For production: Follow instructions in SSL_SETUP.md');
console.log('3. Run: npm run dev (for development with SSL)');
console.log('4. Run: npm run build && npm run deploy:production (for production)');
