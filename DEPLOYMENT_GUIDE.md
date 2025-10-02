# 🚀 دليل النشر والاستضافة - Deployment Guide

## نظرة عامة - Overview

تم إعداد نظام شامل للنشر التلقائي والاستضافة مع دومين مخصص. يتضمن النظام:

A comprehensive deployment and hosting system with custom domain has been set up. The system includes:

- ✅ إعداد دومين مخصص - Custom domain setup
- ✅ بناء تلقائي - Automatic building
- ✅ نشر تلقائي - Automatic deployment
- ✅ مراقبة الصحة - Health monitoring
- ✅ شهادات SSL - SSL certificates
- ✅ إعدادات البيئة - Environment configuration

## 🛠️ الإعداد الأولي - Initial Setup

### 1. تثبيت التبعيات - Install Dependencies

```bash
npm install
```

### 2. إعداد متغيرات البيئة - Setup Environment Variables

```bash
npm run setup:env
```

ثم قم بتعديل ملف `.env` مع إعداداتك:

Then edit the `.env` file with your settings:

```bash
# Custom Domain Configuration
VITE_CUSTOM_DOMAIN=your-domain.com
VITE_SSL_ENABLED=true
VITE_PORT=8080

# Deployment Configuration
DEPLOYMENT_METHOD=local
AUTO_BUILD=true
AUTO_DEPLOY=false
```

### 3. إعداد الدومين - Setup Domain

```bash
npm run setup:domain
```

### 4. إعداد SSL - Setup SSL

```bash
npm run setup:ssl
```

## 🚀 الأوامر المتاحة - Available Commands

### التطوير - Development

```bash
# تشغيل خادم التطوير - Start development server
npm run dev

# تشغيل مع دومين مخصص - Run with custom domain
npm run dev:custom

# مراقبة تلقائية للتطوير - Auto-watch for development
npm run auto:dev
```

### البناء - Building

```bash
# بناء للإنتاج - Build for production
npm run build

# بناء للتطوير - Build for development
npm run build:dev

# بناء مع تحليل الحجم - Build with bundle analysis
npm run build:analyze

# بناء تلقائي - Auto build
npm run auto:build
```

### النشر - Deployment

```bash
# نشر للإنتاج - Deploy to production
npm run deploy:production

# نشر محلي - Local deployment
npm run deploy:local

# نشر عبر FTP - FTP deployment
npm run deploy:ftp

# نشر عبر SSH - SSH deployment
npm run deploy:ssh
```

### المراقبة التلقائية - Automatic Monitoring

```bash
# مراقبة الملفات - File watching
npm run auto:watch

# نشر تلقائي - Automatic deployment
npm run auto:deploy

# نشر يدوي - Manual deployment
npm run auto:deploy:manual

# مراقبة الصحة فقط - Health monitoring only
npm run auto:deploy:health

# مراقبة شاملة - Full monitoring
npm run monitor
```

### الصحة والفحص - Health & Testing

```bash
# فحص الصحة - Health check
npm run health:check

# فحص الأنواع - Type checking
npm run type-check

# فحص الكود - Linting
npm run lint

# إصلاح الكود - Fix linting issues
npm run lint:fix
```

## 🌐 إعداد الدومين المخصص - Custom Domain Setup

### 1. إعداد DNS

قم بتوجيه دومينك إلى خادمك:

Point your domain to your server:

```
A Record: your-domain.com → YOUR_SERVER_IP
CNAME: www.your-domain.com → your-domain.com
```

### 2. إعداد Nginx

```bash
# نسخ ملف الإعداد - Copy configuration
sudo cp nginx.conf /etc/nginx/sites-available/your-site

# تفعيل الموقع - Enable site
sudo ln -s /etc/nginx/sites-available/your-site /etc/nginx/sites-enabled/

# اختبار الإعداد - Test configuration
sudo nginx -t

# إعادة تحميل - Reload nginx
sudo systemctl reload nginx
```

### 3. شهادات SSL

#### للتنمية - For Development:
```bash
npm run setup:ssl
```

