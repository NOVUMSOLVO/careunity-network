/**
 * Two-Factor Authentication API Routes
 * 
 * Provides endpoints for managing two-factor authentication.
 */

import express from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validation';
import { ensureAuthenticated } from '../middleware/auth';
import twoFactorService from '../services/two-factor-service';
import { ApiError } from '../middleware/error-handler';

const router = express.Router();

// All routes require authentication
router.use(ensureAuthenticated);

// Token validation schema
const tokenSchema = z.object({
  token: z.string().length(6, "Token must be 6 digits").regex(/^\d+$/, "Token must contain only digits"),
});

// Backup code validation schema
const backupCodeSchema = z.object({
  code: z.string().regex(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{2}$/, "Invalid backup code format"),
});

/**
 * Get TOTP status
 * GET /api/v2/2fa/status
 */
router.get('/status', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    
    const enabled = await twoFactorService.isTOTPEnabled(userId);
    
    res.json({ enabled });
  } catch (error) {
    next(error);
  }
});

/**
 * Generate TOTP secret
 * POST /api/v2/2fa/setup
 */
router.post('/setup', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    
    // Check if TOTP is already enabled
    const enabled = await twoFactorService.isTOTPEnabled(userId);
    
    if (enabled) {
      throw ApiError.badRequest('Two-factor authentication is already enabled');
    }
    
    const { secret, qrCode } = await twoFactorService.generateTOTPSecret(userId);
    
    res.json({
      secret,
      qrCode,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Verify and enable TOTP
 * POST /api/v2/2fa/enable
 */
router.post('/enable', validateBody(tokenSchema), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { token } = req.body;
    
    // Check if TOTP is already enabled
    const enabled = await twoFactorService.isTOTPEnabled(userId);
    
    if (enabled) {
      throw ApiError.badRequest('Two-factor authentication is already enabled');
    }
    
    // Enable TOTP and get backup codes
    const backupCodes = await twoFactorService.enableTOTP(userId, token);
    
    res.json({
      enabled: true,
      backupCodes,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Disable TOTP
 * POST /api/v2/2fa/disable
 */
router.post('/disable', validateBody(tokenSchema), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { token } = req.body;
    
    // Check if TOTP is enabled
    const enabled = await twoFactorService.isTOTPEnabled(userId);
    
    if (!enabled) {
      throw ApiError.badRequest('Two-factor authentication is not enabled');
    }
    
    // Verify token
    const isValid = await twoFactorService.verifyTOTP(userId, token);
    
    if (!isValid) {
      throw ApiError.unauthorized('Invalid token');
    }
    
    // Disable TOTP
    await twoFactorService.disableTOTP(userId);
    
    res.json({
      enabled: false,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Verify TOTP token
 * POST /api/v2/2fa/verify
 */
router.post('/verify', validateBody(tokenSchema), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { token } = req.body;
    
    // Verify token
    const isValid = await twoFactorService.verifyTOTP(userId, token);
    
    res.json({
      valid: isValid,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Verify backup code
 * POST /api/v2/2fa/verify-backup
 */
router.post('/verify-backup', validateBody(backupCodeSchema), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { code } = req.body;
    
    // Verify backup code
    const isValid = await twoFactorService.verifyBackupCode(userId, code);
    
    res.json({
      valid: isValid,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Regenerate backup codes
 * POST /api/v2/2fa/regenerate-backup
 */
router.post('/regenerate-backup', validateBody(tokenSchema), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { token } = req.body;
    
    // Check if TOTP is enabled
    const enabled = await twoFactorService.isTOTPEnabled(userId);
    
    if (!enabled) {
      throw ApiError.badRequest('Two-factor authentication is not enabled');
    }
    
    // Verify token
    const isValid = await twoFactorService.verifyTOTP(userId, token);
    
    if (!isValid) {
      throw ApiError.unauthorized('Invalid token');
    }
    
    // Regenerate backup codes
    const backupCodes = await twoFactorService.regenerateBackupCodes(userId);
    
    res.json({
      backupCodes,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
