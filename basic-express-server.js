// Simple Express server for testing
import express from 'express';
const app = express();
const port = process.env.PORT || 5000;

// Basic middleware
app.use(express.json());

// Health check endpoint
app.get('/api/healthcheck', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>CareUnity Simple Server</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            line-height: 1.6;
          }
          h1 {
            color: #333;
          }
          .card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
        </style>
      </head>
      <body>
        <h1>CareUnity Simple Server</h1>
        <div class="card">
          <p>This is a simple server for testing purposes.</p>
          <p>Server time: ${new Date().toLocaleString()}</p>
          <p>Try the <a href="/api/healthcheck">health check endpoint</a>.</p>
        </div>
      </body>
    </html>
  `);
});

// Start the server
app.listen(port, () => {
  console.log(`Simple server running at http://localhost:${port}`);
  console.log(`Health check available at http://localhost:${port}/api/healthcheck`);
});
