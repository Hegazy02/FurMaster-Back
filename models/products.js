const mongoose = require("mongoose");
require("./color");

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  ratingCounter: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  price: Number,
  offerPrice: Number,
  createdAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
  colors: [
    {
      colorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Color",
        required: false,
      },
      stock: { type: Number, default: 0 },
      image: String,
    },
  ],
});

module.exports = mongoose.model("Product", productSchema);
