const mongoose = require("mongoose");
const { Schema } = mongoose;

const UsersSchema = new Schema({
  password: { type: String, required: true, select: false },
  email: { type: String, required: true, unique: true, immutable: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: Number, required: true },
  image: { type: String },
  phoneNumber: { type: String, required: true },
  city: { type: String },
  street: { type: String },
  address: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  role: { type: String, default: "user" },
});

module.exports = mongoose.model("User", UsersSchema);
