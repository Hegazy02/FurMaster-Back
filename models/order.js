const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  sessionId: String,
  customerEmail: String,
  amountTotal: Number,
  currency: String,
  status: String, 
  cardLast4: String,
  cardBrand: String,
  isPaid: String,
  orderId:Number,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
   products: [
    {
      name: String,
      quantity: Number,
      unitPrice: Number,
      totalPrice: Number,    
       image:String,     

          productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    variantId: { type: mongoose.Schema.Types.ObjectId }, 


    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
