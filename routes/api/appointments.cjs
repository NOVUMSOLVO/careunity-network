// Appointments API routes
const express = require('express');
const router = express.Router();
const { db } = require('../../db/index.cjs');
const { appointments, serviceUsers, users } = require('../../db/schema-simple.cjs');
const { eq, and, gte, lte } = require('drizzle-orm');
const { authenticateToken, requireCareManager } = require('../../middleware/auth.cjs');

// Get all appointments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.select().from(appointments);
    
    res.json({
      status: 'success',
      appointments: result
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching appointments'
    });
  }
});

// Get appointments for a specific service user
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
    
    // Get appointments for the service user
    const result = await db.select()
      .from(appointments)
      .where(eq(appointments.serviceUserId, serviceUserId));
    
    res.json({
      status: 'success',
      appointments: result
    });
  } catch (error) {
    console.error('Get appointments for service user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching appointments'
    });
  }
});

// Get appointments for a specific caregiver
router.get('/caregiver/:caregiverId', authenticateToken, async (req, res) => {
  const caregiverId = parseInt(req.params.caregiverId);
  
  try {
    // Check if caregiver exists
    const caregiverExists = await db.select({ id: users.id })
      .from(users)
      .where(eq(users.id, caregiverId))
      .limit(1);
    
    if (caregiverExists.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Caregiver not found'
      });
    }
    
    // Get appointments for the caregiver
    const result = await db.select()
      .from(appointments)
      .where(eq(appointments.caregiverId, caregiverId));
    
    res.json({
      status: 'success',
      appointments: result
    });
  } catch (error) {
    console.error('Get appointments for caregiver error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching appointments'
    });
  }
});

// Get appointments by date range
router.get('/date-range', authenticateToken, async (req, res) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({
      status: 'error',
      message: 'Start date and end date are required'
    });
  }
  
  try {
    // Get appointments within the date range
    const result = await db.select()
      .from(appointments)
      .where(
        and(
          gte(appointments.date, startDate),
          lte(appointments.date, endDate)
        )
      );
    
    res.json({
      status: 'success',
      appointments: result
    });
  } catch (error) {
    console.error('Get appointments by date range error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching appointments'
    });
  }
});

// Get appointment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  const appointmentId = parseInt(req.params.id);
  
  try {
    const result = await db.select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);
    
    if (result.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }
    
    res.json({
      status: 'success',
      appointment: result[0]
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching the appointment'
    });
  }
});

// Create a new appointment
router.post('/', authenticateToken, requireCareManager, async (req, res) => {
  const { 
    serviceUserId, 
    caregiverId, 
    title, 
    description, 
    date, 
    startTime, 
    endTime, 
    status, 
    location, 
    visitType 
  } = req.body;
  
  // Validate required fields
  if (!serviceUserId || !title || !date || !startTime || !endTime || !visitType) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required fields',
      requiredFields: ['serviceUserId', 'title', 'date', 'startTime', 'endTime', 'visitType']
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
    
    // Check if caregiver exists if provided
    if (caregiverId) {
      const caregiverExists = await db.select({ id: users.id })
        .from(users)
        .where(eq(users.id, caregiverId))
        .limit(1);
      
      if (caregiverExists.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Caregiver not found'
        });
      }
    }
    
    // Create appointment
    const result = await db.insert(appointments).values({
      serviceUserId,
      caregiverId: caregiverId || null,
      title,
      description: description || null,
      date,
      startTime,
      endTime,
      status: status || 'scheduled',
      location: location || null,
      visitType
    }).returning();
    
    const newAppointment = result[0];
    
    res.status(201).json({
      status: 'success',
      message: 'Appointment created successfully',
      appointment: newAppointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while creating the appointment'
    });
  }
});

// Update an appointment
router.put('/:id', authenticateToken, requireCareManager, async (req, res) => {
  const appointmentId = parseInt(req.params.id);
  const { 
    caregiverId, 
    title, 
    description, 
    date, 
    startTime, 
    endTime, 
    status, 
    location, 
    visitType 
  } = req.body;
  
  try {
    // Check if appointment exists
    const existingAppointment = await db.select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);
    
    if (existingAppointment.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }
    
    // Check if caregiver exists if provided
    if (caregiverId) {
      const caregiverExists = await db.select({ id: users.id })
        .from(users)
        .where(eq(users.id, caregiverId))
        .limit(1);
      
      if (caregiverExists.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Caregiver not found'
        });
      }
    }
    
    // Prepare update data
    const updateData = {};
    
    if (caregiverId !== undefined) updateData.caregiverId = caregiverId;
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (date) updateData.date = date;
    if (startTime) updateData.startTime = startTime;
    if (endTime) updateData.endTime = endTime;
    if (status) updateData.status = status;
    if (location !== undefined) updateData.location = location;
    if (visitType) updateData.visitType = visitType;
    
    // Update appointment
    const result = await db.update(appointments)
      .set(updateData)
      .where(eq(appointments.id, appointmentId))
      .returning();
    
    const updatedAppointment = result[0];
    
    res.json({
      status: 'success',
      message: 'Appointment updated successfully',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while updating the appointment'
    });
  }
});

// Update appointment status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  const appointmentId = parseInt(req.params.id);
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({
      status: 'error',
      message: 'Status is required'
    });
  }
  
  try {
    // Check if appointment exists
    const existingAppointment = await db.select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);
    
    if (existingAppointment.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }
    
    // Update appointment status
    const result = await db.update(appointments)
      .set({ status })
      .where(eq(appointments.id, appointmentId))
      .returning();
    
    const updatedAppointment = result[0];
    
    res.json({
      status: 'success',
      message: `Appointment status updated to ${status}`,
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while updating the appointment status'
    });
  }
});

// Delete an appointment
router.delete('/:id', authenticateToken, requireCareManager, async (req, res) => {
  const appointmentId = parseInt(req.params.id);
  
  try {
    // Check if appointment exists
    const existingAppointment = await db.select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);
    
    if (existingAppointment.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }
    
    // Delete appointment
    await db.delete(appointments).where(eq(appointments.id, appointmentId));
    
    res.json({
      status: 'success',
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while deleting the appointment'
    });
  }
});

module.exports = router;
