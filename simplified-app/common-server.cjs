const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3005; // Use a different port to avoid conflicts

// Define MIME types explicitly
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Middleware to set correct MIME types
app.use((req, res, next) => {
  const ext = path.extname(req.path);
  if (mimeTypes[ext]) {
    res.type(mimeTypes[ext]);
  }
  next();
});

// Serve static files from the current directory
app.use(express.static(__dirname, {
  setHeaders: (res, path) => {
    const ext = path.substring(path.lastIndexOf('.'));
    if (mimeTypes[ext]) {
      res.setHeader('Content-Type', mimeTypes[ext]);
    }
  }
}));

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Default route - serve the index.html file
app.get('/', (req, res) => {
  console.log('Serving index.html');
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Specific route for bundle.js to ensure correct MIME type
app.get('/static/js/bundle.js', (req, res) => {
  console.log('Serving bundle.js with explicit MIME type');
  res.setHeader('Content-Type', 'text/javascript');
  res.sendFile(path.join(__dirname, 'static', 'js', 'bundle.js'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`\n=== Express server running at http://localhost:${PORT}/ ===`);
  console.log(`Server root directory: ${__dirname}`);

  // List files in the directory
  console.log('\nFiles in directory:');
  fs.readdir(__dirname, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    files.forEach(file => {
      console.log(`- ${file}`);
    });
  });
});
