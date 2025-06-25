const Order = require("../models/order");
const { OrderItem } = require("../models/order-item");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Product = require("../models/products.js");
const AppError = require("../utils/appError");

exports.createPaymentIntent = async (req, res) => {
  try {
    const { totalPrice, currency, metadata = {} } = req.body;

    if (!totalPrice || isNaN(totalPrice)) {
      return res.status(400).json({ error: "Invalid total price" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100),
      currency: currency || "usd",
      metadata: {
        userId: req.user.userId,
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, orderDetails } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: "Payment intent ID is required" });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ error: "Payment not succeeded" });
    }

    const orderItemsIds = await Promise.all(
      orderDetails.orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItem({
          quantity: orderItem.quantity,
          product: orderItem.product,
          price: orderItem.price,
        });
        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
      })
    );

    let order = new Order({
      orderItems: orderItemsIds,
      shippingAddress: orderDetails.shippingAddress,
      city: orderDetails.city,
      zip: orderDetails.zip,
      country: orderDetails.country,
      phone: orderDetails.phone,
      status: "paid",
      totalPrice: orderDetails.totalPrice,
      user: req.user.userId,
      paymentId: paymentIntentId,
      paymentMethod: "card",
    });

    order = await order.save();

    if (!order) {
      return res.status(400).send("The order cannot be created!");
    }

    res.status(201).json(order);
  } catch (err) {
    console.error("Confirm payment error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);

      break;

    case "payment_intent.payment_failed":
      const paymentFailedIntent = event.data.object;
      console.log(
        `Payment failed: ${paymentFailedIntent.last_payment_error?.message}`
      );
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

exports.createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      city,
      zip,
      country,
      phone,
      totalPrice,
      paymentMethod,
    } = req.body;

    const orderItemsIds = await Promise.all(
      orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItem({
          quantity: orderItem.quantity,
          product: orderItem.product,
          price: orderItem.price,
        });
        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
      })
    );

    const status = paymentMethod === "cash_on_delivery" ? "pending" : "paid";

    let order = new Order({
      orderItems: orderItemsIds,
      shippingAddress,
      city,
      zip,
      country,
      phone,
      status,
      totalPrice,
      user: req.user.userId,
      paymentMethod,
    });

    order = await order.save();

    if (!order) {
      return res.status(400).send("The order cannot be created!");
    }

    res.status(201).json(order);
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    let filter = {};

    if (!req.user.isAdmin) {
      filter = { user: req.user.userId };
    }

    const orders = await Order.find(filter)
      .populate("user", "name email")
      .populate({
        path: "orderItems",
        populate: { path: "product", select: "name price" },
      })
      .sort("-dateOrdered");

    res.json(orders);
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate({
        path: "orderItems",
        populate: { path: "product", select: "name price description" },
      });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user._id.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    res.json(order);
  } catch (err) {
    console.error("Get order error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, number, sort = "desc" } = req.query;
    const total = await Order.countDocuments();
    const filter = {};
    if (number) {
      filter.number = number;
    }
    console.log("filter", filter);

    const orders = await Order.find(filter)
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: sort === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const transformedOrders = orders.map((order, index) => ({
      _id: order._id.toString(),
      number: index + 1,
      customer: order.userId
        ? `${order.userId.firstName} ${order.userId.lastName}`
        : "Unknown Customer",
      amountTotal: order.amountTotal,
      status: order.status,
      paid: order.isPaid === "paid",
      createdAt: order.createdAt,
    }));
    res.status(200).json({
      page: Number(page),
      total,
      totalPages: Math.ceil(total / limit),
      success: true,
      message: "Orders fetched successfully",
      data: transformedOrders,
    });
  } catch (err) {
    console.error("Get all orders error:", err);
    next(err);
  }
};

/// Old Status → New Status	isPaid Value	Action

/// pending → processing and	not Decreased	✅ Decrease quantity (if not yet decreased)
/// pending → processing and	Decreased	❌ Do not decrease quantity
/// pending → completed and	not Decreased	✅ Decrease quantity (if not yet decreased)
/// pending → completed and	Decreased	❌ Do not decrease quantity
/// processing → completed and	any	❌ No change to quantity
/// Any → cancelled and	any	✅ Increase quantity only if it was decreased before

exports.updateOrder = async (req, res, next) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order) throw new AppError("Order not found", 404);

    const oldStatus = order.status;
    const alreadyAdjusted = order.hasStockBeenAdjusted ?? false;

    // Handle status change logic
    const isPendingToProcessing =
      oldStatus === "pending" && status === "processing";
    const isPendingToCompleted =
      oldStatus === "pending" && status === "completed";

    // Decrease stock only if not already adjusted
    if ((isPendingToProcessing || isPendingToCompleted) && !alreadyAdjusted) {
      await decreaseProductQuantities(order.products);
      order.hasStockBeenAdjusted = true;
    }

    // Cancelled: Return quantities if previously decreased
    if (status === "cancelled" && alreadyAdjusted) {
      await increaseProductQuantities(order.products);
      order.hasStockBeenAdjusted = false;
    }

    // Just update status
    order.status = status;
    await order.save();

    res.status(200).json({ message: "Order status updated successfully" });
  } catch (error) {
    next(error);
  }
};
const decreaseProductQuantities = async (products) => {
  const operations = products.map((item) => ({
    updateOne: {
      filter: { _id: item.productId },
      update: { $inc: { "colors.$[elem].stock": -item.quantity } },
      arrayFilters: [{ "elem._id": item.variantId }],
    },
  }));

  await Product.bulkWrite(operations);
};

const increaseProductQuantities = async (products) => {
  const operations = products.map((item) => ({
    updateOne: {
      filter: { _id: item.productId },
      update: { $inc: { "colors.$[elem].stock": item.quantity } },
      arrayFilters: [{ "elem._id": item.variantId }],
    },
  }));

  await Product.bulkWrite(operations);
};
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await OrderItem.deleteMany({ _id: { $in: order.orderItems } });

    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Delete order error:", err);
    res.status(500).json({ error: err.message });
  }
};
