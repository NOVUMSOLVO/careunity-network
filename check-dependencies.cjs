// Script to check for missing dependencies
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Checking for missing dependencies...');

// Read package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
console.log(`Reading package.json from: ${packageJsonPath}`);

try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Get dependencies
  const dependencies = {
    ...packageJson.dependencies || {},
    ...packageJson.devDependencies || {}
  };
  
  console.log(`Found ${Object.keys(dependencies).length} dependencies in package.json`);
  
  // Check for missing dependencies
  const missingDependencies = [];
  
  for (const [dependency, version] of Object.entries(dependencies)) {
    try {
      // Try to require the dependency
      require.resolve(dependency);
      console.log(`✓ ${dependency} (${version}) is installed`);
    } catch (err) {
      console.error(`✗ ${dependency} (${version}) is missing`);
      missingDependencies.push(dependency);
    }
  }
  
  // Print summary
  if (missingDependencies.length > 0) {
    console.log('\nMissing dependencies:');
    console.log(missingDependencies.join(', '));
    
    // Suggest installation command
    console.log('\nTo install missing dependencies, run:');
    console.log(`npm install ${missingDependencies.join(' ')}`);
  } else {
    console.log('\nAll dependencies are installed.');
  }
  
  // Check for common dependencies that might be missing
  const commonDependencies = [
    'express',
    'better-sqlite3',
    'drizzle-orm',
    'dotenv',
    'axios',
    'ws',
    'zod',
    'jsonwebtoken',
    'bcrypt',
    'node-cache',
    '@aws-sdk/client-s3',
    '@aws-sdk/s3-request-presigner'
  ];
  
  console.log('\nChecking for common dependencies that might be missing...');
  
  const additionalMissingDependencies = [];
  
  for (const dependency of commonDependencies) {
    if (!dependencies[dependency]) {
      try {
        // Try to require the dependency
        require.resolve(dependency);
        console.log(`✓ ${dependency} is installed but not in package.json`);
      } catch (err) {
        console.error(`✗ ${dependency} is missing`);
        additionalMissingDependencies.push(dependency);
      }
    }
  }
  
  // Print summary
  if (additionalMissingDependencies.length > 0) {
    console.log('\nAdditional missing dependencies:');
    console.log(additionalMissingDependencies.join(', '));
    
    // Suggest installation command
    console.log('\nTo install additional missing dependencies, run:');
    console.log(`npm install ${additionalMissingDependencies.join(' ')}`);
  } else {
    console.log('\nAll common dependencies are installed.');
  }
  
} catch (err) {
  console.error('Error reading package.json:', err);
}
