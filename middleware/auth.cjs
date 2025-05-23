// Authentication middleware
const jwt = require('jsonwebtoken');

// JWT secret key (in a real app, this would be in an environment variable)
const JWT_SECRET = 'your-secret-key';

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  // Get the authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication token is required'
    });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        status: 'error',
        message: 'Invalid or expired token'
      });
    }
    
    // Add user to request object
    req.user = user;
    next();
  });
}

// Middleware to check if user has admin role
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required'
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Admin privileges required'
    });
  }
  
  next();
}

// Middleware to check if user has care manager role
function requireCareManager(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required'
    });
  }
  
  if (req.user.role !== 'admin' && req.user.role !== 'care_manager') {
    return res.status(403).json({
      status: 'error',
      message: 'Care manager privileges required'
    });
  }
  
  next();
}

// Function to generate JWT token
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

module.exports = {
  authenticateToken,
  requireAdmin,
  requireCareManager,
  generateToken,
  JWT_SECRET
};
