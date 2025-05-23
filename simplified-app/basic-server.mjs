import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3004; // Use a different port to avoid conflicts

// Serve static files from the current directory
app.use(express.static(__dirname));

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Default route - serve the basic HTML file
app.get('/', (req, res) => {
  console.log('Serving basic.html');
  res.sendFile(path.join(__dirname, 'basic.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`\n=== Express server running at http://localhost:${PORT}/ ===`);
  console.log(`Server root directory: ${__dirname}`);
});
