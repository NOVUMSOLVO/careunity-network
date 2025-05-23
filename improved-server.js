import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// Map file extensions to MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  console.log(`\n[${new Date().toISOString()}] Request received: ${req.method} ${req.url}`);
  
  // Parse the URL to get the pathname
  let filePath;
  if (req.url === '/') {
    filePath = path.join(__dirname, 'basic-test.html');
    console.log(`Serving default file: ${filePath}`);
  } else {
    // Remove any query parameters
    const urlPath = req.url.split('?')[0];
    filePath = path.join(__dirname, urlPath);
    console.log(`Looking for file: ${filePath}`);
  }
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.log(`File does not exist: ${filePath}`);
      serveNotFound(res);
      return;
    }
    
    // Get the file extension
    const extname = path.extname(filePath);
    
    // Set the content type based on the file extension
    const contentType = MIME_TYPES[extname] || 'text/plain';
    
    // Read the file
    fs.readFile(filePath, (error, content) => {
      if (error) {
        console.error(`Error reading file: ${error.code}`);
        if (error.code === 'ENOENT') {
          serveNotFound(res);
        } else {
          // Server error
          console.error(`Server error: ${error.code}`);
          res.writeHead(500);
          res.end(`Server Error: ${error.code}`);
        }
      } else {
        // Success
        console.log(`Successfully served: ${filePath} (${contentType})`);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });
});

// Function to serve 404 page
function serveNotFound(res) {
  const notFoundPath = path.join(__dirname, '404.html');
  
  fs.readFile(notFoundPath, (error, content) => {
    if (error) {
      // If 404 page is not found, send a simple text response
      console.log('404 page not found, sending plain text response');
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 - File Not Found', 'utf-8');
    } else {
      console.log('Serving 404 page');
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(content, 'utf-8');
    }
  });
}

// Start the server
server.listen(PORT, () => {
  console.log(`\n=== Server running at http://localhost:${PORT}/ ===`);
  console.log('Available pages:');
  console.log(`- http://localhost:${PORT}/`);
  console.log(`- http://localhost:${PORT}/basic-test.html`);
  console.log(`- http://localhost:${PORT}/standalone-react.html`);
  console.log(`- http://localhost:${PORT}/static-test.html`);
  console.log('\nServer root directory:', __dirname);
  
  // List files in the directory
  console.log('\nFiles in directory:');
  fs.readdir(__dirname, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }
    
    files.forEach(file => {
      if (file.endsWith('.html')) {
        console.log(`- ${file}`);
      }
    });
  });
});
