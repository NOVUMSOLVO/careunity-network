/**
 * Generate Subresource Integrity (SRI) hashes for external resources
 * 
 * This script fetches external resources and generates SRI hash values
 * that can be added to script and link tags.
 */

import fetch from 'node-fetch';
import crypto from 'crypto';

// List of external resources to generate SRI hashes for
const resources = [
  'https://replit.com/public/js/replit-dev-banner.js',
  // Add other external resources here
];

/**
 * Generate SRI hash for a resource
 * @param {string} url - URL of the resource
 */
async function generateSriHash(url) {
  try {
    console.log(`Fetching: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    
    const content = await response.text();
    
    // Generate SHA-384 hash
    const hash = crypto
      .createHash('sha384')
      .update(content)
      .digest('base64');
    
    console.log(`\nResource: ${url}`);
    console.log(`Integrity attribute: integrity="sha384-${hash}"`);
    console.log(`Full tag example:`);
    
    if (url.endsWith('.js')) {
      console.log(`<script src="${url}" integrity="sha384-${hash}" crossorigin="anonymous"></script>`);
    } else if (url.endsWith('.css')) {
      console.log(`<link href="${url}" rel="stylesheet" integrity="sha384-${hash}" crossorigin="anonymous">`);
    }
    
    return {
      url,
      hash: `sha384-${hash}`
    };
  } catch (error) {
    console.error(`Error processing ${url}:`, error.message);
    return {
      url,
      error: error.message
    };
  }
}

/**
 * Main function to generate all SRI hashes
 */
async function generateAllSriHashes() {
  console.log('Generating SRI hashes for external resources...\n');
  
  const results = [];
  
  for (const resource of resources) {
    const result = await generateSriHash(resource);
    results.push(result);
  }
  
  console.log('\nSummary:');
  console.log(JSON.stringify(results, null, 2));
}

// Run the script
generateAllSriHashes().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
