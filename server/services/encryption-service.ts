/**
 * Encryption Service
 * 
 * Provides encryption and decryption functionality for sensitive data.
 * Uses AES-256-GCM for encryption, which provides both confidentiality and integrity.
 */

import crypto from 'crypto';
import { logger } from '../utils/logger';

// Configuration
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 16; // 128 bits
const KEY_ITERATIONS = 100000; // PBKDF2 iterations

/**
 * Generate a secure encryption key from a password and salt
 * @param password Password to derive key from
 * @param salt Salt for key derivation
 * @returns Derived key
 */
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, KEY_ITERATIONS, KEY_LENGTH, 'sha256');
}

/**
 * Encrypt data
 * @param data Data to encrypt
 * @param password Password for encryption
 * @returns Encrypted data as a string
 */
export function encrypt(data: string, password: string): string {
  try {
    // Generate a random salt
    const salt = crypto.randomBytes(SALT_LENGTH);
    
    // Derive key from password and salt
    const key = deriveKey(password, salt);
    
    // Generate a random initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
    
    // Encrypt data
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get authentication tag
    const authTag = cipher.getAuthTag();
    
    // Combine all components: salt + iv + authTag + encrypted
    const result = Buffer.concat([
      salt,
      iv,
      authTag,
      Buffer.from(encrypted, 'hex')
    ]).toString('base64');
    
    return result;
  } catch (error) {
    logger.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data
 * @param encryptedData Encrypted data as a string
 * @param password Password for decryption
 * @returns Decrypted data
 */
export function decrypt(encryptedData: string, password: string): string {
  try {
    // Convert from base64 to buffer
    const buffer = Buffer.from(encryptedData, 'base64');
    
    // Extract components
    const salt = buffer.subarray(0, SALT_LENGTH);
    const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const authTag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH).toString('hex');
    
    // Derive key from password and salt
    const key = deriveKey(password, salt);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    
    // Set authentication tag
    decipher.setAuthTag(authTag);
    
    // Decrypt data
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    logger.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash a value using SHA-256
 * @param value Value to hash
 * @returns Hashed value
 */
export function hash(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * Generate a random string
 * @param length Length of the random string
 * @returns Random string
 */
export function generateRandomString(length: number): string {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

/**
 * Generate a secure password
 * @param length Length of the password (default: 16)
 * @returns Secure password
 */
export function generateSecurePassword(length: number = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,.<>?';
  let password = '';
  
  // Ensure at least one character from each category
  password += getRandomChar('abcdefghijklmnopqrstuvwxyz');
  password += getRandomChar('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  password += getRandomChar('0123456789');
  password += getRandomChar('!@#$%^&*()-_=+[]{}|;:,.<>?');
  
  // Fill the rest with random characters
  for (let i = 4; i < length; i++) {
    password += getRandomChar(charset);
  }
  
  // Shuffle the password
  return shuffleString(password);
}

/**
 * Get a random character from a string
 * @param str String to get a character from
 * @returns Random character
 */
function getRandomChar(str: string): string {
  const randomIndex = crypto.randomInt(0, str.length);
  return str.charAt(randomIndex);
}

/**
 * Shuffle a string
 * @param str String to shuffle
 * @returns Shuffled string
 */
function shuffleString(str: string): string {
  const array = str.split('');
  
  for (let i = array.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  
  return array.join('');
}

/**
 * Encrypt an object
 * @param obj Object to encrypt
 * @param password Password for encryption
 * @returns Encrypted object as a string
 */
export function encryptObject(obj: any, password: string): string {
  return encrypt(JSON.stringify(obj), password);
}

/**
 * Decrypt an object
 * @param encryptedData Encrypted object as a string
 * @param password Password for decryption
 * @returns Decrypted object
 */
export function decryptObject<T>(encryptedData: string, password: string): T {
  const decrypted = decrypt(encryptedData, password);
  return JSON.parse(decrypted) as T;
}

export default {
  encrypt,
  decrypt,
  hash,
  generateRandomString,
  generateSecurePassword,
  encryptObject,
  decryptObject
};
