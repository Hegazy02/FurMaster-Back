const Stripe = require("stripe");
const Order = require("../models/order");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Cart = require("../models/cart");
//const sendEmail = require('../utils/sendEmail');
const Counter = require("../models/counter.js");
const Product = require("../models/products.js");

async function getNextOrderNumber() {
  const counter = await Counter.findOneAndUpdate(
    { name: "order" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return counter.value;
}

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

exports.handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("✅ Session completed:", session);

    console.log("📌 Metadata:", session.metadata);
    console.log("👤 client_reference_id:", session.client_reference_id);

    const products = JSON.parse(session.metadata?.products || "[]");
    console.log("📦 Products from metadata:", products);

    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        session.payment_intent,
        {
          expand: ["charges"],
        }
      );
      const charge = paymentIntent?.charges?.data?.[0] || {};

      //const charge = paymentIntent.charges.data[0];
      const orderNumber = await getNextOrderNumber();
      await Order.create({
        orderId: orderNumber,
        sessionId: session.id,
        customerEmail: session.customer_email,
        amountTotal: session.amount_total / 100,
        currency: session.currency,
        status: "pending",
        isPaid: session.payment_status,
        userId: session.client_reference_id,
        cardLast4: charge?.payment_method_details?.card?.last4 || "",
        cardBrand: charge?.payment_method_details?.card?.brand || "",
        hasStockBeenAdjusted: true,

        products: products.map((p) => {
          const unitPrice = Number(p.price);
          const quantity = Number(p.quantity);

          return {
            name: p.name,
            quantity,
            totalPrice: unitPrice * quantity,
            productId: p.productId,
            variantId: p.variantId,
            image: p.image,
          };
        }),
      });
      await decreaseProductQuantities(products);

      /*///send email
await sendEmail({
  to: session.customer_email,
  subject: 'Order Confirmation - FurMaster',
  text: 'Thanks for your order! We are preparing it now.',
  html: `
    <h2>Thank you for shopping with us 🛍️</h2>
    <p>We've received your order and it's being processed.</p>
    <p><strong>Total:</strong> $${(session.amount_total / 100).toFixed(2)}</p>
  `,
});*/

      const cart = await Cart.find({ userId: session.client_reference_id });
      console.log("🧾 User cart before deletion:", cart);

      await Cart.deleteMany({ userId: session.client_reference_id });
    } catch (error) {
      console.error("❌ Full error:", error);
    }
  }

  res.status(200).send("Received");
};
