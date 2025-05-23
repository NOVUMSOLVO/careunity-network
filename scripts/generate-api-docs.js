/**
 * Generate OpenAPI documentation from code
 *
 * This script scans the server/routes directory and generates OpenAPI documentation
 * based on the route definitions and comments.
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ROUTES_DIR = path.join(__dirname, '../server/routes');
const OPENAPI_FILE = path.join(__dirname, '../docs/openapi.yaml');
const API_PREFIX = '/api';

// Load existing OpenAPI file
let openApiDoc;
try {
  const openApiYaml = fs.readFileSync(OPENAPI_FILE, 'utf8');
  openApiDoc = yaml.load(openApiYaml);
  console.log('Loaded existing OpenAPI documentation');
} catch (error) {
  console.error('Error loading OpenAPI file:', error);
  process.exit(1);
}

// Scan routes directory
console.log('Scanning routes directory:', ROUTES_DIR);
const routeFiles = fs.readdirSync(ROUTES_DIR)
  .filter(file => file.endsWith('.ts') && !file.endsWith('.test.ts') && file !== 'index.ts');

console.log('Found route files:', routeFiles);

// Process each route file
routeFiles.forEach(file => {
  const filePath = path.join(ROUTES_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Extract route base path from filename
  const routeBase = file.replace('.ts', '');

  console.log(`Processing ${file} (${routeBase})`);

  // Extract route handlers
  const routeHandlers = extractRouteHandlers(content, routeBase);

  // Add routes to OpenAPI doc
  addRoutesToOpenApi(routeHandlers, openApiDoc);
});

// Save updated OpenAPI file
fs.writeFileSync(OPENAPI_FILE, yaml.dump(openApiDoc, { lineWidth: 120 }));
console.log('OpenAPI documentation updated:', OPENAPI_FILE);

/**
 * Extract route handlers from file content
 */
function extractRouteHandlers(content, routeBase) {
  const handlers = [];

  // Regular expression to match route handlers
  // This is a simplified version and may need to be enhanced for more complex routes
  const routeRegex = /router\.(get|post|put|patch|delete)\(['"]([^'"]*)['"]/g;

  let match;
  while ((match = routeRegex.exec(content)) !== null) {
    const method = match[1];
    const path = match[2];

    // Extract comment above the route handler
    const commentMatch = extractCommentAbove(content, match.index);

    handlers.push({
      method,
      path,
      comment: commentMatch,
      routeBase
    });
  }

  return handlers;
}

/**
 * Extract comment above a route handler
 */
function extractCommentAbove(content, index) {
  // Find the start of the line containing the route handler
  let lineStart = index;
  while (lineStart > 0 && content[lineStart - 1] !== '\n') {
    lineStart--;
  }

  // Find the end of the comment block above
  let commentEnd = lineStart - 1;
  while (commentEnd > 0 && content[commentEnd] === ' ' || content[commentEnd] === '\n' || content[commentEnd] === '\r') {
    commentEnd--;
  }

  // If there's no comment, return null
  if (commentEnd <= 0 || content[commentEnd] !== '/') {
    return null;
  }

  // Find the start of the comment block
  let commentStart = commentEnd;
  while (commentStart > 0 && (content[commentStart] !== '/' || content[commentStart - 1] !== '*')) {
    commentStart--;
  }

  // Extract the comment
  if (commentStart > 0) {
    const comment = content.substring(commentStart - 1, commentEnd + 1);

    // Parse the comment
    return parseComment(comment);
  }

  return null;
}

/**
 * Parse a comment block
 */
function parseComment(comment) {
  const lines = comment.split('\n');
  const result = {
    summary: '',
    description: '',
    tags: []
  };

  // Extract summary and description
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim().replace(/^\s*\*\s*/, '');

    if (line.startsWith('@')) {
      // Parse tag
      const tagMatch = line.match(/@(\w+)\s+(.*)/);
      if (tagMatch) {
        const tagName = tagMatch[1];
        const tagValue = tagMatch[2];

        if (tagName === 'tag') {
          result.tags.push(tagValue);
        } else {
          result[tagName] = tagValue;
        }
      }
    } else if (line && !result.summary) {
      result.summary = line;
    } else if (line) {
      if (result.description) {
        result.description += ' ' + line;
      } else {
        result.description = line;
      }
    }
  }

  return result;
}

/**
 * Add routes to OpenAPI document
 */
function addRoutesToOpenApi(routeHandlers, openApiDoc) {
  routeHandlers.forEach(handler => {
    const { method, path, comment, routeBase } = handler;

    // Skip if no comment
    if (!comment) {
      console.log(`Skipping ${method.toUpperCase()} ${path} (no comment)`);
      return;
    }

    // Construct full path
    let fullPath = path === '/' ? `${API_PREFIX}/${routeBase}` : `${API_PREFIX}/${routeBase}${path}`;

    // Convert path parameters from :id to {id}
    fullPath = fullPath.replace(/:(\w+)/g, '{$1}');

    // Ensure paths object exists
    if (!openApiDoc.paths) {
      openApiDoc.paths = {};
    }

    // Ensure path object exists
    if (!openApiDoc.paths[fullPath]) {
      openApiDoc.paths[fullPath] = {};
    }

    // Add method to path
    openApiDoc.paths[fullPath][method] = {
      summary: comment.summary,
      description: comment.description,
      tags: comment.tags.length > 0 ? comment.tags : [routeBase],
      responses: {
        '200': {
          description: 'Successful operation'
        }
      }
    };

    console.log(`Added ${method.toUpperCase()} ${fullPath}`);
  });
}
