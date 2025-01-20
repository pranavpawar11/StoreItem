const mongoose = require('mongoose');
const { Schema } = mongoose;

const StockHistorySchema = new Schema({
    productId: {
        type: Number,  // Use the same type as in the Product schema
        required: true
    },
    stockAdded: {
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
    addedAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const StockHistory = mongoose.model('StockHistory', StockHistorySchema);

module.exports = StockHistory;
