const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, admin, staffOrAdmin } = require('../middlewares/authMiddleware');

router.route('/')
  .get(getProducts)
  .post(protect, staffOrAdmin, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, staffOrAdmin, updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;
