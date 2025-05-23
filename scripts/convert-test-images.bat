@echo off
echo =============================================
echo Converting Test Images to Modern Formats
echo =============================================

REM Create dist directory if it doesn't exist
if not exist dist mkdir dist

REM Use Sharp directly to convert test images
echo Converting icon-192.png to WebP and AVIF formats...
npx sharp icon-192.png -o dist/icon-192.webp webp
npx sharp icon-192.png -o dist/icon-192.avif avif

REM Copy the original PNG for comparison
copy icon-192.png dist\

echo =============================================
echo Image conversion complete!
echo =============================================
dir dist\icon-192.*

REM Copy the test HTML to test modern image formats
copy dist\bundle-test.html dist\image-test.html

echo.
echo You can now test image format support by opening dist/image-test.html
