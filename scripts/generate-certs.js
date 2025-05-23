/**
 * Generate Self-Signed SSL Certificates
 * 
 * This script generates self-signed SSL certificates for development purposes.
 * DO NOT use these certificates in production.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create certs directory if it doesn't exist
const certsDir = path.join(__dirname, '..', 'certs');
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

// Check if OpenSSL is available
try {
  execSync('openssl version', { stdio: 'ignore' });
} catch (error) {
  console.error('OpenSSL is not available. Please install OpenSSL to generate certificates.');
  process.exit(1);
}

// Generate certificates
try {
  console.log('Generating self-signed SSL certificates...');
  
  // Generate private key
  execSync(
    'openssl genrsa -out server.key 2048',
    { cwd: certsDir, stdio: 'inherit' }
  );
  
  // Generate certificate signing request
  execSync(
    'openssl req -new -key server.key -out server.csr -subj "/C=US/ST=State/L=City/O=CareUnity/CN=localhost"',
    { cwd: certsDir, stdio: 'inherit' }
  );
  
  // Generate self-signed certificate
  execSync(
    'openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.cert',
    { cwd: certsDir, stdio: 'inherit' }
  );
  
  // Remove certificate signing request (not needed anymore)
  fs.unlinkSync(path.join(certsDir, 'server.csr'));
  
  console.log('SSL certificates generated successfully:');
  console.log(`- Private key: ${path.join(certsDir, 'server.key')}`);
  console.log(`- Certificate: ${path.join(certsDir, 'server.cert')}`);
  console.log('\nNOTE: These are self-signed certificates for development only.');
  console.log('      Do not use them in production.');
} catch (error) {
  console.error('Error generating SSL certificates:', error.message);
  process.exit(1);
}
