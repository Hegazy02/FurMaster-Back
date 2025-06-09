const mongoose = require('mongoose');
require('./color');


const productSchema = new mongoose.Schema({
    title: { type: String },
    description: { type: String },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    ratingCounter: Number,
    rating: Number,
    price: Number,
    offerPrice: Number,
    createdAt: { type: Date, default: Date.now },
    colors: [
        {
            colorId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Color',   
                required: false
            },
            stock: { type: Number, default: 0 },
            image: String
        }
    ]
});

module.exports = mongoose.model('Product', productSchema);


