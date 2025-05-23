/**
 * Test JavaScript Module
 * 
 * This module exports a simple function to test if modules are being served correctly.
 */

// Export a function that returns a message
export function getMessage() {
    return 'JavaScript module loaded successfully! The MIME type is correct.';
}

// Export another function for testing
export function getTimestamp() {
    return new Date().toISOString();
}
