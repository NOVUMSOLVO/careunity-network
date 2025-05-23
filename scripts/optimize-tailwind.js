// Tailwind CSS 3.x Optimization Script
const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

console.log('🎨 Optimizing Tailwind CSS using JIT compilation...');

// Run Tailwind CSS build with optimal settings
try {
  // Generate optimized CSS
  execSync('npx tailwindcss -i ./client/src/index.css -o ./dist/assets/optimized.css --minify', {
    stdio: 'inherit'
  });
  
  console.log('✅ Successfully optimized Tailwind CSS output');
  
  // Get file size information
  const stats = fs.statSync('./dist/assets/optimized.css');
  const fileSizeInKB = (stats.size / 1024).toFixed(2);
  console.log(`📊 Generated CSS size: ${fileSizeInKB} KB`);
  
} catch (error) {
  console.error('❌ Error optimizing Tailwind CSS:', error);
  process.exit(1);
}
