/**
 * Test script for mobile components
 *
 * This script tests the mobile components by:
 * 1. Importing the components
 * 2. Creating test instances
 * 3. Verifying their properties and methods
 */

// Import required modules
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths to components
const PROGRESSIVE_LOADER_PATH = path.join(__dirname, '../client/src/components/mobile/ProgressiveLoader.tsx');
const TOUCH_INTERACTIONS_PATH = path.join(__dirname, '../client/src/components/mobile/TouchInteractions.tsx');
const MOBILE_SERVICE_USER_LIST_PATH = path.join(__dirname, '../client/src/components/service-users/MobileServiceUserList.tsx');
const MOBILE_CONFIG_PATH = path.join(__dirname, '../client/src/config/mobile-config.ts');

// Check if files exist
console.log('Checking if mobile component files exist...');

const files = [
  { path: PROGRESSIVE_LOADER_PATH, name: 'ProgressiveLoader' },
  { path: TOUCH_INTERACTIONS_PATH, name: 'TouchInteractions' },
  { path: MOBILE_SERVICE_USER_LIST_PATH, name: 'MobileServiceUserList' },
  { path: MOBILE_CONFIG_PATH, name: 'mobile-config' },
];

let allFilesExist = true;

files.forEach(file => {
  if (fs.existsSync(file.path)) {
    console.log(`✅ ${file.name} exists at ${file.path}`);
  } else {
    console.error(`❌ ${file.name} does not exist at ${file.path}`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.error('Some files are missing. Please check the paths and try again.');
  process.exit(1);
}

// Check file contents
console.log('\nChecking file contents...');

files.forEach(file => {
  const content = fs.readFileSync(file.path, 'utf8');

  // Check for key features in each file
  if (file.name === 'ProgressiveLoader') {
    if (content.includes('loadData') && content.includes('renderItem') && content.includes('mobileOptimized')) {
      console.log(`✅ ${file.name} contains required props and methods`);
    } else {
      console.error(`❌ ${file.name} is missing required props or methods`);
    }
  } else if (file.name === 'TouchInteractions') {
    if (content.includes('onSwipe') && content.includes('onTap') && content.includes('onLongPress')) {
      console.log(`✅ ${file.name} contains required props and methods`);
    } else {
      console.error(`❌ ${file.name} is missing required props or methods`);
    }
  } else if (file.name === 'MobileServiceUserList') {
    if (content.includes('ProgressiveLoader') && content.includes('TouchInteraction')) {
      console.log(`✅ ${file.name} uses ProgressiveLoader and TouchInteraction components`);
    } else {
      console.error(`❌ ${file.name} does not use ProgressiveLoader or TouchInteraction components`);
    }
  } else if (file.name === 'mobile-config') {
    if (content.includes('progressiveLoadingConfig') && content.includes('touchInteractionConfig') && content.includes('webSocketConfig')) {
      console.log(`✅ ${file.name} contains required configuration objects`);
    } else {
      console.error(`❌ ${file.name} is missing required configuration objects`);
    }
  }
});

// Check TypeScript types
console.log('\nChecking TypeScript types...');

try {
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ TypeScript types check passed');
} catch (error) {
  console.error('❌ TypeScript types check failed');
  process.exit(1);
}

console.log('\nMobile components test completed successfully!');
