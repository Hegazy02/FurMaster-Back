/*
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  const { cartItems, userId, successUrl, cancelUrl } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: cartItems.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
          },
          unit_amount: item.unitPrice * 100, // بالدولار × 100
        },
        quantity: item.quantity,
      })),
      metadata: {
        products: JSON.stringify(cartItems),
      },
      client_reference_id: userId,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('❌ Stripe session error:', err.message);
    res.status(500).json({ message: 'Stripe session failed', error: err.message });
  }
};




*/