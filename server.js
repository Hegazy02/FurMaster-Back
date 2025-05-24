require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT || 3000;

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
