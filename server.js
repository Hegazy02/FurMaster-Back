require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT || 3000;
const AppError = require("./utils/appError.js");
const paymentMethodRoutes = require("./routes/payment_method.route.js");
const userRoutes = require("./routes/user.route.js");
//this partion
const authRoutes=require("./routes/auth.route.js")
const bannerRoutes = require("./routes/banner.route.js");

app.use(morgan("dev"));
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1); // Exit process with failure code
  });

// for testing
app.use((req, res, next) => {
  req.user = { id: "68337784a33bebac73b5f899" , role: "admin"};
  next();
});
verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(
      new AppError("You are not authorized to access this route", 403)
    );
  }
  next();
};

//routes
app.get("/", (req, res) => {
  res.send("Angular Node Backend");
});

//payment methods routes
app.use("/payment-methods", paymentMethodRoutes);
//user routes
app.use("/users", userRoutes);
//auh routs 
app.use("/auth", authRoutes);

app.use("/admin", verifyAdmin);
//banner routes
app.use("/", bannerRoutes);

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
