require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const morgan = require("morgan");
const mongoose = require("mongoose");
const stripeRoutes = require('./routes/stripe.route.js');

const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");
const paymentMethodRoutes = require("./routes/payment_method.route.js");
const userRoutes = require("./routes/user.route.js");
const authRoutes = require("./routes/auth.route.js");
const bannerRoutes = require("./routes/banner.route.js");
const ordersRoutes = require('./routes/order.route');



const {
  verifyToken,
  verifyAdmin,
} = require("./middlewares/auth.middleware.js");
const productsRoutes = require("./routes/product.route.js");
app.use(morgan("dev"));
app.use(cors());



app.use((req, res, next) => {
  if (req.originalUrl === '/api/stripe/webhook') {
    next();                            
  } else {
    express.json()(req, res, next); 
  }
});


mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1); 
  });



//stripe routes
app.use('/api/stripe', stripeRoutes);







// for testing
app.use((req, res, next) => {
  req.user = { id: "68337784a33bebac73b5f899" };
  next();
});



const cartRoutes = require('./routes/cart.route.js');
app.use("/", cartRoutes);


//routes
app.get("/", (req, res) => {
  res.send("Angular Node Backend");
});
//auh routs
app.use("/auth", authRoutes);
//auth middlewares
// app.use(verifyToken);
// app.use("/admin", verifyAdmin);
//payment methods routes
app.use("/payment-methods", paymentMethodRoutes);
//user routes
app.use("/", userRoutes);
//order routes
app.use('/api/orders', ordersRoutes);

//banner routes
app.use("/", bannerRoutes);
//products routes
app.use("/", productsRoutes);

app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: "failed",
    statusCode,
    message: err.message || "Something went wrong",
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
