# SSL Certificate Setup Guide

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
