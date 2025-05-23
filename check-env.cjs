// Script to check environment variables
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

console.log('Checking environment variables...');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
console.log(`Checking for .env file at: ${envPath}`);

try {
  if (fs.existsSync(envPath)) {
    console.log('.env file exists');
    
    // Read the .env file
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('\nEnvironment variables in .env file:');
    
    // Parse the .env file
    const envLines = envContent.split('\n');
    envLines.forEach(line => {
      // Skip comments and empty lines
      if (line.trim() && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=');
        
        // Mask sensitive values
        const maskedValue = key.toLowerCase().includes('secret') || 
                           key.toLowerCase().includes('password') || 
                           key.toLowerCase().includes('key') 
                           ? '********' : value;
        
        console.log(`${key.trim()}: ${maskedValue.trim()}`);
      }
    });
  } else {
    console.log('.env file does not exist');
  }
} catch (err) {
  console.error('Error checking .env file:', err);
}

// Check process.env
console.log('\nEnvironment variables in process.env:');
const envVars = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'SESSION_SECRET',
  'LOG_LEVEL',
  'ENABLE_PERFORMANCE_MONITORING',
  'ENABLE_RATE_LIMITING',
  'ENABLE_OFFLINE_SUPPORT',
  'ENABLE_MOBILE_OPTIMIZATIONS'
];

envVars.forEach(key => {
  const value = process.env[key];
  
  // Mask sensitive values
  const maskedValue = key.toLowerCase().includes('secret') || 
                     key.toLowerCase().includes('password') || 
                     key.toLowerCase().includes('key') 
                     ? '********' : value;
  
  console.log(`${key}: ${value ? maskedValue : 'Not set'}`);
});
