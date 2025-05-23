const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3003; // Use a different port to avoid conflicts

// Serve static files from the current directory
app.use(express.static(__dirname));

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Default route - serve the minimal HTML file
app.get('/', (req, res) => {
  console.log('Serving minimal.html');
  res.sendFile(path.join(__dirname, 'minimal.html'));
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
