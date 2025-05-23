/**
 * Integrate API Examples into OpenAPI Specification
 * 
 * This script reads the examples from docs/openapi-examples.yaml and integrates them
 * into the main OpenAPI specification file (docs/openapi.yaml).
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const OPENAPI_FILE = path.join(__dirname, '../docs/openapi.yaml');
const EXAMPLES_FILE = path.join(__dirname, '../docs/openapi-examples.yaml');
const BACKUP_FILE = path.join(__dirname, '../docs/openapi.yaml.bak');

// Main function
async function integrateExamples() {
  console.log('Integrating API examples into OpenAPI specification...');
  
  try {
    // Load OpenAPI specification
    const openApiYaml = fs.readFileSync(OPENAPI_FILE, 'utf8');
    const openApiSpec = yaml.load(openApiYaml);
    
    // Load examples
    const examplesYaml = fs.readFileSync(EXAMPLES_FILE, 'utf8');
    const examples = yaml.load(examplesYaml);
    
    // Create backup of original file
    fs.copyFileSync(OPENAPI_FILE, BACKUP_FILE);
    console.log(`Created backup of OpenAPI specification at ${BACKUP_FILE}`);
    
    // Integrate examples into OpenAPI specification
    const updatedSpec = integrateExamplesIntoSpec(openApiSpec, examples);
    
    // Write updated specification back to file
    const updatedYaml = yaml.dump(updatedSpec, { lineWidth: 120 });
    fs.writeFileSync(OPENAPI_FILE, updatedYaml, 'utf8');
    
    console.log('Successfully integrated examples into OpenAPI specification');
  } catch (error) {
    console.error('Error integrating examples:', error);
    process.exit(1);
  }
}

/**
 * Integrate examples into OpenAPI specification
 */
function integrateExamplesIntoSpec(spec, examples) {
  // Process each path in the specification
  for (const [path, pathItem] of Object.entries(spec.paths || {})) {
    // Process each operation in the path
    for (const [method, operation] of Object.entries(pathItem)) {
      // Skip if not a valid HTTP method
      if (!['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
        continue;
      }
      
      // Process request body examples
      if (operation.requestBody?.content?.['application/json']?.schema) {
        const schemaRef = operation.requestBody.content['application/json'].schema.$ref;
        if (schemaRef) {
          const schemaName = schemaRef.split('/').pop();
          
          // Find matching examples
          for (const [category, categoryExamples] of Object.entries(examples)) {
            for (const [exampleName, example] of Object.entries(categoryExamples)) {
              // Match example to schema
              if (exampleName.toLowerCase() === schemaName.toLowerCase() ||
                  exampleName.toLowerCase() + 'request' === schemaName.toLowerCase()) {
                
                // Add example to request body
                if (!operation.requestBody.content['application/json'].examples) {
                  operation.requestBody.content['application/json'].examples = {};
                }
                
                operation.requestBody.content['application/json'].examples[exampleName] = example;
                console.log(`Added example for request body in ${method.toUpperCase()} ${path}`);
              }
            }
          }
        }
      }
      
      // Process response examples
      for (const [statusCode, response] of Object.entries(operation.responses || {})) {
        if (response.content?.['application/json']?.schema) {
          const schemaRef = response.content['application/json'].schema.$ref;
          if (schemaRef) {
            const schemaName = schemaRef.split('/').pop();
            
            // Find matching examples
            for (const [category, categoryExamples] of Object.entries(examples)) {
              for (const [exampleName, example] of Object.entries(categoryExamples)) {
                // Match example to schema
                if (exampleName.toLowerCase() === schemaName.toLowerCase() ||
                    exampleName.toLowerCase() + 'response' === schemaName.toLowerCase()) {
                  
                  // Add example to response
                  if (!response.content['application/json'].examples) {
                    response.content['application/json'].examples = {};
                  }
                  
                  response.content['application/json'].examples[exampleName] = example;
                  console.log(`Added example for response in ${method.toUpperCase()} ${path} (${statusCode})`);
                }
              }
            }
          }
        }
      }
    }
  }
  
  // Process schema examples
  for (const [schemaName, schema] of Object.entries(spec.components?.schemas || {})) {
    // Find matching examples
    for (const [category, categoryExamples] of Object.entries(examples)) {
      for (const [exampleName, example] of Object.entries(categoryExamples)) {
        // Match example to schema
        if (exampleName.toLowerCase() === schemaName.toLowerCase()) {
          // Add example to schema
          if (!schema.example) {
            schema.example = example.value;
            console.log(`Added example for schema ${schemaName}`);
          }
        }
      }
    }
  }
  
  // Add error examples to common responses
  if (examples.errors) {
    for (const [errorName, errorExample] of Object.entries(examples.errors)) {
      // Add to common responses if they exist
      if (spec.components?.responses) {
        if (errorName === 'validationError' && spec.components.responses['ValidationError']) {
          if (!spec.components.responses['ValidationError'].content['application/json'].examples) {
            spec.components.responses['ValidationError'].content['application/json'].examples = {};
          }
          spec.components.responses['ValidationError'].content['application/json'].examples[errorName] = errorExample;
          console.log(`Added example for common response ValidationError`);
        }
        
        if (errorName === 'authError' && spec.components.responses['Unauthorized']) {
          if (!spec.components.responses['Unauthorized'].content['application/json'].examples) {
            spec.components.responses['Unauthorized'].content['application/json'].examples = {};
          }
          spec.components.responses['Unauthorized'].content['application/json'].examples[errorName] = errorExample;
          console.log(`Added example for common response Unauthorized`);
        }
        
        if (errorName === 'notFoundError' && spec.components.responses['NotFound']) {
          if (!spec.components.responses['NotFound'].content['application/json'].examples) {
            spec.components.responses['NotFound'].content['application/json'].examples = {};
          }
          spec.components.responses['NotFound'].content['application/json'].examples[errorName] = errorExample;
          console.log(`Added example for common response NotFound`);
        }
        
        if (errorName === 'serverError' && spec.components.responses['ServerError']) {
          if (!spec.components.responses['ServerError'].content['application/json'].examples) {
            spec.components.responses['ServerError'].content['application/json'].examples = {};
          }
          spec.components.responses['ServerError'].content['application/json'].examples[errorName] = errorExample;
          console.log(`Added example for common response ServerError`);
        }
      }
    }
  }
  
  return spec;
}

// Run the script
integrateExamples();
