import express, { Request, Response } from 'express';
import { db } from './db';
import {
  users,
  serviceUsers,
  carePlans,
  goals,
  tasks,
  appointments,
  notes,
  riskAssessments,
  resourceLocations,
  communityResources
} from '@shared/schema';
import {
  loginCredentialsSchema,
  registrationDataSchema,
  LoginCredentials,
  RegistrationData,
  AuthResponse
} from '@shared/types/auth';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { validatePassword, hashPassword, comparePassword } from './utils/password-validator';

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req: Request, res: Response, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const secret = process.env.SESSION_SECRET || 'your_very_strong_and_random_session_secret';
    const decoded = jwt.verify(token, secret);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Import rate limiter
import { authRateLimiter } from './middleware/enhanced-rate-limiter';

// Authentication routes
router.post('/auth/login', authRateLimiter, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = loginCredentialsSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Invalid login data',
        errors: validationResult.error.errors
      });
    }

    const { username, password } = validationResult.data;

    // Find user by username
    const userResults = await db.select().from(users).where(eq(users.username, username));

    if (userResults.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = userResults[0];

    // Check if account is locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      return res.status(401).json({
        message: 'Account is temporarily locked due to too many failed login attempts. Please try again later.'
      });
    }

    // Verify password using our enhanced password validator
    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      // Increment failed login attempts
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;

      // Lock account after 5 failed attempts
      let lockedUntil = null;
      if (failedAttempts >= 5) {
        // Lock for 30 minutes (increased from 15 for better security)
        lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      }

      // Update user record
      await db.update(users)
        .set({
          failedLoginAttempts: failedAttempts,
          lockedUntil: lockedUntil
        })
        .where(eq(users.id, user.id));

      // Log the failed login attempt
      console.warn(`Failed login attempt for user ${username} (${failedAttempts} attempts)`);

      // Return generic error message (don't reveal if username exists)
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Reset failed login attempts on successful login
    await db.update(users)
      .set({
        failedLoginAttempts: 0,
        lockedUntil: null
      })
      .where(eq(users.id, user.id));

    // Check if password reset is required
    if (user.passwordResetRequired) {
      return res.status(401).json({
        message: 'Password reset required',
        requiresPasswordReset: true,
        userId: user.id
      });
    }

    // Check if 2FA is enabled
    if (user.totpEnabled) {
      // Generate a temporary token for 2FA verification
      const secret = process.env.SESSION_SECRET || 'your_very_strong_and_random_session_secret';
      const tempToken = jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role,
          requires2FA: true,
          exp: Math.floor(Date.now() / 1000) + (10 * 60) // 10 minute expiration
        },
        secret
      );

      return res.status(200).json({
        requires2FA: true,
        tempToken,
        userId: user.id
      });
    }

    // Generate JWT token
    const secret = process.env.SESSION_SECRET || 'your_very_strong_and_random_session_secret';
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      secret,
      { expiresIn: '24h' }
    );

    // Remove password and security-sensitive fields from user object before sending response
    const {
      password: _,
      totpSecret: __,
      backupCodes: ___,
      ...userWithoutSensitiveData
    } = user;

    // Return auth response
    const response: AuthResponse = {
      token,
      user: userWithoutSensitiveData
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

router.post('/auth/register', authRateLimiter, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = registrationDataSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Invalid registration data',
        errors: validationResult.error.errors
      });
    }

    const { username, password, fullName, email, role, phoneNumber, profileImage } = validationResult.data;

    // Check if username already exists
    const existingUser = await db.select().from(users).where(eq(users.username, username));

    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    // Check if email already exists
    const existingEmail = await db.select().from(users).where(eq(users.email, email));

    if (existingEmail.length > 0) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Password strength validation using enhanced validator
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        message: passwordValidation.message || 'Password does not meet security requirements'
      });
    }

    // Check if password is in a list of previously breached passwords (optional)
    // This would typically call an external API like "Have I Been Pwned"

    // Hash password with stronger security
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = await db.insert(users).values({
      username,
      password: hashedPassword,
      fullName,
      email,
      role: role || 'caregiver', // Default to caregiver if not specified
      phoneNumber,
      profileImage,
      lastPasswordChange: new Date().toISOString(),
      failedLoginAttempts: 0,
      passwordResetRequired: false,
      updatedAt: new Date().toISOString()
    }).returning();

    const user = newUser[0];

    // Generate token
    const secret = process.env.SESSION_SECRET || 'your_very_strong_and_random_session_secret';
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      secret,
      { expiresIn: '24h' }
    );

    // Remove sensitive data from user object
    const {
      password: _,
      totpSecret: __,
      backupCodes: ___,
      ...userWithoutSensitiveData
    } = user;

    // Return auth response
    const response: AuthResponse = {
      token,
      user: userWithoutSensitiveData
    };

    // Log the registration for security audit
    console.log(`New user registered: ${username} (${email}) with role ${role || 'caregiver'}`);

    res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

