#!/usr/bin/env node

import { watch } from 'chokidar';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('👀 Starting automatic file watcher...');

// Configuration
const config = {
    watchPaths: [
        'src/**/*',
        'public/**/*',
        '*.config.*',
        'package.json'
    ],
    ignorePaths: [
        'node_modules/**',
        'dist/**',
        '.git/**',
        '*.log'
    ],
    debounceDelay: 1000,
    autoBuild: process.env.AUTO_BUILD === 'true',
    autoDeploy: process.env.AUTO_DEPLOY === 'true',
    autoLint: process.env.AUTO_LINT === 'true'
};

let buildTimeout;
let isBuilding = false;

// Build function
const build = async () => {
    if (isBuilding) {
        console.log('⏳ Build already in progress, skipping...');
        return;
    }
    
    isBuilding = true;
    console.log('🔨 Building project...');
    
    try {
        execSync('npm run build', { 
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });
        console.log('✅ Build completed successfully');
        
        if (config.autoDeploy) {
            console.log('🚀 Auto-deploying...');
            execSync('npm run deploy:production', { 
                stdio: 'inherit',
                cwd: path.join(__dirname, '..')
            });
            console.log('✅ Auto-deployment completed');
        }
    } catch (error) {
        console.error('❌ Build failed:', error.message);
    } finally {
        isBuilding = false;
    }
};

// Lint function
const lint = async () => {
    console.log('🔍 Running linter...');
    
    try {
        execSync('npm run lint:fix', { 
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });
        console.log('✅ Linting completed');
    } catch (error) {
        console.error('❌ Linting failed:', error.message);
    }
};

// Debounced build function
const debouncedBuild = () => {
    if (buildTimeout) {
        clearTimeout(buildTimeout);
    }
    
    buildTimeout = setTimeout(() => {
        if (config.autoBuild) {
            build();
        }
    }, config.debounceDelay);
};

// File change handler
const handleFileChange = (filePath) => {
    console.log(`📝 File changed: ${filePath}`);
    
    // Run linting if enabled
    if (config.autoLint) {
        lint();
    }
    
    // Trigger build if enabled
    if (config.autoBuild) {
        debouncedBuild();
    }
};

// Start watching
const startWatching = () => {
    console.log('👀 Watching files for changes...');
    console.log(`   Watch paths: ${config.watchPaths.join(', ')}`);
    console.log(`   Ignore paths: ${config.ignorePaths.join(', ')}`);
    console.log(`   Auto build: ${config.autoBuild ? 'enabled' : 'disabled'}`);
    console.log(`   Auto deploy: ${config.autoDeploy ? 'enabled' : 'disabled'}`);
    console.log(`   Auto lint: ${config.autoLint ? 'enabled' : 'disabled'}`);
    
    const watcher = watch(config.watchPaths, {
        ignored: config.ignorePaths,
        persistent: true,
        ignoreInitial: true
    });
    
    watcher.on('change', handleFileChange);
    watcher.on('add', handleFileChange);
    watcher.on('unlink', handleFileChange);
    
    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Stopping file watcher...');
        watcher.close();
        process.exit(0);
    });
    
    console.log('✅ File watcher started. Press Ctrl+C to stop.');
};

// Check dependencies
const checkDependencies = () => {
    try {
        require('chokidar');
    } catch (error) {
        console.error('❌ chokidar not found. Installing...');
        execSync('npm install chokidar --save-dev', { 
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });
    }
};

// Main execution
const main = () => {
    checkDependencies();
    startWatching();
};

main();
