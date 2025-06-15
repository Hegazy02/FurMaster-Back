/*const mongoose =require("mongoose");

const cartSchema = new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId, ref:"users"},
        productId:{type:mongoose.Schema.Types.ObjectId, ref:"Product"},
        
  variantId: {
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
  },
quantity: {
  type: Number,
  required: true,
}

});
const cart =mongoose.model("cart",cartSchema);
module.exports=cart;*/
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      variantId: { type: mongoose.Schema.Types.ObjectId, required: true }, 
      quantity: { type: Number, required: true }
    }
  ]
});

module.exports = mongoose.model("Cart", cartSchema);

