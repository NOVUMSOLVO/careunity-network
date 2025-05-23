@echo off
echo Starting mobile optimization build process...

REM Create dist directory if it doesn't exist
if not exist dist mkdir dist
if not exist dist\js mkdir dist\js
if not exist dist\assets mkdir dist\assets

REM Copy the service worker file
echo Setting up service worker...
copy mobile-service-worker-optimized.js dist\mobile-service-worker.js

REM Copy the HTML file
echo Setting up optimized HTML...
copy careunity-mobile-optimized.html dist\careunity-mobile.html

REM Copy JS files (simulating bundled files for testing)
echo Creating sample bundled files...
echo console.log("Main bundle loaded"); > dist\assets\main-bundle.js
echo console.log("Vendor bundle loaded"); > dist\assets\vendor-bundle.js
echo console.log("Voice features loaded"); > dist\assets\voice-features-bundle.js
echo console.log("Care plan features loaded"); > dist\assets\care-plan-features-bundle.js

REM Copy image handler
copy js\image-handler.js dist\js\

echo Build completed! Test files are in the 'dist' directory.
echo Please run full build with 'npm run build:mobile' when ready.
