// Care Plan API routes
const express = require('express');
const router = express.Router();
const { db } = require('../../db/index.cjs');
const { carePlans, serviceUsers, tasks } = require('../../db/schema-simple.cjs');
const { eq, and } = require('drizzle-orm');
const { authenticateToken, requireAdmin, requireCareManager } = require('../../middleware/auth.cjs');

// Get all care plans
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.select({
      id: carePlans.id,
      serviceUserId: carePlans.serviceUserId,
      title: carePlans.title,
      summary: carePlans.summary,
      startDate: carePlans.startDate,
      reviewDate: carePlans.reviewDate,
      status: carePlans.status
    }).from(carePlans);
    
    res.json({
      status: 'success',
      carePlans: result
    });
  } catch (error) {
    console.error('Get care plans error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching care plans'
    });
  }
});

// Get care plans for a specific service user
router.get('/service-user/:serviceUserId', authenticateToken, async (req, res) => {
  const serviceUserId = parseInt(req.params.serviceUserId);
  
  try {
    // Check if service user exists
    const serviceUserExists = await db.select({ id: serviceUsers.id })
      .from(serviceUsers)
      .where(eq(serviceUsers.id, serviceUserId))
      .limit(1);
    
    if (serviceUserExists.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Service user not found'
      });
    }
    
    // Get care plans for the service user
    const result = await db.select({
      id: carePlans.id,
      title: carePlans.title,
      summary: carePlans.summary,
      startDate: carePlans.startDate,
      reviewDate: carePlans.reviewDate,
      status: carePlans.status
    })
    .from(carePlans)
    .where(eq(carePlans.serviceUserId, serviceUserId));
    
    res.json({
      status: 'success',
      carePlans: result
    });
  } catch (error) {
    console.error('Get care plans for service user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching care plans'
    });
  }
});

// Get care plan by ID
router.get('/:id', authenticateToken, async (req, res) => {
  const carePlanId = parseInt(req.params.id);
  
  try {
    // Get care plan
    const carePlanResult = await db.select()
      .from(carePlans)
      .where(eq(carePlans.id, carePlanId))
      .limit(1);
    
    if (carePlanResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Care plan not found'
      });
    }
    
    const carePlan = carePlanResult[0];
    
    // Get tasks for this care plan
    const tasksResult = await db.select()
      .from(tasks)
      .where(eq(tasks.carePlanId, carePlanId));
    
    res.json({
      status: 'success',
      carePlan: {
        ...carePlan,
        tasks: tasksResult
      }
    });
  } catch (error) {
    console.error('Get care plan error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching the care plan'
    });
  }
});

// Create a new care plan
router.post('/', authenticateToken, requireCareManager, async (req, res) => {
  const { serviceUserId, title, summary, startDate, reviewDate, status, tasks: tasksList } = req.body;
  
  // Validate required fields
  if (!serviceUserId || !title || !startDate || !status) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required fields',
      requiredFields: ['serviceUserId', 'title', 'startDate', 'status']
    });
  }
  
  try {
    // Check if service user exists
    const serviceUserExists = await db.select({ id: serviceUsers.id })
      .from(serviceUsers)
      .where(eq(serviceUsers.id, serviceUserId))
      .limit(1);
    
    if (serviceUserExists.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Service user not found'
      });
    }
    
    // Create care plan
    const carePlanResult = await db.insert(carePlans).values({
      serviceUserId,
      title,
      summary: summary || null,
      startDate,
      reviewDate: reviewDate || null,
      status
    }).returning();
    
    const newCarePlan = carePlanResult[0];
    
    // Create tasks if provided
    if (tasksList && Array.isArray(tasksList) && tasksList.length > 0) {
      const tasksToInsert = tasksList.map(task => ({
        carePlanId: newCarePlan.id,
        title: task.title,
        description: task.description || null,
        category: task.category,
        timeOfDay: task.timeOfDay,
        completed: task.completed || false
      }));
      
      await db.insert(tasks).values(tasksToInsert);
    }
    
    res.status(201).json({
      status: 'success',
      message: 'Care plan created successfully',
      carePlan: newCarePlan
    });
  } catch (error) {
    console.error('Create care plan error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while creating the care plan'
    });
  }
});

// Update a care plan
router.put('/:id', authenticateToken, requireCareManager, async (req, res) => {
  const carePlanId = parseInt(req.params.id);
  const { title, summary, startDate, reviewDate, status } = req.body;
  
  try {
    // Check if care plan exists
    const existingCarePlan = await db.select()
      .from(carePlans)
      .where(eq(carePlans.id, carePlanId))
      .limit(1);
    
    if (existingCarePlan.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Care plan not found'
      });
    }
    
    // Prepare update data
    const updateData = {};
    
    if (title) updateData.title = title;
    if (summary !== undefined) updateData.summary = summary;
    if (startDate) updateData.startDate = startDate;
    if (reviewDate !== undefined) updateData.reviewDate = reviewDate;
    if (status) updateData.status = status;
    
    // Update care plan
    const result = await db.update(carePlans)
      .set(updateData)
      .where(eq(carePlans.id, carePlanId))
      .returning();
    
    const updatedCarePlan = result[0];
    
    res.json({
      status: 'success',
      message: 'Care plan updated successfully',
      carePlan: updatedCarePlan
    });
  } catch (error) {
    console.error('Update care plan error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while updating the care plan'
    });
  }
});

// Delete a care plan
router.delete('/:id', authenticateToken, requireCareManager, async (req, res) => {
  const carePlanId = parseInt(req.params.id);
  
  try {
    // Check if care plan exists
    const existingCarePlan = await db.select()
      .from(carePlans)
      .where(eq(carePlans.id, carePlanId))
      .limit(1);
    
    if (existingCarePlan.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Care plan not found'
      });
    }
    
    // Delete associated tasks first
    await db.delete(tasks).where(eq(tasks.carePlanId, carePlanId));
    
    // Delete care plan
    await db.delete(carePlans).where(eq(carePlans.id, carePlanId));
    
    res.json({
      status: 'success',
      message: 'Care plan deleted successfully'
    });
  } catch (error) {
    console.error('Delete care plan error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while deleting the care plan'
    });
  }
});

module.exports = router;
