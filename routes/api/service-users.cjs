// Service User API routes
const express = require('express');
const router = express.Router();
const { db } = require('../../db/index.cjs');
const { serviceUsers } = require('../../db/schema-simple.cjs');
const { eq } = require('drizzle-orm');
const { authenticateToken, requireAdmin, requireCareManager } = require('../../middleware/auth.cjs');

// Get all service users
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.select({
      id: serviceUsers.id,
      uniqueId: serviceUsers.uniqueId,
      fullName: serviceUsers.fullName,
      dateOfBirth: serviceUsers.dateOfBirth,
      address: serviceUsers.address,
      phoneNumber: serviceUsers.phoneNumber,
      emergencyContact: serviceUsers.emergencyContact,
      profileImage: serviceUsers.profileImage
    }).from(serviceUsers);

    res.json({
      status: 'success',
      serviceUsers: result
    });
  } catch (error) {
    console.error('Get service users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching service users'
    });
  }
});

// Get service user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  const serviceUserId = parseInt(req.params.id);

  try {
    const result = await db.select().from(serviceUsers).where(eq(serviceUsers.id, serviceUserId)).limit(1);

    if (result.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Service user not found'
      });
    }

    const serviceUser = result[0];

    // Parse JSON strings if they exist
    if (serviceUser.preferences) {
      try {
        serviceUser.preferences = JSON.parse(serviceUser.preferences);
      } catch (e) {
        console.warn('Failed to parse preferences JSON:', e);
      }
    }

    if (serviceUser.needs) {
      try {
        serviceUser.needs = JSON.parse(serviceUser.needs);
      } catch (e) {
        console.warn('Failed to parse needs JSON:', e);
      }
    }

    res.json({
      status: 'success',
      serviceUser
    });
  } catch (error) {
    console.error('Get service user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching service user data'
    });
  }
});

// Create a new service user
router.post('/', authenticateToken, requireCareManager, async (req, res) => {
  const {
    fullName,
    dateOfBirth,
    address,
    phoneNumber,
    emergencyContact,
    preferences,
    needs,
    lifeStory
  } = req.body;

  // Validate required fields
  if (!fullName || !dateOfBirth || !address) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required fields',
      requiredFields: ['fullName', 'dateOfBirth', 'address']
    });
  }

  try {
    // Generate a unique ID
    const uniqueId = `SU${Date.now().toString().slice(-6)}`;

    // Prepare preferences and needs as JSON strings if provided
    const preferencesJson = preferences ? JSON.stringify(preferences) : null;
    const needsJson = needs ? JSON.stringify(needs) : null;

    // Create new service user
    const result = await db.insert(serviceUsers).values({
      uniqueId,
      fullName,
      dateOfBirth,
      address,
      phoneNumber: phoneNumber || null,
      emergencyContact: emergencyContact || null,
      preferences: preferencesJson,
      needs: needsJson,
      lifeStory: lifeStory || null
    }).returning();

    const newServiceUser = result[0];

    res.status(201).json({
      status: 'success',
      message: 'Service user created successfully',
      serviceUser: newServiceUser
    });
  } catch (error) {
    console.error('Create service user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while creating the service user'
    });
  }
});

// Update a service user
router.put('/:id', authenticateToken, requireCareManager, async (req, res) => {
  const serviceUserId = parseInt(req.params.id);
  const {
    fullName,
    dateOfBirth,
    address,
    phoneNumber,
    emergencyContact,
    preferences,
    needs,
    lifeStory
  } = req.body;

  try {
    // Check if service user exists
    const existingUser = await db.select().from(serviceUsers).where(eq(serviceUsers.id, serviceUserId)).limit(1);

    if (existingUser.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Service user not found'
      });
    }

    // Prepare update data
    const updateData = {};

    if (fullName) updateData.fullName = fullName;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (address) updateData.address = address;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (emergencyContact !== undefined) updateData.emergencyContact = emergencyContact;
    if (lifeStory !== undefined) updateData.lifeStory = lifeStory;

    // Handle preferences and needs as JSON
    if (preferences) {
      updateData.preferences = JSON.stringify(preferences);
    }

    if (needs) {
      updateData.needs = JSON.stringify(needs);
    }

    // Update service user
    const result = await db.update(serviceUsers)
      .set(updateData)
      .where(eq(serviceUsers.id, serviceUserId))
      .returning();

    const updatedServiceUser = result[0];

    // Parse JSON strings for the response
    if (updatedServiceUser.preferences) {
      try {
        updatedServiceUser.preferences = JSON.parse(updatedServiceUser.preferences);
      } catch (e) {
        console.warn('Failed to parse preferences JSON:', e);
      }
    }

    if (updatedServiceUser.needs) {
      try {
        updatedServiceUser.needs = JSON.parse(updatedServiceUser.needs);
      } catch (e) {
        console.warn('Failed to parse needs JSON:', e);
      }
    }

    res.json({
      status: 'success',
      message: 'Service user updated successfully',
      serviceUser: updatedServiceUser
    });
  } catch (error) {
    console.error('Update service user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while updating the service user'
    });
  }
});

// Delete a service user
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const serviceUserId = parseInt(req.params.id);

  try {
    // Check if service user exists
    const existingUser = await db.select().from(serviceUsers).where(eq(serviceUsers.id, serviceUserId)).limit(1);

    if (existingUser.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Service user not found'
      });
    }

    // Delete service user
    await db.delete(serviceUsers).where(eq(serviceUsers.id, serviceUserId));

    res.json({
      status: 'success',
      message: `Service user with ID ${serviceUserId} deleted successfully`
    });
  } catch (error) {
    console.error('Delete service user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while deleting the service user'
    });
  }
});

module.exports = router;
