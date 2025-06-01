const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Banner", bannerSchema);
