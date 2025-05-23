/**
 * Standalone script to serve Swagger UI for the CareUnity API documentation
 */

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const cors = require('cors');

// Path to the OpenAPI specification file
const OPENAPI_FILE = path.join(__dirname, 'docs/openapi.yaml');

// Create Express app
const app = express();
app.use(cors());

// Load the OpenAPI specification
let openApiSpec;
try {
  const openApiYaml = fs.readFileSync(OPENAPI_FILE, 'utf8');
  openApiSpec = yaml.load(openApiYaml);
  console.log('Loaded OpenAPI specification for Swagger UI');
} catch (error) {
  console.error('Error loading OpenAPI file for Swagger UI:', error);
  openApiSpec = {
    openapi: '3.1.0',
    info: {
      title: 'CareUnity API',
      description: 'API documentation not available',
      version: '1.0.0'
    }
  };
}

// Configure Swagger UI options
const swaggerUiOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'CareUnity API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true
  }
};

// Serve Swagger UI
app.use('/', swaggerUi.serve);
app.get('/', swaggerUi.setup(openApiSpec, swaggerUiOptions));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Swagger UI is running at http://localhost:${PORT}`);
});