router.post('/auth/verify-2fa', async (req: Request, res: Response) => {
  try {
    const { tempToken, code, method } = req.body;

    if (!tempToken || !code) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify the temporary token
    const secret = process.env.SESSION_SECRET || 'your_very_strong_and_random_session_secret';
    let decoded;

    try {
      decoded = jwt.verify(tempToken, secret) as any;
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Check if token is for 2FA
    if (!decoded.requires2FA) {
      return res.status(400).json({ message: 'Invalid token type' });
    }

    const userId = decoded.id;

    // Get user
    const userResults = await db.select().from(users).where(eq(users.id, userId));

    if (userResults.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResults[0];

    // Verify the code based on method
    let isValid = false;

    if (method === 'totp') {
      // Verify TOTP code
      const authenticator = require('otplib').authenticator;
      isValid = authenticator.verify({ token: code, secret: user.totpSecret });
    } else if (method === 'backup') {
      // Verify backup code
      if (user.backupCodes && Array.isArray(user.backupCodes)) {
        // Hash the provided code
        const crypto = require('crypto');
        const hashedCode = crypto.createHash('sha256')
          .update(code.replace(/-/g, ''))
          .digest('hex');

        // Check if the code exists
        const index = user.backupCodes.indexOf(hashedCode);

        if (index !== -1) {
          isValid = true;

          // Remove the used code
          const updatedBackupCodes = [...user.backupCodes];
          updatedBackupCodes.splice(index, 1);

          // Update the database
          await db.update(users)
            .set({
              backupCodes: updatedBackupCodes,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(users.id, userId));
        }
      }
    }

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid verification code' });
    }

    // Generate a new JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      secret,
      { expiresIn: '24h' }
    );

    // Remove sensitive data from user object
    const {
      password: _,
      totpSecret: __,
      backupCodes: ___,
      ...userWithoutSensitiveData
    } = user;

    // Return auth response
    const response = {
      token,
      user: userWithoutSensitiveData
    };

    res.json(response);
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({ message: 'Server error during 2FA verification' });
  }
});

router.get('/auth/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const userResults = await db.select().from(users).where(eq(users.id, userId));

    if (userResults.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResults[0];

    // Remove sensitive data from user object
    const {
      password: _,
      totpSecret: __,
      backupCodes: ___,
      ...userWithoutSensitiveData
    } = user;

    res.json(userWithoutSensitiveData);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Users routes
router.get('/users', authenticateToken, async (req: Request, res: Response) => {
  try {
    const allUsers = await db.select().from(users);

    // Remove passwords from user objects
    const usersWithoutPasswords = allUsers.map(user => {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json(usersWithoutPasswords);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/auth/change-password', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: 'Password must be at least 10 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character'
      });
    }

    // Get user
    const userResults = await db.select().from(users).where(eq(users.id, userId));

    if (userResults.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResults[0];

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Check if new password is the same as the current one
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: 'New password must be different from the current password' });
    }

    // Hash new password
    const saltRounds = 12; // Higher than the default 10 for better security
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user
    await db.update(users)
      .set({
        password: hashedPassword,
        lastPasswordChange: new Date().toISOString(),
        passwordResetRequired: false,
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.id, userId));

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error during password change' });
  }
});

router.get('/users/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);

    const userResults = await db.select().from(users).where(eq(users.id, userId));

    if (userResults.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResults[0];

    // Remove sensitive data from user object
    const {
      password: _,
      totpSecret: __,
      backupCodes: ___,
      ...userWithoutSensitiveData
    } = user;

    res.json(userWithoutSensitiveData);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Service Users routes
router.get('/service-users', authenticateToken, async (req: Request, res: Response) => {
  try {
    const allServiceUsers = await db.select().from(serviceUsers);
    res.json(allServiceUsers);
  } catch (error) {
    console.error('Get service users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/service-users/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const serviceUserId = parseInt(req.params.id);

    const serviceUserResults = await db.select().from(serviceUsers).where(eq(serviceUsers.id, serviceUserId));

    if (serviceUserResults.length === 0) {
      return res.status(404).json({ message: 'Service user not found' });
    }

    res.json(serviceUserResults[0]);
  } catch (error) {
    console.error('Get service user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Care Plans routes
router.get('/care-plans', authenticateToken, async (req: Request, res: Response) => {
  try {
    const allCarePlans = await db.select().from(carePlans);
    res.json(allCarePlans);
  } catch (error) {
    console.error('Get care plans error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Appointments routes
router.get('/appointments', authenticateToken, async (req: Request, res: Response) => {
  try {
    const allAppointments = await db.select().from(appointments);
    res.json(allAppointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// AI Allocation routes
router.post('/allocation/suggestions', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { serviceUserId, date, startTime, endTime, visitType, requiredSkills } = req.body;

    // In a real application, this would use a sophisticated algorithm
    // For demo purposes, we'll return mock data
    const caregivers = await db.select().from(users).where(eq(users.role, 'caregiver'));

    const suggestions = caregivers.map(caregiver => {
      // Generate a random match score between 50 and 100
      const matchScore = Math.floor(Math.random() * 51) + 50;

      // Generate random availability (80% chance of being available)
      const availability = Math.random() < 0.8;

      // Generate random distance between 0.5 and 15 miles
      const distance = parseFloat((Math.random() * 14.5 + 0.5).toFixed(1));

      // Generate random travel time (roughly based on distance)
      const travelTime = Math.floor(distance * 2) + Math.floor(Math.random() * 10);

      // Generate random reason codes
      const allReasonCodes = [
        'Skill Match',
        'Previous Experience',
        'Preferred Caregiver',
        'Availability Match',
        'Geographic Proximity',
        'Language Match',
        'Gender Preference Match',
        'Cultural Compatibility'
      ];

      // Select 2-4 random reason codes
      const numReasons = Math.floor(Math.random() * 3) + 2;
      const reasonCodes = [];

      for (let i = 0; i < numReasons; i++) {
        const randomIndex = Math.floor(Math.random() * allReasonCodes.length);
        const reason = allReasonCodes.splice(randomIndex, 1)[0];
        reasonCodes.push(reason);
      }

      return {
        caregiverId: caregiver.id,
        caregiverName: caregiver.fullName,
        matchScore,
        reasonCodes,
        availability,
        distance,
        travelTime
      };
    });

    // Sort by match score (highest first)
    suggestions.sort((a, b) => b.matchScore - a.matchScore);

    res.json(suggestions);
  } catch (error) {
    console.error('Get allocation suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
