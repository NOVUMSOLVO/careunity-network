/**
 * Password Validation Utility
 * 
 * This module provides functions for validating and managing passwords
 * according to security best practices.
 */

import { z } from 'zod';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { logger } from './logger';

/**
 * Password validation schema with strong requirements
 */
export const passwordSchema = z
  .string()
  .min(10, 'Password must be at least 10 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

/**
 * Password validation options
 */
export interface PasswordValidationOptions {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
  disallowCommonPasswords?: boolean;
  checkPwnedPasswords?: boolean;
  maxAge?: number; // in days
}

/**
 * Default password validation options
 */
const defaultOptions: PasswordValidationOptions = {
  minLength: 10,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  disallowCommonPasswords: true,
  checkPwnedPasswords: false, // Disabled by default as it requires external API
  maxAge: 90, // 90 days
};

/**
 * Common passwords to disallow
 */
const commonPasswords = [
  'password',
  'password123',
  '123456',
  '12345678',
  'qwerty',
  'admin',
  'welcome',
  'letmein',
  'monkey',
  'abc123',
  'football',
  'iloveyou',
  'trustno1',
  'sunshine',
  'master',
  'welcome1',
  'shadow',
  'ashley',
  'baseball',
  'access',
  'michael',
  'superman',
  'qwerty123',
  'password1',
  'admin123',
  'secret',
  'dragon',
  'summer',
  'internet',
  'a1b2c3',
  'welcome123',
  'login',
  'passw0rd',
  'hello123',
  'test123',
  'princess',
  'qazwsx',
  'charlie',
  'freedom',
  'whatever',
  'qwertyuiop',
  'zaq1zaq1',
  'password!',
  'password1!',
  'P@ssw0rd',
  'P@ssword',
  'Password123',
  'Password1',
  'Password!',
  'Password1!',
];

/**
 * Validate a password against the specified options
 * 
 * @param password The password to validate
 * @param options Validation options
 * @returns An object with validation result and error message
 */
export function validatePassword(
  password: string,
  options: PasswordValidationOptions = defaultOptions
): { isValid: boolean; message?: string } {
  const opts = { ...defaultOptions, ...options };
  
  // Check minimum length
  if (opts.minLength && password.length < opts.minLength) {
    return {
      isValid: false,
      message: `Password must be at least ${opts.minLength} characters long`,
    };
  }
  
  // Check for uppercase letters
  if (opts.requireUppercase && !/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter',
    };
  }
  
  // Check for lowercase letters
  if (opts.requireLowercase && !/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter',
    };
  }
  
  // Check for numbers
  if (opts.requireNumbers && !/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number',
    };
  }
  
  // Check for special characters
  if (opts.requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character',
    };
  }
  
  // Check against common passwords
  if (opts.disallowCommonPasswords && commonPasswords.includes(password.toLowerCase())) {
    return {
      isValid: false,
      message: 'Password is too common and easily guessable',
    };
  }
  
  return { isValid: true };
}

/**
 * Hash a password using bcrypt
 * 
 * @param password The password to hash
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const saltRounds = 12; // Higher is more secure but slower
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    logger.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Compare a password with a hash
 * 
 * @param password The password to check
 * @param hash The hash to compare against
 * @returns True if the password matches the hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    logger.error('Error comparing password:', error);
    throw new Error('Failed to compare password');
  }
}

/**
 * Generate a secure random password
 * 
 * @param length The length of the password
 * @returns A secure random password
 */
export function generateSecurePassword(length: number = 16): string {
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const specialChars = '!@#$%^&*()-_=+[]{}|;:,.<>?';
  
  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
  
  // Ensure at least one of each character type
  let password = '';
  password += uppercaseChars.charAt(Math.floor(crypto.randomInt(uppercaseChars.length)));
  password += lowercaseChars.charAt(Math.floor(crypto.randomInt(lowercaseChars.length)));
  password += numberChars.charAt(Math.floor(crypto.randomInt(numberChars.length)));
  password += specialChars.charAt(Math.floor(crypto.randomInt(specialChars.length)));
  
  // Fill the rest with random characters
  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(crypto.randomInt(allChars.length)));
  }
  
  // Shuffle the password
  return password
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('');
}

export default {
  validatePassword,
  hashPassword,
  comparePassword,
  generateSecurePassword,
  passwordSchema,
};
