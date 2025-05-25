const mongoose = require("mongoose");
const paymentMethodSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    provider: String,
    methodId: String,
    brand: String,
    last4: String,
    expMonth: String,
    expYear: String,
    isDefault: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    collection: "paymentMethods",
  }
);

module.exports = mongoose.model("PaymentMethod", paymentMethodSchema);
