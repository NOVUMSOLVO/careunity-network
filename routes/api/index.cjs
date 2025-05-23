// API routes index
const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./users.cjs');
const serviceUserRoutes = require('./service-users.cjs');
const authRoutes = require('./auth.cjs');
const carePlanRoutes = require('./care-plans.cjs');
const taskRoutes = require('./tasks.cjs');
const appointmentRoutes = require('./appointments.cjs');
const noteRoutes = require('./notes.cjs');

// Health check route
router.get('/healthcheck', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'CareUnity API is running'
  });
});

// Mount routes
router.use('/users', userRoutes);
router.use('/service-users', serviceUserRoutes);
router.use('/auth', authRoutes);
router.use('/care-plans', carePlanRoutes);
router.use('/tasks', taskRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/notes', noteRoutes);

module.exports = router;
