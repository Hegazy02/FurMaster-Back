const { getCart, addToCart, getCartItems, removeFromCart, clearCart } = require("../controllers/cart-controller");
const express = require('express');
const Product = require("../models/products");
const mongoose = require("mongoose");
const Cart = require("../models/cart");
const { verifyToken } = require("../middlewares/auth.middleware");

const router = express.Router();


router.get("/cart", async (req, res) => {
  console.log(req.user);
  const userId = req.user._id;
  const items = await getCartItems(userId);
  res.send(items);
});

router.post("/cart/:id", verifyToken, async (req, res) => {
try {
    const variantId = req.params._id;
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    await addToCart(userId, productId, variantId, quantity, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "failed", message: err.message });
  }
});

router.delete("/cart/:variantId", verifyToken, async (req, res) => {
  const userId = req.user._id;
  const variantId = req.params.variantId;

  try {
    const updatedCart = await removeFromCart(userId, variantId);
    res.send(updatedCart.items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/cart", verifyToken, async (req, res) => {
  const userId = req.user._id;

  try {
    const result = await clearCart(userId);
    res.status(200).json({ message: "Cart cleared", result });
  } catch (err) {
    console.error("Error clearing cart", err);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

module.exports = router;
