const Order = require('../models/order');
const HttpStatusText = require('../utils/httpStatusText');
const AppError = require('../utils/appError');
const asyncWrapper = require('../middleWare/asyncWrapper');


const getAllOrders = asyncWrapper(
  async (req, res, next) => {
    const orders = await Order.find()
      .populate('couponCode', 'id couponCode discountType discountAmount')
      .populate('userID', 'id name').sort({ _id: -1 });

    if (!orders) {
      const error = AppError.create('No orders found', 404, HttpStatusText.FAIL);
      return next(error);
    }
    return res.json({ success: true, message: 'Orders retrieved successfully.', data: orders });
  }
);


const getOrderById = asyncWrapper(
  async (req, res, next) => {
    const orderID = req.params.id;
    const order = await Order.findById(orderID)
      .populate('couponCode', 'id couponCode discountType discountAmount')
      .populate('userID', 'id name');

    if (!order) {
      const error = AppError.create('No order found', 404, HttpStatusText.FAIL);
      return next(error);
    }
    return res.json({ success: true, message: 'Order retrieved successfully.', data: order });
  }
);

const getOrderByUserId = asyncWrapper(
  async (req, res, next) => {
    const userID = req.params.id;
    const orders = await Order.find({ userID })
      .populate('couponCode', 'id couponCode discountType discountAmount')
      .populate('userID', 'id name').sort({ _id: -1 });

    if (!orders) {
      const error = AppError.create('No orders found for this user', 404, HttpStatusText.FAIL);
      return next(error);
    }
    return res.json({ success: true, message: 'Orders retrieved successfully.', data: orders });

  }
);

const createOrder = asyncWrapper(
  async (req, res, next) => {
    const { userID, orderStatus, items, totalPrice, shippingAddress, paymentMethod, couponCode, orderTotal, trackingUrl } = req.body;

    if (!userID || !items || !totalPrice || !shippingAddress || !paymentMethod || !orderTotal) {
      return res.status(400).json({ success: false, message: "User ID, items, totalPrice, shippingAddress, paymentMethod, and orderTotal are required." });
    }
    const newOrder = new Order({ userID, orderStatus, items, totalPrice, shippingAddress, paymentMethod, couponCode, orderTotal, trackingUrl });
    await newOrder.save();

    return res.status(201).json({ success: true, message: 'Order created successfully.', data: newOrder });
  }
);


const updateOrder = asyncWrapper(
  async (req, res, next) => {
    const orderID = req.params.id;
    const { orderStatus, trackingUrl } = req.body;
    if (!orderStatus) {
      const error = AppError.create('Order status is required', 400, HttpStatusText.FAIL);
      return next(error);
    }

    const updatedOrder = await Order.findByIdAndUpdate(orderID, { orderStatus, trackingUrl }, { new: true });

    if (!updatedOrder) {
      const error = AppError.create('No order found', 404, HttpStatusText.FAIL);
      return next(error);
    }
    return res.json({ success: true, message: 'Order updated successfully.', data: updatedOrder });
  }
);


const deleteOrder = asyncWrapper(
  async (req, res, next) => {
    const orderID = req.params.id;
    const order = await Order.findByIdAndDelete(orderID);

    if (!order) {
      const error = AppError.create('No order found', 404, HttpStatusText.FAIL);
      return next(error);
    }
    return res.json({ success: true, message: 'Order deleted successfully.' });
  }
);

module.exports = {
  getAllOrders,
  getOrderById,
  getOrderByUserId,
  createOrder,
  updateOrder,
  deleteOrder,
}