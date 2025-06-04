const { Order } = require('../models/order');
const express = require('express');
const router = express.Router();
const { OrderItem } = require('../models/order-item');
const { verifyToken, isAdmin } = require('../middlewares/auth');

const {
  createOrder,
  getOrders,
  getOrder,
  deleteOrder,
  updateOrderStatus,
  createPaymentIntent,
  confirmPayment,
  handleStripeWebhook
} = require('../controllers/order.Controller');

router.post('/webhook', express.raw({type: 'application/json'}), handleStripeWebhook);

router.post('/create-payment-intent', verifyToken, createPaymentIntent);

router.post('/confirm-payment', verifyToken, confirmPayment);

router.post('/', verifyToken, createOrder);

router.get('/', verifyToken, getOrders);

router.get('/:id', verifyToken, getOrder);

router.delete('/:id', verifyToken, isAdmin, deleteOrder);

router.put('/:id/status', verifyToken, isAdmin, updateOrderStatus);

module.exports = router;