const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select('_id fullname email role is_locked');
      
      if (!user) {
          res.status(401);
          throw new Error('Not authorized, user not found');
      }

      if (user.is_locked) {
          res.status(401);
          throw new Error('Tài khoản của bạn đã bị khóa!');
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error(error.message || 'Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Yêu cầu quyền Quản trị viên');
  }
};

const staffOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
    next();
  } else {
    res.status(403);
    throw new Error('Yêu cầu quyền Nhân viên hoặc Quản trị viên');
  }
};

module.exports = { protect, admin, staffOrAdmin };
