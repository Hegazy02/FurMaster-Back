const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const { verifyToken, verifyAdmin } = require("../middlewares/auth.middleware");
//const isAdmin = require('../middleware/isAdmin');

router.get("/orders", verifyToken, async (req, res) => {
    const { page = 1, limit = 10, status = '', sort = '-createdAt',
    
    } = req.query;
 const query = {
    userId: req.user._id  
  };

  if (status) query.status = status;

  
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


router.get("/orders/by-session/:sessionId", verifyToken, async (req, res) => {
  const sessionId = req.params.sessionId;
  const order = await Order.findOne({ sessionId });
  if (!order) return res.status(404).send("Order not found");
  res.json(order);
});

module.exports = router;
