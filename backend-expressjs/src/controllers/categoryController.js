const asyncHandler = require('express-async-handler');
const Category = require('../models/categoryModel');

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ created_at: -1 });
  res.json({
    success: true,
    data: categories
  });
});

// @desc    Get single category
// @route   GET /api/v1/categories/:id
// @access  Public
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    res.status(404);
    throw new Error('Danh mục không tồn tại');
  }

  res.json({
    success: true,
    data: category
  });
});

// @desc    Create new category
// @route   POST /api/v1/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, image_url, description } = req.body;
  if (!name || !slug) {
    res.status(400);
    throw new Error('Tên và Slug danh mục là bắt buộc');
  }

  const category = await Category.create({ name, slug, image_url, description });
  res.status(201).json({
    success: true,
    data: category
  });
});

// @desc    Update category
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Danh mục không tồn tại');
  }

  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    data: updatedCategory
  });
});

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Danh mục không tồn tại');
  }

  await category.deleteOne();

  res.json({
    success: true,
    message: 'Đã xoá danh mục',
    data: { id: req.params.id }
  });
});

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
