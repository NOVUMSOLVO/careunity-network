// Script to convert images to modern formats (WebP and AVIF)
// CommonJS version for better compatibility
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

console.log("Starting image conversion script...");

// Source images directory - adjust as needed
const sourceDir = './';
const targetFormats = ['webp', 'avif'];

// Image quality settings
const webpOptions = { quality: 80 };
const avifOptions = { quality: 70 };

// Image file extensions to convert
const validExtensions = ['.png', '.jpg', '.jpeg', '.gif'];

// Function to recursively find all images in directories
async function findImages(dir) {
  try {
    const files = await fs.promises.readdir(dir, { withFileTypes: true });
    const images = [];

    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory() && !file.name.startsWith('node_modules') && !file.name.startsWith('dist')) {
        // Recursively process subdirectories
        images.push(...await findImages(fullPath));
      } else if (file.isFile() && validExtensions.includes(path.extname(file.name).toLowerCase())) {
        images.push(fullPath);
      }
    }

    return images;
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
    return [];
  }
}

// Function to convert an image to different formats
async function convertImage(imagePath) {
  try {
    const directory = path.dirname(imagePath);
    const filename = path.basename(imagePath, path.extname(imagePath));
    
    // Create a sharp instance for the source image
    const image = sharp(imagePath);
    
    // Convert to WebP
    await image.clone()
      .webp(webpOptions)
      .toFile(path.join(directory, `${filename}.webp`));
    console.log(`Converted ${imagePath} to WebP`);
    
    // Convert to AVIF
    await image.clone()
      .avif(avifOptions)
      .toFile(path.join(directory, `${filename}.avif`));
    console.log(`Converted ${imagePath} to AVIF`);
    
  } catch (error) {
    console.error(`Error converting ${imagePath}:`, error);
  }
}

// Main function to process all images
async function processImages() {
  try {
    console.log('Starting image conversion to modern formats...');
    
    // Find all images
    const images = await findImages(sourceDir);
    console.log(`Found ${images.length} images to process`);
    
    // Convert each image
    for (const image of images) {
      await convertImage(image);
    }
    
    console.log('Image conversion complete!');
  } catch (error) {
    console.error('Error processing images:', error);
  }
}

// Run the conversion
processImages();
