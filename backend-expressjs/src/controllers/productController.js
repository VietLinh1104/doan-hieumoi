const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

// @desc    Get all products (có phân trang & search)
// @route   GET /api/v1/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 12;
  const page = Number(req.query.page) || 1;
  const skip = (page - 1) * pageSize;

  let query = {};

  // Check if requester is staff or admin to show hidden products
  let isStaffOrAdmin = false;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const User = require('../models/userModel');
      const user = await User.findById(decoded.id);
      if (user && (user.role === 'admin' || user.role === 'staff')) {
        isStaffOrAdmin = true;
      }
    } catch (e) {
      // Treat as guest
    }
  }

  if (!isStaffOrAdmin) {
    query.is_hidden = { $ne: true };
  }

  if (req.query.keyword) {
    const kw = new RegExp(req.query.keyword, 'i');
    query.$or = [
      { name: kw },
      { part_number: kw }
    ];
  }

  if (req.query.category) {
    query.category_id = req.query.category;
  }

  const count = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('category_id', 'name')
    .sort({ created_at: -1 })
    .limit(pageSize)
    .skip(skip);

  res.json({
    success: true,
    data: {
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    }
  });
});

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category_id', 'name');

  if (!product) {
    res.status(404);
    throw new Error('Không tìm thấy phụ tùng/sản phẩm này');
  }

  res.json({
    success: true,
    data: product
  });
});

function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Tách dấu tiếng Việt
    .replace(/[\u0300-\u036f]/g, '') // Xóa các dấu
    .replace(/[đĐ]/g, 'd')
    .replace(/([^a-z0-9\s-]|_)+/g, '') // Loại bỏ ký tự đặc biệt
    .trim()
    .replace(/\s+/g, '-') // Đổi khoảng trắng thành gạch ngang
    .replace(/-+/g, '-'); // Tránh lặp lại dấu gạch ngang
}

// @desc    Create new product
// @route   POST /api/v1/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, price, category_id, ...rest } = req.body;
  if (!name || !price || !category_id) {
    res.status(400);
    throw new Error('Tên, Giá và Danh mục sản phẩm là bắt buộc');
  }

  const slug = req.body.slug || slugify(name);

  // Đồng bộ hai trường ảnh
  const img = req.body.image_url || req.body.main_image || '';
  const productData = { 
    name, 
    price, 
    category_id, 
    slug, 
    ...rest, 
    main_image: img, 
    image_url: img 
  };

  // Tạo sản phẩm mới kèm theo slug và ảnh
  const product = await Product.create(productData);
  const populatedProduct = await Product.findById(product._id).populate('category_id', 'name');

  res.status(201).json({
    success: true,
    data: populatedProduct
  });
});

// @desc    Update a product
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Không tìm thấy sản phẩm');
  }

  const bodyData = { ...req.body };
  if (bodyData.name && !bodyData.slug) {
    bodyData.slug = slugify(bodyData.name);
  }

  // Đồng bộ hai trường ảnh khi cập nhật
  if (bodyData.image_url !== undefined || bodyData.main_image !== undefined) {
    const img = bodyData.image_url || bodyData.main_image || '';
    bodyData.image_url = img;
    bodyData.main_image = img;
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    bodyData,
    { new: true, runValidators: true }
  ).populate('category_id', 'name');

  res.json({
    success: true,
    data: updatedProduct
  });
});

// @desc    Delete a product
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Không tìm thấy sản phẩm');
  }

  await product.deleteOne();

  res.json({
    success: true,
    message: 'Đã xoá sản phẩm',
    data: { id: req.params.id }
  });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
