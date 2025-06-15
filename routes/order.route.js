
const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware'); 
//const isAdmin = require('../middleware/isAdmin');  



router.get('/', async (req, res) => {
  const { page = 1, limit = 10, status = '', sort = '-createdAt',
    minPrice,
    maxPrice,
    dateFrom,
    dateTo } = req.query;

  const query = {};

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


module.exports = router;
