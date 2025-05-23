/**
 * Script to add SRI integrity attributes to HTML files
 * 
 * This script processes HTML files and adds integrity attributes for known external resources
 */
const fs = require('fs');
const path = require('path');

// Define known SRI hashes for commonly used resources
// In a real production environment, these should be generated and verified
const knownResources = {
  'https://replit.com/public/js/replit-dev-banner.js': 'sha384-PLACEHOLDER_HASH_FOR_REPLIT_BANNER',
  // Add other resources as needed
};

/**
 * Add integrity attributes to script and link tags in HTML files
 * @param {string} htmlFilePath - Path to HTML file
 */
function addIntegrityAttributes(htmlFilePath) {
  try {
    console.log(`Processing: ${htmlFilePath}`);
    let html = fs.readFileSync(htmlFilePath, 'utf8');
    let modified = false;
    
    // Find script tags
    html = html.replace(
      /<script[^>]*src="(https:\/\/[^"]+)"[^>]*><\/script>/g,
      (match, url) => {
        if (knownResources[url]) {
          modified = true;
          return match.replace(
            `src="${url}"`, 
            `src="${url}" integrity="${knownResources[url]}" crossorigin="anonymous"`
          );
        }
        return match;
      }
    );
    
    // Find link tags
    html = html.replace(
      /<link[^>]*href="(https:\/\/[^"]+)"[^>]*>/g,
      (match, url) => {
        if (knownResources[url]) {
          modified = true;
          return match.replace(
            `href="${url}"`, 
            `href="${url}" integrity="${knownResources[url]}" crossorigin="anonymous"`
          );
        }
        return match;
      }
    );
    
    if (modified) {
      fs.writeFileSync(htmlFilePath, html, 'utf8');
      console.log(`Added integrity attributes to ${htmlFilePath}`);
    } else {
      console.log(`No changes needed for ${htmlFilePath}`);
    }
    
    return modified;
  } catch (error) {
    console.error(`Error processing ${htmlFilePath}:`, error.message);
    return false;
  }
}

// Process client HTML files
const clientDir = path.resolve(__dirname, '../client');
addIntegrityAttributes(path.join(clientDir, 'index.html'));

console.log('Done processing HTML files');
