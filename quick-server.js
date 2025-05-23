import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 4000;

console.log('Starting server...');

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  // Handle root request
  if (req.url === '/') {
    req.url = '/standalone-react.html';
  }

  // Get file path
  const filePath = path.join(__dirname, req.url);

  // Get file extension
  const ext = path.extname(filePath).toLowerCase();

  // Set content type
  const contentTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
  };

  const contentType = contentTypes[ext] || 'text/plain';

  // Read and serve file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.log(`File not found: ${filePath}`);
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - File Not Found</h1>');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 CareUnity Server Started!`);
  console.log(`📍 Server running at: http://localhost:${PORT}/`);
  console.log(`🏠 Main app: http://localhost:${PORT}/`);
  console.log(`📄 Standalone: http://localhost:${PORT}/standalone-react.html`);
  console.log(`\nPress Ctrl+C to stop the server`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ Port ${PORT} is already in use. Trying port ${PORT + 1}...`);
    server.listen(PORT + 1);
  } else {
    console.error('Server error:', err);
  }
});
