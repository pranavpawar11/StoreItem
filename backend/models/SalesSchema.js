const mongoose = require('mongoose');
const { Schema } = mongoose;

const SalesSchema = new Schema({
    productId: {
        type: Number,  // Use the same type as in the Product schema
        required: true
    },
    quantitySold: {
        type: Number,
        required: true
    },
    salePrice: {
        type: Number,
        required: true
    },
    saleDate: {
        type: Date,
        required: true
    },
    buyerDetails: {
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
            default: ''
        },
        age: {
            type: Number,
            default: null
        }
    },
    totalSaleAmount: {
        type: Number,
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

const Sales = mongoose.model('Sales', SalesSchema);

module.exports = Sales;
