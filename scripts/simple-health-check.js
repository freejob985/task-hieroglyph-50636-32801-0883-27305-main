#!/usr/bin/env node

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🏥 Running simple health check...');

// Configuration
const config = {
    domain: process.env.VITE_CUSTOM_DOMAIN || 'localhost',
    port: process.env.VITE_PORT || '8080',
    protocol: process.env.VITE_SSL_ENABLED === 'true' ? 'https' : 'http',
    timeout: 10000
};

// Simple HTTP check
const checkHttp = (url) => {
    return new Promise((resolve) => {
        const client = url.startsWith('https') ? https : http;
        const startTime = Date.now();
        
        const req = client.get(url, { timeout: config.timeout }, (res) => {
            resolve({
                status: 'success',
                statusCode: res.statusCode,
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
                error: 'Request timeout',
                responseTime: Date.now() - startTime
            });
        });
    });
};

// Main health check
const runHealthCheck = async () => {
    const results = {
        timestamp: new Date().toISOString(),
        domain: config.domain,
        checks: {}
    };
    
    console.log(`🔍 Checking ${config.domain}...`);
    
    // HTTP/HTTPS Check
    const url = `${config.protocol}://${config.domain}:${config.port}`;
    console.log(`🌐 Checking HTTP/HTTPS (${url})...`);
    results.checks.http = await checkHttp(url);
    console.log(`   ${results.checks.http.status === 'success' ? '✅' : '❌'} HTTP: ${results.checks.http.statusCode || results.checks.http.status}`);
    
    // Overall Status
    results.overallStatus = results.checks.http.status === 'success' ? 'healthy' : 'unhealthy';
    
    console.log(`\n📊 Health Check Results:`);
    console.log(`   Overall Status: ${results.overallStatus === 'healthy' ? '✅ Healthy' : '❌ Unhealthy'}`);
    console.log(`   Domain: ${config.domain}`);
    console.log(`   Protocol: ${config.protocol}`);
    console.log(`   Port: ${config.port}`);
    
    if (results.checks.http.status === 'success') {
        console.log(`   Response Time: ${results.checks.http.responseTime}ms`);
        console.log(`   Status Code: ${results.checks.http.statusCode}`);
    }
    
    // Save results
    try {
        const logPath = path.join(__dirname, '..', 'health-check.log');
        const existingLogs = fs.existsSync(logPath) ? JSON.parse(fs.readFileSync(logPath, 'utf8')) : [];
        existingLogs.push(results);
        fs.writeFileSync(logPath, JSON.stringify(existingLogs, null, 2));
        console.log(`\n📝 Results saved to health-check.log`);
    } catch (error) {
        console.error('❌ Failed to save results:', error.message);
    }
    
    // Exit with appropriate code
    process.exit(results.overallStatus === 'healthy' ? 0 : 1);
};

// Run health check
runHealthCheck().catch(error => {
    console.error('❌ Health check failed:', error.message);
    process.exit(1);
});
