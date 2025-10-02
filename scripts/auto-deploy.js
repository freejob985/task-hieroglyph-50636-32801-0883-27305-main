#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🤖 Starting automatic deployment system...');

// Configuration
const config = {
    deploymentInterval: parseInt(process.env.DEPLOYMENT_INTERVAL) || 300000, // 5 minutes
    maxRetries: 3,
    retryDelay: 30000, // 30 seconds
    healthCheckInterval: 60000, // 1 minute
    notificationWebhook: process.env.NOTIFICATION_WEBHOOK,
    deploymentMethod: process.env.DEPLOYMENT_METHOD || 'local'
};

let deploymentCount = 0;
let isDeploying = false;
let healthCheckInterval;

// Deployment function
const deploy = async (retryCount = 0) => {
    if (isDeploying) {
        console.log('⏳ Deployment already in progress, skipping...');
        return;
    }
    
    isDeploying = true;
    deploymentCount++;
    
    console.log(`🚀 Starting deployment #${deploymentCount} (attempt ${retryCount + 1})...`);
    
    try {
        // Run pre-deployment checks
        console.log('🔍 Running pre-deployment checks...');
        execSync('npm run type-check', { 
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });
        execSync('npm run lint', { 
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });
        
        // Build project
        console.log('🔨 Building project...');
        execSync('npm run build', { 
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });
        
        // Deploy
        console.log('📤 Deploying to production...');
        execSync('npm run deploy:production', { 
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });
        
        console.log('✅ Deployment completed successfully');
        
        // Send success notification
        await sendNotification('success', `Deployment #${deploymentCount} completed successfully`);
        
        // Start health monitoring
        startHealthMonitoring();
        
    } catch (error) {
        console.error(`❌ Deployment failed (attempt ${retryCount + 1}):`, error.message);
        
        if (retryCount < config.maxRetries) {
            console.log(`⏳ Retrying in ${config.retryDelay / 1000} seconds...`);
            setTimeout(() => deploy(retryCount + 1), config.retryDelay);
        } else {
            console.error('❌ Max retries reached. Deployment failed.');
            await sendNotification('error', `Deployment #${deploymentCount} failed after ${config.maxRetries} retries`);
        }
    } finally {
        isDeploying = false;
    }
};

// Health monitoring
const startHealthMonitoring = () => {
    if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
    }
    
    console.log('🏥 Starting health monitoring...');
    
    healthCheckInterval = setInterval(async () => {
        try {
            console.log('🔍 Running health check...');
            execSync('npm run health:check', { 
                stdio: 'inherit',
                cwd: path.join(__dirname, '..')
            });
            console.log('✅ Health check passed');
        } catch (error) {
            console.error('❌ Health check failed:', error.message);
            await sendNotification('warning', 'Health check failed - manual intervention may be required');
        }
    }, config.healthCheckInterval);
};

// Notification function
const sendNotification = async (type, message) => {
    if (!config.notificationWebhook) {
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
        return;
    }
    
    try {
        const payload = {
            type,
            message,
            timestamp: new Date().toISOString(),
            deploymentCount,
            deploymentMethod: config.deploymentMethod
        };
        
        // Send webhook notification
        const response = await fetch(config.notificationWebhook, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            console.log('📢 Notification sent successfully');
        } else {
            console.error('❌ Failed to send notification');
        }
    } catch (error) {
        console.error('❌ Notification error:', error.message);
    }
};

// Scheduled deployment
const startScheduledDeployment = () => {
    console.log(`⏰ Starting scheduled deployment every ${config.deploymentInterval / 1000} seconds...`);
    
    setInterval(() => {
        console.log('⏰ Scheduled deployment triggered');
        deploy();
    }, config.deploymentInterval);
};

// Manual deployment trigger
const triggerManualDeployment = () => {
    console.log('👤 Manual deployment triggered');
    deploy();
};

// Graceful shutdown
const shutdown = () => {
    console.log('\n🛑 Shutting down automatic deployment system...');
    
    if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
    }
    
    process.exit(0);
};

// Command line interface
const main = () => {
    const args = process.argv.slice(2);
    
    if (args.includes('--manual')) {
        triggerManualDeployment();
    } else if (args.includes('--health-only')) {
        startHealthMonitoring();
    } else {
        startScheduledDeployment();
    }
    
    // Handle shutdown signals
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    
    console.log('🤖 Automatic deployment system started');
    console.log('   Press Ctrl+C to stop');
    console.log('   Use --manual for immediate deployment');
    console.log('   Use --health-only for health monitoring only');
};

// Run main function
main();
