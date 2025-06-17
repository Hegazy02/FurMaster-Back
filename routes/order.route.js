
const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware'); 
//const isAdmin = require('../middleware/isAdmin');  



router.get('/orders', async (req, res) => {
  const { page = 1, limit = 10, status = '', sort = '-createdAt',
    minPrice,
    maxPrice,
    dateFrom,
    dateTo } = req.query;
 /*const query = {
    userId: req.user._id  
  };*/

  const query = {};
  //if (userId) query.userId = userId;
/*const userId = req.query.userId || req.body?.userId;
if (userId) {
  query.userId = userId;
}*/

  if (status) query.status = status;

  if (minPrice || maxPrice) {
    query.amountTotal = {};
    if (minPrice) query.amountTotal.$gte = Number(minPrice);
    if (maxPrice) query.amountTotal.$lte = Number(maxPrice);
  }

  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  try {
    const orders = await Order.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/orders/by-session/:sessionId', async (req, res) => {
  const sessionId = req.params.sessionId;
  const order = await Order.findOne({ sessionId });
  if (!order) return res.status(404).send('Order not found');
  res.json(order);
});

module.exports = router;
