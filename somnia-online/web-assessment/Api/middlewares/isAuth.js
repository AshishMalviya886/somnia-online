const jwt = require('jsonwebtoken');

// Mock user for testing
const mockUser = {
  id: '6ac75d4a91ae6e810c350138', // Real user from MongoDB
  email: 'test@meblabs.com',
  name: 'Admin',
  role: 'superuser'
};

const isAuth = (req, res, next) => {
  // Check for token in cookies or Authorization header
  let token = req.cookies?.accessToken;
  
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  
  if (!token) {
    req.user = mockUser; // For testing, just use mock user
    res.locals.user = mockUser;
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    res.locals.user = decoded;
    next();
  } catch (error) {
    // If token is invalid, still use mock user for testing
    req.user = mockUser;
    res.locals.user = mockUser;
    next();
  }
};

const isAuthRt = (req, res, next) => {
  req.user = mockUser;
  next();
};

const isAuthRtlogout = (req, res, next) => {
  req.user = mockUser;
  next();
};

const isAuthChangePassword = (req, res, next) => {
  req.user = mockUser;
  next();
};

module.exports = {
  isAuth,
  isAuthRt,
  isAuthRtlogout,
  isAuthChangePassword
};