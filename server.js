require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT || 3000;
const paymentMethodRoutes = require("./routes/payment_method.route.js");
const userRoutes = require("./routes/user.route.js");
const authRoutes = require("./routes/auth.route.js");
const bannerRoutes = require("./routes/banner.route.js");
const {
  verifyToken,
  verifyAdmin,
} = require("./middlewares/auth.middleware.js");
const productsRoutes = require("./routes/product.route.js");
app.use(morgan("dev"));
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1); // Exit process with failure code
  });

//routes
app.get("/", (req, res) => {
  res.send("Angular Node Backend");
});
//auh routs
app.use("/auth", authRoutes);
//auth middlewares
app.use(verifyToken);
app.use("/admin", verifyAdmin);
//payment methods routes
app.use("/payment-methods", paymentMethodRoutes);
//user routes
app.use("/users", userRoutes);

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
