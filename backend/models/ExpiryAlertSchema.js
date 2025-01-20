const mongoose = require('mongoose');
const { Schema } = mongoose;

const ExpiryAlertSchema = new Schema({
    stockId: {
        type: Schema.Types.ObjectId,  // Referencing the Stock schema (ObjectId)
        ref: 'Stock',
        required: true
    },
    productId: {
        type: String,  // String type, matches the Stock schema's productId type
        ref: 'Product',
        required: true
    },
    alertLevel: {
        type: String,
        enum: ['green', 'yellow', 'red'],
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    alertGeneratedOn: {
        type: Date,
        required: true
    },
    notificationStatus: {
        type: String,
        enum: ['pending', 'acknowledged'],
        default: 'pending'
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

const ExpiryAlert = mongoose.model('ExpiryAlert', ExpiryAlertSchema);
module.exports = ExpiryAlert;
