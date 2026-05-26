const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  cancelOrder
} = require('../controllers/orderController');
const { protect, admin, staffOrAdmin } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, createOrder)
  .get(protect, staffOrAdmin, getAllOrders);

router.route('/myorders')
  .get(protect, getMyOrders);

router.route('/:id')
  .get(protect, getOrderById)
  .delete(protect, admin, deleteOrder);

router.route('/:id/status')
  .put(protect, staffOrAdmin, updateOrderStatus);

router.route('/:id/cancel')
  .put(protect, cancelOrder);

module.exports = router;
