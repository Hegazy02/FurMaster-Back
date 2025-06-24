const express = require("express");
const router = express.Router();
const { verifyToken, isAdmin } = require("../middlewares/auth");

const {
  createOrder,
  getOrders,
  getOrder,
  deleteOrder,
  updateOrder,
  createPaymentIntent,
  confirmPayment,
  handleStripeWebhook,
  getAllOrders,
} = require("../controllers/order.controller");

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

router.post("/create-payment-intent", verifyToken, createPaymentIntent);

router.post("/confirm-payment", verifyToken, confirmPayment);

router.post("/orders", verifyToken, createOrder);

router.get("/orders", verifyToken, getOrders);

router.get("orders/:id", verifyToken, getOrder);

router.delete("orders/:id", verifyToken, isAdmin, deleteOrder);

router.patch("/admin/orders/:id", updateOrder);

router.get("/admin/orders", getAllOrders);

module.exports = router;
