// Notes API routes
const express = require('express');
const router = express.Router();
const { db } = require('../../db/index.cjs');
const { notes, serviceUsers, users } = require('../../db/schema-simple.cjs');
const { eq, and, desc } = require('drizzle-orm');
const { authenticateToken } = require('../../middleware/auth.cjs');

// Get all notes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.select()
      .from(notes)
      .orderBy(desc(notes.timestamp));
    
    res.json({
      status: 'success',
      notes: result
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching notes'
    });
  }
});

// Get notes for a specific service user
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
    
    // Get notes for the service user
    const result = await db.select()
      .from(notes)
      .where(eq(notes.serviceUserId, serviceUserId))
      .orderBy(desc(notes.timestamp));
    
    res.json({
      status: 'success',
      notes: result
    });
  } catch (error) {
    console.error('Get notes for service user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching notes'
    });
  }
});

// Get notes created by a specific user
router.get('/created-by/:userId', authenticateToken, async (req, res) => {
  const userId = parseInt(req.params.userId);
  
  try {
    // Check if user exists
    const userExists = await db.select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (userExists.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Get notes created by the user
    const result = await db.select()
      .from(notes)
      .where(eq(notes.createdBy, userId))
      .orderBy(desc(notes.timestamp));
    
    res.json({
      status: 'success',
      notes: result
    });
  } catch (error) {
    console.error('Get notes created by user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching notes'
    });
  }
});

// Get notes by category
router.get('/category/:category', authenticateToken, async (req, res) => {
  const { category } = req.params;
  
  try {
    // Get notes by category
    const result = await db.select()
      .from(notes)
      .where(eq(notes.category, category))
      .orderBy(desc(notes.timestamp));
    
    res.json({
      status: 'success',
      notes: result
    });
  } catch (error) {
    console.error('Get notes by category error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching notes'
    });
  }
});

// Get note by ID
router.get('/:id', authenticateToken, async (req, res) => {
  const noteId = parseInt(req.params.id);
  
  try {
    const result = await db.select()
      .from(notes)
      .where(eq(notes.id, noteId))
      .limit(1);
    
    if (result.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Note not found'
      });
    }
    
    res.json({
      status: 'success',
      note: result[0]
    });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching the note'
    });
  }
});

// Create a new note
router.post('/', authenticateToken, async (req, res) => {
  const { serviceUserId, content, category, isVoiceRecorded } = req.body;
  
  // Validate required fields
  if (!serviceUserId || !content) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required fields',
      requiredFields: ['serviceUserId', 'content']
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
    
    // Create timestamp
    const timestamp = new Date().toISOString();
    
    // Create note
    const result = await db.insert(notes).values({
      serviceUserId,
      createdBy: req.user.id, // From the authenticated user
      content,
      timestamp,
      category: category || null,
      isVoiceRecorded: isVoiceRecorded || false
    }).returning();
    
    const newNote = result[0];
    
    res.status(201).json({
      status: 'success',
      message: 'Note created successfully',
      note: newNote
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while creating the note'
    });
  }
});

// Update a note
router.put('/:id', authenticateToken, async (req, res) => {
  const noteId = parseInt(req.params.id);
  const { content, category, isVoiceRecorded } = req.body;
  
  try {
    // Check if note exists
    const existingNote = await db.select()
      .from(notes)
      .where(eq(notes.id, noteId))
      .limit(1);
    
    if (existingNote.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Note not found'
      });
    }
    
    // Check if the user is the creator of the note
    if (existingNote[0].createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update this note'
      });
    }
    
    // Prepare update data
    const updateData = {};
    
    if (content) updateData.content = content;
    if (category !== undefined) updateData.category = category;
    if (isVoiceRecorded !== undefined) updateData.isVoiceRecorded = isVoiceRecorded;
    
    // Update note
    const result = await db.update(notes)
      .set(updateData)
      .where(eq(notes.id, noteId))
      .returning();
    
    const updatedNote = result[0];
    
    res.json({
      status: 'success',
      message: 'Note updated successfully',
      note: updatedNote
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while updating the note'
    });
  }
});

// Delete a note
router.delete('/:id', authenticateToken, async (req, res) => {
  const noteId = parseInt(req.params.id);
  
  try {
    // Check if note exists
    const existingNote = await db.select()
      .from(notes)
      .where(eq(notes.id, noteId))
      .limit(1);
    
    if (existingNote.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Note not found'
      });
    }
    
    // Check if the user is the creator of the note or an admin
    if (existingNote[0].createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to delete this note'
      });
    }
    
    // Delete note
    await db.delete(notes).where(eq(notes.id, noteId));
    
    res.json({
      status: 'success',
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while deleting the note'
    });
  }
});

module.exports = router;
