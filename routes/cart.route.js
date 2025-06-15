const { getCart, addToCart, getCartItems, removeFromCart } = require("../controllers/cart-controller");
const express = require('express');
const Product = require("../models/products");  
const mongoose = require("mongoose");
const Cart =require("../models/cart");

const router = express.Router();


router.get("/cart", async (req, res) => {
    console.log(req.user);
    const userId = req.user.id;
    const items = await getCartItems(userId);
    res.send(items);
});

/*router.post("/cart/:id", async (req, res) => {

    console.log(req.user);
    const userId = req.user.id;

    const productId = req.params.id;
const quantity = Number(req.body.quantity);
if (isNaN(quantity)) {
  return res.status(400).json({ error: "Quantity must be a valid number" });
}


    const items = await addToCart(userId, productId, quantity);
    res.send(items);
});*/


/*
///اخر حاجة
router.post("/cart/:id", async (req, res) => {
  try {
    console.log(req.user);
    const userId = req.user.id;

    const variantId = req.params.id; // 👈 ده بقى الـ variantId
    const quantity = Number(req.body.quantity);

    if (isNaN(quantity)) {
      return res.status(400).json({ error: "Quantity must be a valid number" });
    }

 // ❗نجيب الـ productId اللي جواه الـ variant ده
const variantObjectId = new mongoose.Types.ObjectId(variantId);
const product = await Product.findOne({ "colors._id": variantObjectId });

    if (!product) {
      return res.status(404).json({ error: "Product with this variant not found" });
    }

    const productId = product._id;

    // ✅ ابعت التلات حاجات المطلوبة: userId, productId, variantId, quantity
    const items = await addToCart(userId, productId, variantId, quantity);
    res.send(items);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong", details: err.message });
  }
});*/



router.post("/cart/:id", async (req, res) => {
  try {
    console.log(req.user);
    const userId = req.user.id; // تأكد إنك حاطط middleware للمصادقة

    const variantId = req.params.id; // 👈 ده هو color._id
    const { productId, quantity } = req.body;

    if (!productId || isNaN(quantity)) {
      return res.status(400).json({ error: "Missing or invalid data" });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [{ productId, variantId, quantity }]
      });
    } else {
      const existingItem = cart.items.find(
        (item) =>
          item.productId.toString() === productId &&
          item.variantId.toString() === variantId
      );

      if (existingItem) {
  existingItem.quantity = quantity; // 👈 استبدلي += ب =
      } else {
        cart.items.push({ productId, variantId, quantity });
      }
    }

    await cart.save();
    res.status(200).json({ status: "success", cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "failed", message: err.message });
  }
});





router.delete("/cart/:variantId", async (req, res) => {
  const userId = req.user.id;
  const variantId = req.params.variantId;

  try {
    const updatedCart = await removeFromCart(userId, variantId);
    res.send(updatedCart.items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


////لسه متجربش
router.delete("/cart", async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await clearCart(userId);
    res.status(200).json({ message: "Cart cleared", result });
  } catch (err) {
    console.error("Error clearing cart", err);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});


module.exports = router;