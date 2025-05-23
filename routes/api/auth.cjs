// Authentication API routes
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { db } = require('../../db/index.cjs');
const { users } = require('../../db/schema-simple.cjs');
const { eq } = require('drizzle-orm');
const { generateToken, authenticateToken } = require('../../middleware/auth.cjs');
const { RateLimiterMemory } = require('rate-limiter-flexible');

// Create auth rate limiter
const authLimiter = new RateLimiterMemory({
  points: 5, // 5 attempts
  duration: 60, // per 1 minute
  blockDuration: 300, // Block for 5 minutes if exceeded
});

// Rate limiter middleware
const authRateLimiter = async (req, res, next) => {
  try {
    // Use IP address as key
    const key = req.ip || req.socket.remoteAddress || 'unknown';

    await authLimiter.consume(key);
    next();
  } catch (error) {
    // Calculate retry after time
    const retryAfter = Math.floor(error.msBeforeNext / 1000) || 60;

    // Set retry-after header
    res.set('Retry-After', String(retryAfter));

    // Send error response
    return res.status(429).json({
      status: 'error',
      message: 'Too many authentication attempts, please try again later',
      retryAfter
    });
  }
};

// Login route
router.post('/login', authRateLimiter, async (req, res) => {
  const { username, password } = req.body;

  // Validate required fields
  if (!username || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Username and password are required'
    });
  }

  try {
    // Find user
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);

    if (result.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid username or password'
      });
    }

    const user = result[0];

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid username or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return user info and token
    res.json({
      status: 'success',
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during login'
    });
  }
});

// Register route
router.post('/register', authRateLimiter, async (req, res) => {
  const { username, password, fullName, email } = req.body;

  // Validate required fields
  if (!username || !password || !fullName || !email) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required fields',
      requiredFields: ['username', 'password', 'fullName', 'email']
    });
  }

  try {
    // Check if username already exists
    const existingUser = await db.select({ id: users.id }).from(users).where(eq(users.username, username)).limit(1);

    if (existingUser.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: 'Username already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const result = await db.insert(users).values({
      username,
      password: hashedPassword,
      fullName,
      email,
      role: 'care_worker' // Default role
    }).returning();

    const newUser = result[0];

    // Generate JWT token
    const token = generateToken(newUser);

    res.status(201).json({
      status: 'success',
      message: 'Registration successful',
      user: {
        id: newUser.id,
        username: newUser.username,
        fullName: newUser.fullName,
        role: newUser.role,
        email: newUser.email
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during registration'
    });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  // In a real app, we would invalidate the token

  res.json({
    status: 'success',
    message: 'Logout successful'
  });
});

// Get current user route
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // Get user from database using the ID from the token
    const result = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);

    if (result.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const user = result[0];

    res.json({
      status: 'success',
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching user data'
    });
  }
});

module.exports = router;
