#!/usr/bin/env node

/**
 * Component Generator Script for CareUnity React App
 * This script helps generate consistent React components
 * 
 * Usage: node generate-component.js ComponentName [--page|--feature|--ui]
 * Example: node generate-component.js UserProfile --page
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get arguments
const [,, componentName, componentType = '--ui'] = process.argv;

if (!componentName) {
  console.error('Please provide a component name');
  console.log('Usage: node generate-component.js ComponentName [--page|--feature|--ui]');
  process.exit(1);
}

// Determine component type and directory
let directory;
switch (componentType) {
  case '--page':
    directory = 'pages';
    break;
  case '--feature':
    directory = 'features';
    break;
  case '--ui':
  default:
    directory = 'ui';
    break;
}

const componentDir = path.join(__dirname, '..', 'client', 'src', 'components', directory);
const componentPath = path.join(componentDir, `${componentName}.tsx`);

// Ensure directory exists
if (!fs.existsSync(componentDir)) {
  fs.mkdirSync(componentDir, { recursive: true });
}

// Create component template
const componentTemplate = `import React from 'react';

interface ${componentName}Props {
  // Define your props here
}

/**
 * ${componentName} component
 * 
 * @param props - Component props
 */
export const ${componentName}: React.FC<${componentName}Props> = (props) => {
  return (
    <div className="component-${componentName.toLowerCase()}">
      {/* Component content */}
    </div>
  );
};

export default ${componentName};
`;

// Check if file already exists
if (fs.existsSync(componentPath)) {
  rl.question(`Component ${componentName} already exists. Overwrite? (y/n) `, (answer) => {
    if (answer.toLowerCase() === 'y') {
      writeFile();
    } else {
      console.log('Operation cancelled.');
      rl.close();
    }
  });
} else {
  writeFile();
}

// Write the component file
function writeFile() {
  fs.writeFileSync(componentPath, componentTemplate);
  console.log(`Component ${componentName} created at ${componentPath}`);
  
  // Create index.ts for exporting component
  const indexPath = path.join(componentDir, 'index.ts');
  let indexContent = '';
  
  if (fs.existsSync(indexPath)) {
    indexContent = fs.readFileSync(indexPath, 'utf8');
    if (!indexContent.includes(`export * from './${componentName}';`)) {
      indexContent += `export * from './${componentName}';\n`;
    }
  } else {
    indexContent = `export * from './${componentName}';\n`;
  }
  
  fs.writeFileSync(indexPath, indexContent);
  console.log(`Updated ${indexPath} with export for ${componentName}`);
  
  rl.close();
}
