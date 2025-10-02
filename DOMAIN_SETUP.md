# Custom Domain Setup Instructions

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
