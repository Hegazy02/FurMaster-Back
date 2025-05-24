require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT || 3000;
const AppError = require("./utils/appError.js");
app.use(morgan("dev"));

app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1); // Exit process with failure code
  });

app.get("/", (req, res) => {
  res.send("Angular Node Backend");
});


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