#### للإنتاج - For Production:
```bash
# Let's Encrypt
bash setup-letsencrypt.sh

# أو Cloudflare SSL
# Add domain to Cloudflare and enable SSL
```

## 📁 هيكل الملفات - File Structure

```
project/
├── scripts/
│   ├── setup-domain.js      # إعداد الدومين
│   ├── setup-ssl.js         # إعداد SSL
│   ├── deploy-prepare.js    # تحضير النشر
│   ├── deploy-production.js # نشر الإنتاج
│   ├── auto-watch.js        # مراقبة الملفات
│   ├── auto-deploy.js       # نشر تلقائي
│   └── health-check.js      # فحص الصحة
├── certs/                   # شهادات SSL
├── dist/                    # ملفات البناء
├── nginx.conf              # إعداد Nginx
├── deploy.sh               # سكريبت النشر
├── env.example             # مثال متغيرات البيئة
└── .env                    # متغيرات البيئة
```

## 🔧 إعدادات متقدمة - Advanced Configuration

### متغيرات البيئة - Environment Variables

```bash
# الدومين - Domain
VITE_CUSTOM_DOMAIN=your-domain.com

# SSL - SSL
VITE_SSL_ENABLED=true
VITE_SSL_CERT_PATH=./certs/certificate.crt
VITE_SSL_KEY_PATH=./certs/private.key

# النشر - Deployment
DEPLOYMENT_METHOD=local|ftp|ssh|github|netlify|vercel
AUTO_BUILD=true
AUTO_DEPLOY=false
AUTO_LINT=true

# FTP - FTP
FTP_HOST=your-ftp-host.com
FTP_USER=your-username
FTP_PASSWORD=your-password

# SSH - SSH
SSH_HOST=your-server.com
SSH_USER=root
SSH_PORT=22
```

### طرق النشر - Deployment Methods

1. **محلي - Local**: نسخ إلى مجلد محلي
2. **FTP**: رفع عبر FTP
3. **SSH**: رفع عبر SSH/SCP
4. **GitHub Pages**: نشر على GitHub Pages
5. **Netlify**: نشر على Netlify
6. **Vercel**: نشر على Vercel

## 📊 المراقبة - Monitoring

### فحص الصحة - Health Check

```bash
npm run health:check
```

يتحقق من:
- DNS resolution
- HTTP/HTTPS response
- SSL certificate validity
- Performance metrics

### السجلات - Logs

- `deployment.log`: سجل النشر
- `health-check.log`: سجل فحص الصحة

## 🚨 استكشاف الأخطاء - Troubleshooting

### مشاكل شائعة - Common Issues

1. **خطأ في البناء - Build Error**:
   ```bash
   npm run clean
   npm run build
   ```

2. **خطأ في SSL - SSL Error**:
   ```bash
   npm run setup:ssl
   ```

3. **خطأ في النشر - Deployment Error**:
   ```bash
   npm run health:check
   ```

4. **خطأ في الدومين - Domain Error**:
   ```bash
   npm run setup:domain
   ```

### فحص الحالة - Status Check

```bash
# فحص شامل - Full status check
npm run health:check

# فحص النشر - Deployment status
cat deployment.log

# فحص الصحة - Health status
cat health-check.log
```

## 📞 الدعم - Support

إذا واجهت أي مشاكل:

If you encounter any issues:

1. تحقق من السجلات - Check logs
2. شغل فحص الصحة - Run health check
3. راجع إعدادات البيئة - Review environment settings
4. تأكد من صحة الدومين - Verify domain setup

## 🎉 تهانينا! - Congratulations!

تم إعداد نظام النشر والاستضافة بنجاح! يمكنك الآن:

Your deployment and hosting system is ready! You can now:

- ✅ استخدام دومين مخصص - Use custom domain
- ✅ بناء تلقائي - Automatic building
- ✅ نشر تلقائي - Automatic deployment
- ✅ مراقبة الصحة - Health monitoring
- ✅ SSL آمن - Secure SSL

**ابدأ الآن - Start now:**
```bash
npm run setup:env
npm run setup:domain
npm run build
npm run deploy:production
```
