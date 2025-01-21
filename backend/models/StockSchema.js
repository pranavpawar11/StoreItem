const mongoose = require('mongoose');
const { Schema } = mongoose;

const StockSchema = new Schema({
    productId: {
        type: Number,
        required: true,
        ref: 'Product'
    },
    stock: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Stock = mongoose.model('Stock', StockSchema);
module.exports = Stock;
