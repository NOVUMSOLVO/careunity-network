// Simple test file to generate WebP and AVIF versions
console.log("Running image conversion test...");

// Check if original file exists
const fs = require('fs');

// Test images
const testImages = [
  { src: 'generated-icon.png', dest: 'icon-test' }
];

// Check for sharp module
try {
  const sharp = require('sharp');
  console.log("Sharp module found, proceeding with conversion...");
  
  // Create dist directory if it doesn't exist
  if (!fs.existsSync('./dist')) {
    fs.mkdirSync('./dist');
  }
  
  // Convert test images
  testImages.forEach(image => {
    if (fs.existsSync(image.src)) {
      // Copy original
      fs.copyFileSync(image.src, `./dist/${image.dest}.png`);
      console.log(`Copied ${image.src} to ./dist/${image.dest}.png`);
      
      // Convert to WebP
      sharp(image.src)
        .toFile(`./dist/${image.dest}.webp`, (err, info) => {
          if (err) {
            console.error(`Error converting to WebP: ${err}`);
          } else {
            console.log(`WebP created: ./dist/${image.dest}.webp (${info.size} bytes)`);
          }
        });
        
      // Convert to AVIF
      sharp(image.src)
        .toFile(`./dist/${image.dest}.avif`, (err, info) => {
          if (err) {
            console.error(`Error converting to AVIF: ${err}`);
          } else {
            console.log(`AVIF created: ./dist/${image.dest}.avif (${info.size} bytes)`);
          }
        });
    } else {
      console.error(`Source image ${image.src} not found!`);
    }
  });
} catch (err) {
  console.error("Error loading the sharp module:", err);
  console.log("To install sharp, run: npm install sharp --save-dev");
}
