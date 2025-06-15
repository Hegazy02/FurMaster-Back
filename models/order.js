/*const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderItem',
    required: true
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paymentInfo: {
    stripeSessionId: {
      type: String,
      required: function() { return this.paymentMethod === 'card'; }
    },
    paymentIntentId: String,
    paymentMethod: {
      type: String,
      enum: ['card', 'cash_on_delivery', 'bank_transfer'],
      default: 'card'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    }
  },
  shippingAddress: {
    address1: {
      type: String,
      required: true
    },
    address2: String,
    city: {
      type: String,
      required: true
    },
    zip: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    }
  },
  contactInfo: {
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  dateOrdered: {
    type: Date,
    default: Date.now
  },
  deliveredAt: Date,
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

orderSchema.virtual('orderNumber').get(function() {
  return `ORD-${this._id.toString().substring(0, 8).toUpperCase()}`;
});

orderSchema.virtual('itemsCount').get(function() {
  return this.orderItems.length;
});

exports.Order = mongoose.model('Order', orderSchema);*/
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
   products: [
    {
      name: String,
      quantity: Number,
      unitPrice: Number,
      totalPrice: Number, 
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
