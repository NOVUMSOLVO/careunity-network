#!/usr/bin/env node

/**
 * CareUnity Network - Vanilla JS to React Component Migration Helper
 * 
 * This script helps identify vanilla JavaScript files that might need
 * conversion to React components as part of the modernization effort.
 * 
 * Usage: node migrate-to-components.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const rootDir = path.join(__dirname, '..');
const clientDir = path.join(rootDir, 'client');
const srcDir = path.join(clientDir, 'src');

// Directories to skip
const skipDirs = [
  'node_modules',
  'dist',
  '.git',
  'components', // Already React components
  'hooks',      // Already React hooks
];

// Get all JavaScript files
function getJSFiles(dir, fileList = []) {
  if (skipDirs.some(skip => dir.includes(skip))) {
    return fileList;
  }

  try {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      
      try {
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          getJSFiles(filePath, fileList);
        } else if (
          file.endsWith('.js') && 
          !file.endsWith('.test.js') &&
          !file.endsWith('.spec.js') &&
          !file.endsWith('.min.js')
        ) {
          fileList.push(filePath);
        }
      } catch (err) {
        console.error(`Error accessing ${filePath}:`, err.message);
      }
    });
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err.message);
  }
  
  return fileList;
}

// Check if a file might be a UI component
function mightBeUIComponent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for DOM manipulation patterns
    const domCreation = content.includes('createElement') || 
                       content.includes('document.create') ||
                       content.includes('innerHTML') ||
                       content.includes('appendChild');
                       
    // Check for event listeners
    const eventListeners = content.includes('addEventListener') || 
                          content.includes('onclick') ||
                          content.includes('.on');
                          
    // Check for UI-related code
    const uiRelated = content.includes('style') ||
                     content.includes('class') ||
                     content.includes('display') ||
                     content.includes('render');
                     
    return domCreation && (eventListeners || uiRelated);
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err.message);
    return false;
  }
}

// Create migration report
function createMigrationReport(componentsToMigrate) {
  const reportPath = path.join(rootDir, 'docs', 'COMPONENT-MIGRATION-REPORT.md');
  
  let report = `# Component Migration Report\n\n`;
  report += `Generated on: ${new Date().toLocaleString()}\n\n`;
  
  report += `## Files to Consider for React Component Migration\n\n`;
  
  if (componentsToMigrate.length === 0) {
    report += `No vanilla JavaScript files identified for migration.\n`;
  } else {
    componentsToMigrate.forEach(file => {
      const relativePath = path.relative(rootDir, file);
      report += `- [ ] \`${relativePath}\`\n`;
    });
    
    report += `\n## Migration Process\n\n`;
    report += `1. Review each file to confirm it contains UI logic\n`;
    report += `2. Create a new React component using \`npm run generate:component\`\n`;
    report += `3. Migrate the UI logic to the React component\n`;
    report += `4. Update imports to use the new component\n`;
    report += `5. Test the component\n`;
  }
  
  fs.writeFileSync(reportPath, report);
  console.log(`Migration report created at: ${reportPath}`);
}

// Main function
function main() {
  console.log('🔍 Scanning for vanilla JavaScript files to migrate to React components...');
  
  const allJSFiles = getJSFiles(srcDir);
  console.log(`Found ${allJSFiles.length} JavaScript files to analyze`);
  
  const componentsToMigrate = allJSFiles.filter(mightBeUIComponent);
  console.log(`Identified ${componentsToMigrate.length} files that might need migration to React components`);
  
  createMigrationReport(componentsToMigrate);
  
  console.log('✅ Migration analysis complete!');
}

main();
