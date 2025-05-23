/**
 * Standalone Server with Dynamic Port
 * 
 * This is a simple Express server that serves static files and automatically
 * finds an available port if the default port is already in use.
 */

const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// Create Express application
const app = express();

// Apply middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Serve static files from the root directory
app.use(express.static(process.cwd()));

// Serve static files from client/public if it exists
const clientPublicDir = path.join(process.cwd(), 'client', 'public');
if (fs.existsSync(clientPublicDir)) {
  app.use('/client/public', express.static(clientPublicDir));
}

// Add a simple health check endpoint
app.get('/api/healthcheck', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    mode: 'standalone'
  });
});

// Add a route to list available HTML files
app.get('/html-files', (req, res) => {
  const rootDir = process.cwd();
  
  // Find HTML files in the root directory
  const htmlFiles = fs.readdirSync(rootDir)
    .filter(file => file.endsWith('.html'))
    .map(file => ({
      name: file,
      path: `/${file}`,
      url: `http://localhost:${server.address().port}/${file}`
    }));
    
  // Find HTML files in the client/public directory if it exists
  let clientHtmlFiles = [];
  
  if (fs.existsSync(clientPublicDir)) {
    clientHtmlFiles = fs.readdirSync(clientPublicDir)
      .filter(file => file.endsWith('.html'))
      .map(file => ({
        name: file,
        path: `/client/public/${file}`,
        url: `http://localhost:${server.address().port}/client/public/${file}`
      }));
  }
  
  res.json({
    rootDirectory: rootDir,
    port: server.address().port,
    htmlFiles: [...htmlFiles, ...clientHtmlFiles]
  });
});

// Create HTTP server
const server = http.createServer(app);

// Function to find an available port
function startServer(port) {
  server.listen(port, () => {
    console.log(`\n=== Server running at http://localhost:${port}/ ===`);
    console.log(`API available at http://localhost:${port}/api/`);
    console.log(`Health check at http://localhost:${port}/api/healthcheck`);
    console.log(`HTML files list at http://localhost:${port}/html-files`);
    
    // List HTML files
    console.log('\nAvailable HTML files:');
    fs.readdirSync(process.cwd())
      .filter(file => file.endsWith('.html'))
      .forEach(file => {
        console.log(`- http://localhost:${port}/${file}`);
      });
    
    console.log('\nServer root directory:', process.cwd());
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying ${port + 1}`);
      startServer(port + 1);
    } else {
      console.error('Error starting server:', err);
    }
  });
}

// Start with port 3000
console.log('Starting standalone server with dynamic port...');
startServer(3000);
