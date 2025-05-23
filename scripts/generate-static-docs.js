/**
 * Generate static HTML documentation from OpenAPI specification
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the OpenAPI specification file
const OPENAPI_FILE = path.join(__dirname, '../docs/openapi.yaml');
const OUTPUT_FILE = path.join(__dirname, '../docs/api-reference.html');

// Check if redoc-cli is installed
exec('redoc-cli --version', (error) => {
  if (error) {
    console.error('redoc-cli is not installed. Installing...');
    exec('npm install -g redoc-cli', (installError) => {
      if (installError) {
        console.error('Failed to install redoc-cli:', installError);
        process.exit(1);
      }
      generateDocs();
    });
  } else {
    generateDocs();
  }
});

function generateDocs() {
  console.log('Generating static API documentation...');
  
  // Generate static HTML using redoc-cli
  exec(`redoc-cli bundle ${OPENAPI_FILE} -o ${OUTPUT_FILE}`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error generating documentation:', error);
      process.exit(1);
    }
    
    if (stderr) {
      console.error(stderr);
    }
    
    console.log(stdout);
    console.log(`Static API documentation generated at: ${OUTPUT_FILE}`);
  });
}
