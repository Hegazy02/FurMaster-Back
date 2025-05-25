const mongoose = require("mongoose");
const { Schema } = mongoose;

const UsersSchema = new Schema({
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: Number, required: true },
  image: { type: String },
  phonenumber: { type: String, required: true },
  city: { type: String, required: true },
  street: { type: String, required: true },
  address: { type: String, required: true },
});

module.exports = mongoose.model("User", UsersSchema);
