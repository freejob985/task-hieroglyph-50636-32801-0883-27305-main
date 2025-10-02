#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting production deployment...');

// Check if dist directory exists
const distPath = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distPath)) {
    console.error('❌ Build directory not found. Please run "npm run build" first.');
    process.exit(1);
}

// Load deployment configuration
let deploymentConfig = {};
try {
    const configPath = path.join(distPath, 'deployment-config.json');
    if (fs.existsSync(configPath)) {
        deploymentConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
} catch (error) {
    console.log('⚠️  Could not load deployment configuration');
}

// Deployment methods
const deploymentMethods = {
    // Local deployment (copy to local web server)
    local: () => {
        console.log('📁 Deploying locally...');
        const localPath = process.env.LOCAL_DEPLOY_PATH || '/var/www/html';
        
        try {
            execSync(`sudo cp -r dist/* ${localPath}/`, { stdio: 'inherit' });
            execSync(`sudo chown -R www-data:www-data ${localPath}`, { stdio: 'inherit' });
            execSync(`sudo chmod -R 755 ${localPath}`, { stdio: 'inherit' });
            console.log('✅ Local deployment completed');
        } catch (error) {
            console.error('❌ Local deployment failed:', error.message);
        }
    },

    // FTP deployment
    ftp: () => {
        console.log('🌐 Deploying via FTP...');
        const ftpConfig = {
            host: process.env.FTP_HOST || 'your-ftp-host.com',
            user: process.env.FTP_USER || 'your-username',
            password: process.env.FTP_PASSWORD || 'your-password',
            remotePath: process.env.FTP_REMOTE_PATH || '/public_html'
        };

        // Create FTP deployment script
        const ftpScript = `#!/bin/bash
lftp -c "
open ftp://${ftpConfig.user}:${ftpConfig.password}@${ftpConfig.host}
cd ${ftpConfig.remotePath}
mirror -R dist/ . --delete --verbose
quit
"`;

        const scriptPath = path.join(__dirname, '..', 'ftp-deploy.sh');
        fs.writeFileSync(scriptPath, ftpScript);
        
        try {
            execSync(`chmod +x "${scriptPath}"`, { stdio: 'inherit' });
            execSync(`bash "${scriptPath}"`, { stdio: 'inherit' });
            console.log('✅ FTP deployment completed');
        } catch (error) {
            console.error('❌ FTP deployment failed:', error.message);
        }
    },

    // SSH/SCP deployment
    ssh: () => {
        console.log('🔐 Deploying via SSH...');
        const sshConfig = {
            host: process.env.SSH_HOST || 'your-server.com',
            user: process.env.SSH_USER || 'root',
            port: process.env.SSH_PORT || '22',
            remotePath: process.env.SSH_REMOTE_PATH || '/var/www/html'
        };

        try {
            // Create backup
            execSync(`ssh -p ${sshConfig.port} ${sshConfig.user}@${sshConfig.host} "mkdir -p /var/backups && cp -r ${sshConfig.remotePath} /var/backups/backup-$(date +%Y%m%d-%H%M%S) || true"`, { stdio: 'inherit' });
            
            // Upload files
            execSync(`scp -P ${sshConfig.port} -r dist/* ${sshConfig.user}@${sshConfig.host}:${sshConfig.remotePath}/`, { stdio: 'inherit' });
            
            // Set permissions
            execSync(`ssh -p ${sshConfig.port} ${sshConfig.user}@${sshConfig.host} "chown -R www-data:www-data ${sshConfig.remotePath} && chmod -R 755 ${sshConfig.remotePath}"`, { stdio: 'inherit' });
            
            // Reload web server
            execSync(`ssh -p ${sshConfig.port} ${sshConfig.user}@${sshConfig.host} "systemctl reload nginx || systemctl reload apache2 || true"`, { stdio: 'inherit' });
            
            console.log('✅ SSH deployment completed');
        } catch (error) {
            console.error('❌ SSH deployment failed:', error.message);
        }
    },

    // GitHub Pages deployment
    github: () => {
        console.log('🐙 Deploying to GitHub Pages...');
        
        try {
            // Check if we're in a git repository
            execSync('git status', { stdio: 'pipe' });
            
            // Add and commit dist files
            execSync('git add dist/', { stdio: 'inherit' });
            execSync('git commit -m "Deploy: Update production build"', { stdio: 'inherit' });
            
            // Push to gh-pages branch
            execSync('git subtree push --prefix dist origin gh-pages', { stdio: 'inherit' });
            
            console.log('✅ GitHub Pages deployment completed');
            console.log('🌐 Your site should be available at: https://your-username.github.io/your-repo-name');
        } catch (error) {
            console.error('❌ GitHub Pages deployment failed:', error.message);
            console.log('💡 Make sure you have a gh-pages branch and proper GitHub Pages setup');
        }
    },

    // Netlify deployment
    netlify: () => {
        console.log('🌐 Deploying to Netlify...');
        
        try {
            // Check if Netlify CLI is installed
            execSync('netlify --version', { stdio: 'pipe' });
            
            // Deploy to Netlify
            execSync('netlify deploy --prod --dir=dist', { stdio: 'inherit' });
            
            console.log('✅ Netlify deployment completed');
        } catch (error) {
            console.error('❌ Netlify deployment failed:', error.message);
            console.log('💡 Install Netlify CLI: npm install -g netlify-cli');
        }
    },

    // Vercel deployment
    vercel: () => {
        console.log('▲ Deploying to Vercel...');
        
        try {
            // Check if Vercel CLI is installed
            execSync('vercel --version', { stdio: 'pipe' });
            
            // Deploy to Vercel
            execSync('vercel --prod', { stdio: 'inherit' });
            
            console.log('✅ Vercel deployment completed');
        } catch (error) {
            console.error('❌ Vercel deployment failed:', error.message);
            console.log('💡 Install Vercel CLI: npm install -g vercel');
        }
    }
};

// Main deployment logic
const main = () => {
    const deploymentMethod = process.env.DEPLOYMENT_METHOD || 'local';
    
    console.log(`🎯 Using deployment method: ${deploymentMethod}`);
    
    if (deploymentMethods[deploymentMethod]) {
        deploymentMethods[deploymentMethod]();
    } else {
        console.error(`❌ Unknown deployment method: ${deploymentMethod}`);
        console.log('Available methods: local, ftp, ssh, github, netlify, vercel');
        process.exit(1);
    }
    
    // Post-deployment tasks
    console.log('\n🔍 Running post-deployment tasks...');
    
    // Create deployment log
    const logEntry = {
        timestamp: new Date().toISOString(),
        method: deploymentMethod,
        version: deploymentConfig.version || '1.0.0',
        buildTime: deploymentConfig.buildTime || new Date().toISOString(),
        status: 'completed'
    };
    
    const logPath = path.join(__dirname, '..', 'deployment.log');
    const existingLogs = fs.existsSync(logPath) ? JSON.parse(fs.readFileSync(logPath, 'utf8')) : [];
    existingLogs.push(logEntry);
    fs.writeFileSync(logPath, JSON.stringify(existingLogs, null, 2));
    
    console.log('✅ Deployment log updated');
    console.log('\n🎉 Deployment completed successfully!');
    console.log('📊 Check deployment.log for details');
};

// Run deployment
main();
