/**
 * API Documentation Routes
 * 
 * This file contains routes for serving API documentation using Swagger UI.
 */

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const router = express.Router();

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the OpenAPI specification file
const OPENAPI_FILE = path.join(__dirname, '../../docs/openapi.yaml');

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
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(openApiSpec, swaggerUiOptions));

export default router;
