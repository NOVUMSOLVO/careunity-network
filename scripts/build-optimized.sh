# Bundle optimization script

# This script creates optimized bundles for the CareUnity mobile app
# It uses Vite to bundle JS files and generates modern image formats

# Check if the necessary packages are installed
echo "Checking for required dependencies..."
if ! npm list vite-plugin-imagemin > /dev/null 2>&1; then
  echo "Installing required dependencies..."
  npm install vite-plugin-imagemin --save-dev
fi

# Run image conversion script to generate WebP and AVIF formats
echo "Converting images to modern formats (WebP, AVIF)..."
node scripts/convert-images.js

# Build the optimized bundles using Vite
echo "Building optimized JavaScript bundles..."
npx vite build --config vite.mobile.config.js

# Copy the service worker file
echo "Setting up service worker..."
cp mobile-service-worker-optimized.js dist/mobile-service-worker.js
cp js/image-handler.js dist/js/

# Copy the HTML file
echo "Setting up optimized HTML..."
cp careunity-mobile-optimized.html dist/careunity-mobile.html

echo "Build completed! Optimized files are in the 'dist' directory"
echo "Performance improvements:"
echo "- JS files bundled into optimized packages based on functionality"
echo "- Code splitting implemented for dynamic loading of features"
echo "- Images converted to modern formats (WebP, AVIF) with fallbacks"
echo "- Critical CSS inlined for faster initial render"

# Show summary of file size reductions
echo "File size reductions:"
find dist -type f -name "*.js" | xargs ls -lh
echo ""
echo "Original vs. bundled sizes:"
echo "Original: $(find js -type f -name "*.js" | xargs cat | wc -c) bytes"
echo "Bundled: $(find dist/assets -type f -name "*.js" | xargs cat | wc -c) bytes"
