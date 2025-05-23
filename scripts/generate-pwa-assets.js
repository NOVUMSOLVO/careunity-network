/**
 * Generate PWA Assets Script
 * 
 * This script generates all the necessary assets for the PWA including:
 * - Icons in various sizes
 * - Badge icons
 * - Splash screens
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { execSync } = require('child_process');

// Ensure sharp is installed
try {
  require.resolve('sharp');
} catch (e) {
  console.log('Installing sharp for image processing...');
  execSync('npm install --save-dev sharp');
}

// Source icon path - assuming a high resolution icon exists
const SOURCE_ICON = path.join(__dirname, '../client/public/logo512.png');
const BADGE_SOURCE = path.join(__dirname, '../client/public/logo192.png');
const OUTPUT_DIR = path.join(__dirname, '../client/public');

// Icon sizes for PWA
const PWA_ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const APPLE_ICON_SIZES = [120, 152, 167, 180, 1024];
const BADGE_SIZES = [96, 128];

// Generate PWA icons
async function generatePwaIcons() {
  console.log('Generating PWA icons...');

  // Create icons directory if it doesn't exist
  const iconsDir = path.join(OUTPUT_DIR, 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }
  
  // Generate standard PWA icons
  for (const size of PWA_ICON_SIZES) {
    await sharp(SOURCE_ICON)
      .resize(size, size)
      .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
  }
  
  // Generate Apple touch icons
  for (const size of APPLE_ICON_SIZES) {
    await sharp(SOURCE_ICON)
      .resize(size, size)
      .toFile(path.join(OUTPUT_DIR, `apple-touch-icon-${size}x${size}.png`));
  }
  
  // Create main Apple touch icon
  await sharp(SOURCE_ICON)
    .resize(180, 180)
    .toFile(path.join(OUTPUT_DIR, 'apple-touch-icon.png'));

  console.log('PWA icons generated successfully');
}

// Generate badge icons
async function generateBadgeIcons() {
  console.log('Generating badge icons...');
  
  for (const size of BADGE_SIZES) {
    await sharp(BADGE_SOURCE)
      .resize(size, size)
      .toFile(path.join(OUTPUT_DIR, `badge-icon-${size}.png`));
  }
  
  // Create main badge icon
  await sharp(BADGE_SOURCE)
    .resize(96, 96)
    .toFile(path.join(OUTPUT_DIR, 'badge-icon.png'));
  
  console.log('Badge icons generated successfully');
}

// Generate splash screens for various device sizes
async function generateSplashScreens() {
  console.log('Generating splash screens...');
  
  // Splash screen dimensions [width, height, device name]
  const splashScreenSizes = [
    [320, 568, 'iPhone-SE'],
    [375, 667, 'iPhone-8'],
    [414, 896, 'iPhone-XR'],
    [375, 812, 'iPhone-X'],
    [414, 736, 'iPhone-8-Plus'],
    [768, 1024, 'iPad'],
    [834, 1112, 'iPad-Pro-10.5'],
    [834, 1194, 'iPad-Pro-11'],
    [1024, 1366, 'iPad-Pro-12.9']
  ];
  
  // Create splash screens directory if it doesn't exist
  const splashDir = path.join(OUTPUT_DIR, 'splash');
  if (!fs.existsSync(splashDir)) {
    fs.mkdirSync(splashDir, { recursive: true });
  }
  
  // Generate a background with the app logo centered
  for (const [width, height, name] of splashScreenSizes) {
    // Create a white canvas
    const canvas = sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    });
    
    // Resize logo to fit nicely on the splash screen (using 40% of smallest dimension)
    const logoSize = Math.floor(Math.min(width, height) * 0.4);
    const logo = await sharp(SOURCE_ICON)
      .resize(logoSize, logoSize)
      .toBuffer();
    
    // Calculate position to center the logo
    const left = Math.floor((width - logoSize) / 2);
    const top = Math.floor((height - logoSize) / 2);
    
    // Composite the logo onto the canvas
    await canvas
      .composite([
        {
          input: logo,
          top,
          left
        }
      ])
      .toFile(path.join(splashDir, `splash-${name}.png`));
  }
  
  console.log('Splash screens generated successfully');
}

// Update manifest.json to include new icons
async function updateManifest() {
  console.log('Updating manifest.json...');
  
  const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
  
  // Read existing manifest
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  
  // Update icons array
  manifest.icons = PWA_ICON_SIZES.map(size => ({
    src: `icons/icon-${size}x${size}.png`,
    sizes: `${size}x${size}`,
    type: 'image/png',
    purpose: size >= 192 ? 'any maskable' : 'any'
  }));
  
  // Ensure other PWA properties are set
  manifest.name = manifest.name || 'CareUnity Network';
  manifest.short_name = manifest.short_name || 'CareUnity';
  manifest.theme_color = manifest.theme_color || '#4f46e5';
  manifest.background_color = manifest.background_color || '#ffffff';
  manifest.start_url = manifest.start_url || '/';
  manifest.display = manifest.display || 'standalone';
  manifest.orientation = manifest.orientation || 'portrait';
  
  // Write updated manifest
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  console.log('Manifest updated successfully');
}

// Main function
async function main() {
  try {
    await generatePwaIcons();
    await generateBadgeIcons();
    await generateSplashScreens();
    await updateManifest();
    
    console.log('✅ PWA assets generated successfully');
  } catch (error) {
    console.error('Error generating PWA assets:', error);
    process.exit(1);
  }
}

main();
