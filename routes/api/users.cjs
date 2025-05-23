// User API routes
const express = require('express');
const router = express.Router();
const { db } = require('../../db/index.cjs');
const { users } = require('../../db/schema-simple.cjs');
const { eq } = require('drizzle-orm');
const bcrypt = require('bcrypt');
const { authenticateToken, requireAdmin, requireCareManager } = require('../../middleware/auth.cjs');

// Get all users
router.get('/', authenticateToken, requireCareManager, async (req, res) => {
  try {
    const result = await db.select({
      id: users.id,
      username: users.username,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      phoneNumber: users.phoneNumber,
      profileImage: users.profileImage
    }).from(users);

    res.json({
      status: 'success',
      users: result
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching users'
    });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  const userId = parseInt(req.params.id);

  // Check if the user is requesting their own data or has admin/manager privileges
  if (req.user.id !== userId && req.user.role !== 'admin' && req.user.role !== 'care_manager') {
    return res.status(403).json({
      status: 'error',
      message: 'You do not have permission to access this user data'
    });
  }

  try {
    const result = await db.select({
      id: users.id,
      username: users.username,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      phoneNumber: users.phoneNumber,
      profileImage: users.profileImage
    }).from(users).where(eq(users.id, userId)).limit(1);

    if (result.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      user: result[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching user data'
    });
  }
});

// Create a new user
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  const { username, fullName, email, role, password, phoneNumber } = req.body;

  // Validate required fields
  if (!username || !fullName || !email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required fields',
      requiredFields: ['username', 'fullName', 'email', 'password']
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
      role: role || 'care_worker',
      phoneNumber: phoneNumber || null
    }).returning();

    const newUser = result[0];

    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        phoneNumber: newUser.phoneNumber
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while creating the user'
    });
  }
});

// Update a user
router.put('/:id', authenticateToken, async (req, res) => {
  const userId = parseInt(req.params.id);
  const { username, fullName, email, role, phoneNumber, password } = req.body;

  // Check if the user is updating their own data or has admin privileges
  if (req.user.id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'You do not have permission to update this user'
    });
  }

  // Only admins can change roles
  if (role && req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Only administrators can change user roles'
    });
  }

  try {
    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (existingUser.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Prepare update data
    const updateData = {};

    if (username) updateData.username = username;
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    const result = await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    const updatedUser = result[0];

    res.json({
      status: 'success',
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        phoneNumber: updatedUser.phoneNumber
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while updating the user'
    });
  }
});

// Delete a user
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (existingUser.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Prevent deleting yourself
    if (req.user.id === userId) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot delete your own account'
      });
    }

    // Delete user
    await db.delete(users).where(eq(users.id, userId));

    res.json({
      status: 'success',
      message: `User with ID ${userId} deleted successfully`
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while deleting the user'
    });
  }
});

module.exports = router;
