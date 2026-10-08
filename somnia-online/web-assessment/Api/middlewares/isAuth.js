const jwt = require('jsonwebtoken');

const MOCK_USER_ID = '6ac75d4a91ae6e810c350138';

// Mock user for testing
const mockUser = {
  id: MOCK_USER_ID,
  email: 'test@meblabs.com',
  name: 'Admin',
  role: 'superuser'
};

const withObjectId = user => {
  const id = /^[a-fA-F0-9]{24}$/.test(String(user?.id || '')) ? String(user.id) : MOCK_USER_ID;
  return { ...user, id, _id: id };
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
    req.user = mockUser;
    res.locals.user = mockUser;
    return next();
  }

  try {
    const decoded = withObjectId(jwt.verify(token, process.env.JWT_SECRET || 'secret'));
    req.user = decoded;
    res.locals.user = decoded;
    next();
  } catch (error) {
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