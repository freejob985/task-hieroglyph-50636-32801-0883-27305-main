#!/bin/bash

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
