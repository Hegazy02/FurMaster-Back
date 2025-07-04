const express = require("express");
const Stripe = require("stripe");
require("dotenv").config();
const { verifyToken } = require("../middlewares/auth.middleware");

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", verifyToken, async (req, res) => {
   if (!stripe) {
     return res.status(500).json({ error: "Stripe not configured" });
   }
  if (!req.body || !req.body.products) {
     return res.status(400).json({ error: "Products data is required" });
  }
   if (!req.user || !req.user._id) {
    return res.status(401).json({ error: "Authentication required" });
   }
   const { products } = req.body;
   try {
     console.log("user", req.user);
     const userId = req.user._id;
     const validProducts = products.filter(product =>
  product?.name &&
  typeof product.price === 'number' &&
  product.price > 0 &&
  typeof product.quantity === 'number' &&
  product.quantity > 0
);

    const lineItems = validProducts.map((product) => ({
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
     const session = await stripe.checkout.sessions.create({
     client_reference_id: userId,
       payment_method_types: ["card"],
       mode: "payment",
       line_items: lineItems,
success_url: "https://furmaster.netlify.app/success?session_id={CHECKOUT_SESSION_ID}",
cancel_url: "https://furmaster.netlify.app/cancel",
       metadata: {
         products: JSON.stringify(validProducts),
      },
     });
    res.json({ url: session.url });
   } catch (error) {
      console.error("Stripe error:", error);

     res.status(500).json({ error: error.message });
   }
});



module.exports = router;