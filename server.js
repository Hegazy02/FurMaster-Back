require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const app = express();
const port = process.env.PORT || 3000;

app.use(morgan("dev"));

app.use(express.json());
app.get("/", (req, res) => {
  res.send("Angular Node Backend");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
