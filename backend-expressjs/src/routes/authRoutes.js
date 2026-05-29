const express = require('express');
const router = express.Router();
const { 
  authUser, 
  registerUser, 
  getUserProfile,
  getAllUsers,
  createUser,
  toggleUserLock,
  getSetupStatus
} = require('../controllers/authController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/setup-status', getSetupStatus);
router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);

// Admin User Management Routes
router.route('/users')
  .get(protect, admin, getAllUsers)
  .post(protect, admin, createUser);

router.route('/users/:id/lock')
  .put(protect, admin, toggleUserLock);

module.exports = router;
