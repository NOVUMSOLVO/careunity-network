// Simple script to update imports in server files
const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript files in a directory
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to update imports in a file
function updateImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace @shared imports with relative imports
  content = content.replace(/from ['"]@shared\/(.*?)['"]/g, (match, p1) => {
    // Calculate relative path from file to shared directory
    const relativePath = path.relative(path.dirname(filePath), path.join(__dirname, 'shared'));
    return `from '${relativePath.replace(/\\/g, '/')}/${p1}'`;
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated imports in ${filePath}`);
}

// Find all TypeScript files in the server directory
const serverFiles = findTsFiles(path.join(__dirname, 'server'));

// Update imports in each file
serverFiles.forEach(updateImports);

console.log('Import paths updated successfully!');
