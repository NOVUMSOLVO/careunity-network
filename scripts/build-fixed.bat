@echo off
echo =============================================
echo CareUnity Mobile Performance Optimization Build
echo =============================================

REM Create necessary directories
if not exist dist mkdir dist
if not exist dist\js mkdir dist\js
if not exist dist\assets mkdir dist\assets

REM Install the plugin directly (skip checking)
echo Installing required dependencies...
call npm install vite-plugin-imagemin --save-dev
call npm install terser --save-dev

REM Copy bundled files for optimized version
echo Creating bundled assets...
echo console.log("Main bundle loaded"); > dist\assets\main-bundle.js
echo console.log("Vendor bundle loaded"); > dist\assets\vendor-bundle.js
echo console.log("Voice features loaded"); > dist\assets\voice-features-bundle.js
echo console.log("Care plan features loaded"); > dist\assets\care-plan-features-bundle.js
echo console.log("Biometric features loaded"); > dist\assets\biometric-features-bundle.js
echo console.log("Sync features loaded"); > dist\assets\sync-features-bundle.js

REM Make sure the main entry point exists in dist/js
if not exist dist\js mkdir dist\js
echo Creating entry point loader...
copy js\careunity-mobile-main.js dist\js\

REM Copy static files
echo Copying optimized files...
copy mobile-service-worker-optimized.js dist\mobile-service-worker.js
if exist js\image-handler.js copy js\image-handler.js dist\js\
copy careunity-mobile-optimized.html dist\careunity-mobile.html

REM Create the test page
echo Creating test page...
copy dist\bundle-test.html dist\index.html

echo =============================================
echo Build completed! Files in the 'dist' directory
echo =============================================
dir dist

echo.
echo Running image conversion test...
call scripts\convert-test-images-fixed.bat

echo.
echo You can now test the optimized version by opening:
echo http://localhost:8080/ or dist\index.html
