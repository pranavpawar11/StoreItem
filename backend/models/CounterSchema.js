const mongoose = require('mongoose');
const { Schema } = mongoose;

// Counter Schema for auto-increment
const CounterSchema = new Schema({
    name: { type: String, required: true, unique: true },
    seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', CounterSchema);

module.exports = Counter;