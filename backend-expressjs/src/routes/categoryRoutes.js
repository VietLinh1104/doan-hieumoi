const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, admin, staffOrAdmin } = require('../middlewares/authMiddleware');

router.route('/')
  .get(getCategories)
  .post(protect, staffOrAdmin, createCategory);

router.route('/:id')
  .get(getCategoryById)
  .put(protect, staffOrAdmin, updateCategory)
  .delete(protect, admin, deleteCategory);

module.exports = router;
