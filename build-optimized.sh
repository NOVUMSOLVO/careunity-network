#!/bin/bash

# CareUnity Network - Mobile Optimization Build Script
# This script builds the optimized mobile version of CareUnity Network
# For Linux/Mac users

echo "🚀 Starting CareUnity Mobile Optimization Build Process"

# Ensure dependencies are installed
echo "📦 Checking dependencies..."
npm install

# Run Tailwind CSS 3.x optimization
echo "🎨 Running Tailwind CSS 3.x optimization..."
node scripts/optimize-tailwind.js

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Run the optimization build using Vite
echo "⚙️ Building optimized mobile version..."
npx vite build --config vite.mobile.config.js

# Optimize images for modern formats
echo "🖼️ Optimizing images for modern formats..."
npx vite-imagetools

# Generate service worker
echo "🔄 Generating service worker..."
npx workbox generateSW workbox-config.js

# Run post-build optimizations
echo "✨ Running post-build optimizations..."
node fix-imports.js

# Generate build report
echo "📊 Generating build report..."
npx vite-bundle-visualizer

echo "✅ Build complete! Optimized mobile version is available in the 'dist' directory"
echo "📱 To test locally, run: npm run serve-mobile"
