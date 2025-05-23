// Tasks API routes
const express = require('express');
const router = express.Router();
const { db } = require('../../db/index.cjs');
const { tasks, carePlans } = require('../../db/schema-simple.cjs');
const { eq } = require('drizzle-orm');
const { authenticateToken, requireCareManager } = require('../../middleware/auth.cjs');

// Get all tasks
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.select().from(tasks);
    
    res.json({
      status: 'success',
      tasks: result
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching tasks'
    });
  }
});

// Get tasks for a specific care plan
router.get('/care-plan/:carePlanId', authenticateToken, async (req, res) => {
  const carePlanId = parseInt(req.params.carePlanId);
  
  try {
    // Check if care plan exists
    const carePlanExists = await db.select({ id: carePlans.id })
      .from(carePlans)
      .where(eq(carePlans.id, carePlanId))
      .limit(1);
    
    if (carePlanExists.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Care plan not found'
      });
    }
    
    // Get tasks for the care plan
    const result = await db.select()
      .from(tasks)
      .where(eq(tasks.carePlanId, carePlanId));
    
    res.json({
      status: 'success',
      tasks: result
    });
  } catch (error) {
    console.error('Get tasks for care plan error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching tasks'
    });
  }
});

// Get task by ID
router.get('/:id', authenticateToken, async (req, res) => {
  const taskId = parseInt(req.params.id);
  
  try {
    const result = await db.select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);
    
    if (result.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }
    
    res.json({
      status: 'success',
      task: result[0]
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching the task'
    });
  }
});

// Create a new task
router.post('/', authenticateToken, requireCareManager, async (req, res) => {
  const { carePlanId, title, description, category, timeOfDay, completed } = req.body;
  
  // Validate required fields
  if (!carePlanId || !title || !category || !timeOfDay) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required fields',
      requiredFields: ['carePlanId', 'title', 'category', 'timeOfDay']
    });
  }
  
  try {
    // Check if care plan exists
    const carePlanExists = await db.select({ id: carePlans.id })
      .from(carePlans)
      .where(eq(carePlans.id, carePlanId))
      .limit(1);
    
    if (carePlanExists.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Care plan not found'
      });
    }
    
    // Create task
    const result = await db.insert(tasks).values({
      carePlanId,
      title,
      description: description || null,
      category,
      timeOfDay,
      completed: completed || false
    }).returning();
    
    const newTask = result[0];
    
    res.status(201).json({
      status: 'success',
      message: 'Task created successfully',
      task: newTask
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while creating the task'
    });
  }
});

// Update a task
router.put('/:id', authenticateToken, async (req, res) => {
  const taskId = parseInt(req.params.id);
  const { title, description, category, timeOfDay, completed } = req.body;
  
  try {
    // Check if task exists
    const existingTask = await db.select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);
    
    if (existingTask.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }
    
    // Prepare update data
    const updateData = {};
    
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category) updateData.category = category;
    if (timeOfDay) updateData.timeOfDay = timeOfDay;
    if (completed !== undefined) updateData.completed = completed;
    
    // Update task
    const result = await db.update(tasks)
      .set(updateData)
      .where(eq(tasks.id, taskId))
      .returning();
    
    const updatedTask = result[0];
    
    res.json({
      status: 'success',
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while updating the task'
    });
  }
});

// Mark a task as completed or not completed
router.patch('/:id/complete', authenticateToken, async (req, res) => {
  const taskId = parseInt(req.params.id);
  const { completed } = req.body;
  
  if (completed === undefined) {
    return res.status(400).json({
      status: 'error',
      message: 'The completed field is required'
    });
  }
  
  try {
    // Check if task exists
    const existingTask = await db.select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);
    
    if (existingTask.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }
    
    // Update task completion status
    const result = await db.update(tasks)
      .set({ completed })
      .where(eq(tasks.id, taskId))
      .returning();
    
    const updatedTask = result[0];
    
    res.json({
      status: 'success',
      message: `Task marked as ${completed ? 'completed' : 'not completed'}`,
      task: updatedTask
    });
  } catch (error) {
    console.error('Update task completion error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while updating the task'
    });
  }
});

// Delete a task
router.delete('/:id', authenticateToken, requireCareManager, async (req, res) => {
  const taskId = parseInt(req.params.id);
  
  try {
    // Check if task exists
    const existingTask = await db.select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);
    
    if (existingTask.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }
    
    // Delete task
    await db.delete(tasks).where(eq(tasks.id, taskId));
    
    res.json({
      status: 'success',
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while deleting the task'
    });
  }
});

module.exports = router;
