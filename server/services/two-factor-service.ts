/**
 * Two-Factor Authentication Service
 * 
 * Provides two-factor authentication functionality.
 * Features:
 * - TOTP (Time-based One-Time Password) generation and verification
 * - QR code generation for TOTP setup
 * - Backup codes generation and verification
 * - Recovery options
 */

import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../utils/logger';

// Configuration
const APP_NAME = 'CareUnity';
const BACKUP_CODES_COUNT = 10;
const BACKUP_CODE_LENGTH = 10;

/**
 * Generate a new TOTP secret for a user
 * @param userId User ID
 * @returns TOTP secret and QR code data URL
 */
export const generateTOTPSecret = async (userId: number) => {
  try {
    // Get user
    const userResult = await db.select({
      username: users.username,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, userId));
    
    if (userResult.length === 0) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const user = userResult[0];
    
    // Generate secret
    const secret = authenticator.generateSecret();
    
    // Generate QR code
    const otpauth = authenticator.keyuri(user.username, APP_NAME, secret);
    const qrCode = await QRCode.toDataURL(otpauth);
    
    // Store secret in database
    await db.update(users)
      .set({
        totpSecret: secret,
        totpEnabled: false, // Not enabled until verified
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId));
    
    return {
      secret,
      qrCode,
    };
  } catch (error) {
    logger.error('Error generating TOTP secret:', error);
    throw error;
  }
};

/**
 * Verify TOTP token
 * @param userId User ID
 * @param token TOTP token
 * @returns Whether the token is valid
 */
export const verifyTOTP = async (userId: number, token: string): Promise<boolean> => {
  try {
    // Get user's TOTP secret
    const userResult = await db.select({
      totpSecret: users.totpSecret,
    })
    .from(users)
    .where(eq(users.id, userId));
    
    if (userResult.length === 0 || !userResult[0].totpSecret) {
      return false;
    }
    
    const secret = userResult[0].totpSecret;
    
    // Verify token
    return authenticator.verify({ token, secret });
  } catch (error) {
    logger.error('Error verifying TOTP:', error);
    return false;
  }
};

/**
 * Enable TOTP for a user
 * @param userId User ID
 * @param token TOTP token for verification
 * @returns Backup codes
 */
export const enableTOTP = async (userId: number, token: string): Promise<string[]> => {
  try {
    // Verify token first
    const isValid = await verifyTOTP(userId, token);
    
    if (!isValid) {
      throw new Error('Invalid TOTP token');
    }
    
    // Generate backup codes
    const backupCodes = generateBackupCodes();
    
    // Hash backup codes
    const hashedBackupCodes = backupCodes.map(code => hashBackupCode(code));
    
    // Store in database
    await db.update(users)
      .set({
        totpEnabled: true,
        backupCodes: hashedBackupCodes,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId));
    
    return backupCodes;
  } catch (error) {
    logger.error('Error enabling TOTP:', error);
    throw error;
  }
};

/**
 * Disable TOTP for a user
 * @param userId User ID
 */
export const disableTOTP = async (userId: number): Promise<void> => {
  try {
    await db.update(users)
      .set({
        totpSecret: null,
        totpEnabled: false,
        backupCodes: null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId));
  } catch (error) {
    logger.error('Error disabling TOTP:', error);
    throw error;
  }
};

/**
 * Verify backup code
 * @param userId User ID
 * @param code Backup code
 * @returns Whether the code is valid
 */
export const verifyBackupCode = async (userId: number, code: string): Promise<boolean> => {
  try {
    // Get user's backup codes
    const userResult = await db.select({
      backupCodes: users.backupCodes,
    })
    .from(users)
    .where(eq(users.id, userId));
    
    if (userResult.length === 0 || !userResult[0].backupCodes) {
      return false;
    }
    
    const backupCodes = userResult[0].backupCodes as string[];
    
    // Hash the provided code
    const hashedCode = hashBackupCode(code);
    
    // Check if the code exists
    const index = backupCodes.indexOf(hashedCode);
    
    if (index === -1) {
      return false;
    }
    
    // Remove the used code
    backupCodes.splice(index, 1);
    
    // Update the database
    await db.update(users)
      .set({
        backupCodes,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId));
    
    return true;
  } catch (error) {
    logger.error('Error verifying backup code:', error);
    return false;
  }
};

/**
 * Generate new backup codes for a user
 * @param userId User ID
 * @returns New backup codes
 */
export const regenerateBackupCodes = async (userId: number): Promise<string[]> => {
  try {
    // Generate backup codes
    const backupCodes = generateBackupCodes();
    
    // Hash backup codes
    const hashedBackupCodes = backupCodes.map(code => hashBackupCode(code));
    
    // Store in database
    await db.update(users)
      .set({
        backupCodes: hashedBackupCodes,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId));
    
    return backupCodes;
  } catch (error) {
    logger.error('Error regenerating backup codes:', error);
    throw error;
  }
};

/**
 * Check if TOTP is enabled for a user
 * @param userId User ID
 * @returns Whether TOTP is enabled
 */
export const isTOTPEnabled = async (userId: number): Promise<boolean> => {
  try {
    const userResult = await db.select({
      totpEnabled: users.totpEnabled,
    })
    .from(users)
    .where(eq(users.id, userId));
    
    if (userResult.length === 0) {
      return false;
    }
    
    return userResult[0].totpEnabled || false;
  } catch (error) {
    logger.error('Error checking if TOTP is enabled:', error);
    return false;
  }
};

/**
 * Generate backup codes
 * @returns Array of backup codes
 */
const generateBackupCodes = (): string[] => {
  const codes: string[] = [];
  
  for (let i = 0; i < BACKUP_CODES_COUNT; i++) {
    const code = crypto.randomBytes(Math.ceil(BACKUP_CODE_LENGTH / 2))
      .toString('hex')
      .slice(0, BACKUP_CODE_LENGTH)
      .toUpperCase();
    
    // Format as XXXX-XXXX-XX
    const formattedCode = `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 10)}`;
    
    codes.push(formattedCode);
  }
  
  return codes;
};

/**
 * Hash backup code
 * @param code Backup code
 * @returns Hashed backup code
 */
const hashBackupCode = (code: string): string => {
  // Remove formatting
  const cleanCode = code.replace(/-/g, '');
  
  return crypto.createHash('sha256')
    .update(cleanCode)
    .digest('hex');
};

export default {
  generateTOTPSecret,
  verifyTOTP,
  enableTOTP,
  disableTOTP,
  verifyBackupCode,
  regenerateBackupCodes,
  isTOTPEnabled,
};
