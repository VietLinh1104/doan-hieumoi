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

  if (user.is_locked) {
    res.status(401);
    throw new Error('Tài khoản của bạn đã bị khóa!');
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

// @desc    Get all users (Admin only)
// @route   GET /api/v1/auth/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort({ created_at: -1 });
  res.json({
    success: true,
    data: users
  });
});

// @desc    Admin create a user/staff account
// @route   POST /api/v1/auth/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
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
      is_locked: user.is_locked
    }
  });
});

// @desc    Toggle lock/unlock user
// @route   PUT /api/v1/auth/users/:id/lock
// @access  Private/Admin
const toggleUserLock = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('Không tìm thấy người dùng');
  }

  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('Bạn không thể tự khóa tài khoản của chính mình!');
  }

  user.is_locked = !user.is_locked;
  await user.save();

  res.json({
    success: true,
    message: `${user.is_locked ? 'Đã khóa' : 'Đã mở khóa'} tài khoản ${user.fullname}`,
    data: {
      id: user._id,
      is_locked: user.is_locked
    }
  });
});

module.exports = {
  authUser,
  registerUser,
  getUserProfile,
  getAllUsers,
  createUser,
  toggleUserLock,
};
