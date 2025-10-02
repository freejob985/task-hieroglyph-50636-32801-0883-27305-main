#!/usr/bin/env node

import https from 'https';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🏥 Running health check...');

// Configuration
const config = {
    domain: process.env.VITE_CUSTOM_DOMAIN || 'localhost',
    port: process.env.VITE_PORT || '8080',
    protocol: process.env.VITE_SSL_ENABLED === 'true' ? 'https' : 'http',
    timeout: 10000
};

// Health check functions
const checkHttp = (url) => {
    return new Promise((resolve) => {
        const client = url.startsWith('https') ? https : http;
        
        const req = client.get(url, { timeout: config.timeout }, (res) => {
            resolve({
                status: 'success',
                statusCode: res.statusCode,
                headers: res.headers,
                responseTime: Date.now() - startTime
            });
        });
        
        const startTime = Date.now();
        
        req.on('error', (error) => {
            resolve({
                status: 'error',
                error: error.message,
                responseTime: Date.now() - startTime
            });
        });
        
        req.on('timeout', () => {
            req.destroy();
            resolve({
                status: 'timeout',
                error: 'Request timeout',
                responseTime: Date.now() - startTime
            });
        });
    });
};

const checkSSL = (domain) => {
    return new Promise((resolve) => {
        const options = {
            host: domain,
            port: 443,
            timeout: config.timeout,
            rejectUnauthorized: false
        };
        
        const startTime = Date.now();
        
        const req = https.request(options, (res) => {
            const cert = res.connection.getPeerCertificate();
            resolve({
                status: 'success',
                valid: cert.valid_to > new Date(),
                issuer: cert.issuer,
                subject: cert.subject,
                validFrom: cert.valid_from,
                validTo: cert.valid_to,
                responseTime: Date.now() - startTime
            });
        });
        
        req.on('error', (error) => {
            resolve({
                status: 'error',
                error: error.message,
                responseTime: Date.now() - startTime
            });
        });
        
        req.on('timeout', () => {
            req.destroy();
            resolve({
                status: 'timeout',
                error: 'SSL check timeout',
                responseTime: Date.now() - startTime
            });
        });
        
        req.end();
    });
};

const checkDNS = (domain) => {
    return new Promise((resolve) => {
        import('dns').then(dns => {
            const startTime = Date.now();
            
            dns.resolve4(domain, (err, addresses) => {
                if (err) {
                    resolve({
                        status: 'error',
                        error: err.message,
                        responseTime: Date.now() - startTime
                    });
                } else {
                    resolve({
                        status: 'success',
                        addresses: addresses,
                        responseTime: Date.now() - startTime
                    });
                }
            });
        }).catch(error => {
            resolve({
                status: 'error',
                error: error.message,
                responseTime: 0
            });
        });
    });
};

const checkPerformance = (url) => {
    return new Promise(async (resolve) => {
        const startTime = Date.now();
        
        try {
            const result = await checkHttp(url);
            const totalTime = Date.now() - startTime;
            
            resolve({
                ...result,
                totalTime,
                performance: totalTime < 1000 ? 'excellent' : 
                           totalTime < 3000 ? 'good' : 
                           totalTime < 5000 ? 'fair' : 'poor'
            });
        } catch (error) {
            resolve({
                status: 'error',
                error: error.message,
                totalTime: Date.now() - startTime
            });
        }
    });
};

// Main health check function
const runHealthCheck = async () => {
    const results = {
        timestamp: new Date().toISOString(),
        domain: config.domain,
        checks: {}
    };
    
    console.log(`🔍 Checking ${config.domain}...`);
    
    // DNS Check
    console.log('📡 Checking DNS resolution...');
    results.checks.dns = await checkDNS(config.domain);
    console.log(`   ${results.checks.dns.status === 'success' ? '✅' : '❌'} DNS: ${results.checks.dns.status}`);
    
    // HTTP/HTTPS Check
    const url = `${config.protocol}://${config.domain}:${config.port}`;
    console.log(`🌐 Checking HTTP/HTTPS (${url})...`);
    results.checks.http = await checkHttp(url);
    console.log(`   ${results.checks.http.status === 'success' ? '✅' : '❌'} HTTP: ${results.checks.http.statusCode || results.checks.http.status}`);
    
    // SSL Check (if HTTPS)
    if (config.protocol === 'https') {
        console.log('🔒 Checking SSL certificate...');
        results.checks.ssl = await checkSSL(config.domain);
        console.log(`   ${results.checks.ssl.status === 'success' ? '✅' : '❌'} SSL: ${results.checks.ssl.status}`);
    }
    
    // Performance Check
    console.log('⚡ Checking performance...');
    results.checks.performance = await checkPerformance(url);
    console.log(`   ${results.checks.performance.status === 'success' ? '✅' : '❌'} Performance: ${results.checks.performance.performance || results.checks.performance.status}`);
    
    // Overall Status
    const allChecks = Object.values(results.checks);
    const failedChecks = allChecks.filter(check => check.status !== 'success');
    results.overallStatus = failedChecks.length === 0 ? 'healthy' : 'unhealthy';
    
    console.log(`\n📊 Health Check Results:`);
    console.log(`   Overall Status: ${results.overallStatus === 'healthy' ? '✅ Healthy' : '❌ Unhealthy'}`);
    console.log(`   Domain: ${config.domain}`);
    console.log(`   Protocol: ${config.protocol}`);
    console.log(`   Port: ${config.port}`);
    
    if (results.checks.http.status === 'success') {
        console.log(`   Response Time: ${results.checks.http.responseTime}ms`);
        console.log(`   Status Code: ${results.checks.http.statusCode}`);
    }
    
    if (results.checks.ssl && results.checks.ssl.status === 'success') {
        console.log(`   SSL Valid: ${results.checks.ssl.valid ? 'Yes' : 'No'}`);
        console.log(`   SSL Issuer: ${results.checks.ssl.issuer?.CN || 'Unknown'}`);
    }
    
    if (results.checks.performance.status === 'success') {
        console.log(`   Performance: ${results.checks.performance.performance}`);
    }
    
    // Save results
    import('fs').then(fs => {
        const logPath = path.join(__dirname, '..', 'health-check.log');
        const existingLogs = fs.existsSync(logPath) ? JSON.parse(fs.readFileSync(logPath, 'utf8')) : [];
        existingLogs.push(results);
        fs.writeFileSync(logPath, JSON.stringify(existingLogs, null, 2));
    }).catch(error => {
        console.error('❌ Failed to save health check results:', error.message);
    });
    
    console.log(`\n📝 Results saved to health-check.log`);
    
    // Exit with appropriate code
    process.exit(results.overallStatus === 'healthy' ? 0 : 1);
};

// Run health check
runHealthCheck().catch(error => {
    console.error('❌ Health check failed:', error.message);
    process.exit(1);
});
