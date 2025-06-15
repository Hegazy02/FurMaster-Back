const { Order } = require('../models/order');
const { OrderItem } = require('../models/order-item');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async (req, res) => {
  try {
    const { totalPrice, currency, metadata = {} } = req.body;

    if (!totalPrice || isNaN(totalPrice)) {
      return res.status(400).json({ error: 'Invalid total price' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100), 
      currency: currency || 'usd',
      metadata: {
        userId: req.user.userId,
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, orderDetails } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not succeeded' });
    }

    const orderItemsIds = await Promise.all(
      orderDetails.orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItem({
          quantity: orderItem.quantity,
          product: orderItem.product,
          price: orderItem.price
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
      status: 'paid',
      totalPrice: orderDetails.totalPrice,
      user: req.user.userId,
      paymentId: paymentIntentId,
      paymentMethod: 'card'
    });

    order = await order.save();

    if (!order) {
      return res.status(400).send('The order cannot be created!');
    }

    res.status(201).json(order);
  } catch (err) {
    console.error('Confirm payment error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
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
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
      
      
      break;
      
    case 'payment_intent.payment_failed':
      const paymentFailedIntent = event.data.object;
      console.log(`Payment failed: ${paymentFailedIntent.last_payment_error?.message}`);
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

exports.createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, city, zip, country, phone, totalPrice, paymentMethod } = req.body;

    const orderItemsIds = await Promise.all(
      orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItem({
          quantity: orderItem.quantity,
          product: orderItem.product,
          price: orderItem.price
        });
        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
      })
    );

    const status = paymentMethod === 'cash_on_delivery' ? 'pending' : 'paid';

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
      paymentMethod
    });

    order = await order.save();

    if (!order) {
      return res.status(400).send('The order cannot be created!');
    }

    res.status(201).json(order);
  } catch (err) {
    console.error('Create order error:', err);
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
      .populate('user', 'name email')
      .populate({
        path: 'orderItems',
        populate: { path: 'product', select: 'name price' }
      })
      .sort('-dateOrdered');

    res.json(orders);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate({
        path: 'orderItems',
        populate: { path: 'product', select: 'name price description' }
      });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user._id.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    res.json(order);
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await OrderItem.deleteMany({ _id: { $in: order.orderItems } });

    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error('Delete order error:', err);
    res.status(500).json({ error: err.message });
  }
};