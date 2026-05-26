const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');

// @desc    Get all orders
// @route   GET /api/v1/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('user_id', 'fullname email')
    .populate('orderItems.product_id', 'name main_image price')
    .sort({ created_at: -1 });

  res.json({
    success: true,
    data: orders
  });
});

// @desc    Get logged in user orders
// @route   GET /api/v1/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user_id: req.user._id })
    .populate('orderItems.product_id', 'name main_image price')
    .sort({ created_at: -1 });

  res.json({
    success: true,
    data: orders
  });
});

// @desc    Get order by ID
// @route   GET /api/v1/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user_id', 'fullname email')
    .populate('orderItems.product_id', 'name main_image');

  if (!order) {
    res.status(404);
    throw new Error('Không tìm thấy đơn hàng');
  }

  if (order.user_id._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Bạn không có quyền xem đơn hàng này');
  }

  res.json({
    success: true,
    data: order
  });
});

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('Không có sản phẩm nào trong đơn hàng');
  }

  try {
    // 1. Kiểm tra tồn kho của tất cả sản phẩm trước khi thực hiện giao dịch
    for (const item of orderItems) {
      const product = await Product.findById(item.product_id);
      if (!product || product.stock < item.qty) {
        res.status(400);
        throw new Error(`Sản phẩm '${product ? product.name : item.product_id}' hiện không đủ tồn kho (Còn lại: ${product ? product.stock : 0})`);
      }
    }

    // 2. Trừ tồn kho sản phẩm
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product_id, {
        $inc: { stock: -item.qty }
      });
    }

    // 3. Tạo đơn hàng mới
    const order = await Order.create({
      user_id: req.user._id,
      orderItems: orderItems.map(item => ({
        product_id: item.product_id,
        quantity: item.qty,
        price_at_purchase: item.price
      })),
      shipping_address: JSON.stringify(shippingAddress),
      payment_method: paymentMethod,
      total_price: totalPrice
    });

    res.status(201).json({
      success: true,
      data: { orderId: order._id }
    });
  } catch (error) {
    res.status(error.statusCode || 400);
    throw new Error('Đã xảy ra lỗi hệ thống khi xử lý checkout: ' + error.message);
  }
});

// @desc    Update order status
// @route   PUT /api/v1/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Không tìm thấy đơn hàng');
  }

  order.status = status;
  await order.save();

  res.json({
    success: true,
    data: order
  });
});

// @desc    Delete order
// @route   DELETE /api/v1/orders/:id
// @access  Private/Admin
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Không tìm thấy đơn hàng');
  }

  await order.deleteOne();

  res.json({
    success: true,
    message: 'Đã xoá đơn hàng',
    data: { id: req.params.id }
  });
});

// @desc    Cancel order (Customer cancels their own order)
// @route   PUT /api/v1/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Không tìm thấy đơn hàng');
  }

  if (order.user_id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Bạn không có quyền huỷ đơn hàng này');
  }

  if (order.status !== 'pending') {
    res.status(400);
    throw new Error('Chỉ có thể huỷ đơn hàng khi ở trạng thái Chờ xác nhận!');
  }

  // Restore stock
  const items = order.orderItems || [];
  for (const item of items) {
    if (item.product_id) {
      await Product.findByIdAndUpdate(item.product_id, {
        $inc: { stock: item.quantity }
      });
    }
  }

  order.status = 'cancelled';
  await order.save();

  res.json({
    success: true,
    message: 'Đã huỷ đơn hàng thành công',
    data: order
  });
});

module.exports = {
  getAllOrders,
  getMyOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  cancelOrder,
};
