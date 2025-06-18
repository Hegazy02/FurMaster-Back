const express = require("express");
const Stripe = require("stripe");
require("dotenv").config();
const bodyParser = require("body-parser");
const Order = require("../models/order.js");
const { handleWebhook } = require("../controllers/stripe.controller");

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", async (req, res) => {
  if (!req.body || !req.body.products) {
    return res.status(400).json({ error: "Products data is required" });
  }
  const { products } = req.body;
  const userId = req.user._id;

  const lineItems = products.map((product) => ({
    price_data: {
      currency: "egp",
      product_data: {
        name: product.name,
        images: product.image ? [product.image] : [],
      },
      unit_amount: product.price * 100,
    },
    quantity: product.quantity,
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      client_reference_id: req.body.userId,
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url:
        "http://localhost:4200/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:4200/cancel",

      metadata: {
        products: JSON.stringify(products),
      },
      client_reference_id: userId,
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);

module.exports = router;
