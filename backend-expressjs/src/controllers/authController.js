const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token (Login)
// @route   POST /api/v1/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({ email });
  if (!user) {
    res.status(401);
    throw new Error('Email hoặc mật khẩu không chính xác!');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Email hoặc mật khẩu không chính xác!');
  }

  res.json({
    success: true,
    data: {
      id: user._id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    }
  });
});

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, password, phone, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('Email này đã được sử dụng!');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    fullname,
    email,
    password: hashedPassword,
    phone: phone || null,
    role: role || 'user'
  });

  res.status(201).json({
    success: true,
    data: {
      id: user._id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    }
  });
});

// @desc    Get user profile
// @route   GET /api/v1/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  
  if (!user) {
    res.status(404);
    throw new Error('Không tìm thấy người dùng');
  }
  
  res.json({
    success: true,
    data: user
  });
});

module.exports = {
  authUser,
  registerUser,
  getUserProfile,
};
