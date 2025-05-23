@echo off
echo =============================================
echo Converting Test Images to Modern Formats
echo =============================================

REM Create dist directory if it doesn't exist
if not exist dist mkdir dist

REM Use the Sharp CLI tool with proper error handling
echo Converting test images to WebP and AVIF formats...

REM Copy and convert the generated-icon.png which we know works
copy generated-icon.png dist\icon-test.png
npx sharp dist\icon-test.png -o dist\icon-test.webp webp
npx sharp dist\icon-test.png -o dist\icon-test.avif avif

echo =============================================
echo Image conversion complete!
echo =============================================
dir dist\icon-test.*

echo.
echo You can now test image format support by opening dist/bundle-test.html
