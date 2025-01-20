const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProductSchema = new Schema({
    productId: {
        type: Number,  // Use auto-increment for product ID
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    category: {
        type: String,
        required: true
    },
    subCategory: {
        type: String
    },
    unitOfMeasure: {
        type: String,
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

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
