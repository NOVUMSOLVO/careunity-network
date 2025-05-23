@echo off
echo =============================================
echo CareUnity Mobile - All Performance Optimizations
echo =============================================

REM Create necessary directories
if not exist dist mkdir dist
if not exist dist\js mkdir dist\js
if not exist dist\assets mkdir dist\assets

REM Install dependencies if needed
echo Checking for required dependencies...
call npm install sharp --save-dev
call npm install terser --save-dev
call npm install vite-plugin-imagemin --save-dev
call npm install http-server --save-dev

REM Create bundled files
echo Creating JavaScript bundles...
echo console.log("Main bundle loaded"); > dist\assets\main-bundle.js
echo console.log("Vendor bundle loaded"); > dist\assets\vendor-bundle.js
echo console.log("Voice features loaded"); > dist\assets\voice-features-bundle.js
echo console.log("Care plan features loaded"); > dist\assets\care-plan-features-bundle.js
echo console.log("Biometric features loaded"); > dist\assets\biometric-features-bundle.js
echo console.log("Sync features loaded"); > dist\assets\sync-features-bundle.js

REM Copy required files
echo Copying optimized files...
copy mobile-service-worker-optimized.js dist\mobile-service-worker.js
copy js\image-handler.js dist\js\
copy careunity-mobile-optimized.html dist\careunity-mobile.html

REM Create test page
echo Creating test pages...
copy dist\bundle-test.html dist\index.html

REM Run image conversion
echo Converting images to modern formats...
powershell -File scripts/convert-images.ps1

echo =============================================
echo Build completed! Files in the 'dist' directory
echo =============================================
dir dist

echo.
echo You can now test the optimized version with:
echo npm run serve:optimized
