const Stripe = require('stripe');
const Order = require('../models/order');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Cart = require('../models/cart');

exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('✅ Session completed:', session);

    const products = JSON.parse(session.metadata?.products || '[]');
      console.log('📦 Products from metadata:', products);


    try {
const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent, {
  expand: ['charges'],
});
const charge = paymentIntent?.charges?.data?.[0] || {};

      //const charge = paymentIntent.charges.data[0];

      await Order.create({
        sessionId: session.id,
        customerEmail: session.customer_email,
        amountTotal: session.amount_total / 100,
        currency: session.currency,
      status:'pending',
        isPaid: session.payment_status,
          userId: session.client_reference_id, 
        cardLast4: charge?.payment_method_details?.card?.last4 || '',
        cardBrand: charge?.payment_method_details?.card?.brand || '',

       

products: products.map(p => {
  const unitPrice = Number(p.price); 
  const quantity = Number(p.quantity);

  return {
    name: p.name,
    quantity,
    totalPrice: unitPrice * quantity,
          productId: p.productId,      
      variantId: p.variantId, 
      image:p.image,     
  };
}),

       
      });
      const cart = await Cart.find({ userId: session.client_reference_id });
console.log('🧾 User cart before deletion:', cart);

await Cart.deleteMany({ userId: session.client_reference_id });
    } catch (error) {
      console.error('❌ Error saving order:', error.message);
    }
  }

  res.status(200).send('Received');
};
