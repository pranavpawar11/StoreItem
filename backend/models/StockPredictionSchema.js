const mongoose = require('mongoose');
const { Schema } = mongoose;

const StockPredictionSchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'StoreItem',
        required: true
    },
    predictedQuantity: {
        type: Number,
        required: true
    },
    forecastPeriod: {
        type: String,
        enum: ['1 month', '3 months', '6 months', '1 year'],
        required: true
    },
    predictionType: {
        type: String,
        enum: ['ML', 'Simple'],
        required: true
    },
    predictionModel: {
        type: String, // e.g., 'LinearRegression', 'RandomForest'
        default: ''
    },
    predictionDetails: {
        type: String, // Details about the prediction method
        default: ''
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

const StockPrediction = mongoose.model('StockPrediction', StockPredictionSchema);

module.exports = StockPrediction;
