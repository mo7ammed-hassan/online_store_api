const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order');

router.route('/')
  .get(orderController.getAllOrders)
  .post(orderController.createOrder)

router.route('/:id')
  .get(orderController.getOrderById)
  .put(orderController.updateOrder)
  .delete(orderController.deleteOrder);

router.route('/orderByUserId/:userId')
  .get(orderController.getOrderByUserId)

module.exports = router;
