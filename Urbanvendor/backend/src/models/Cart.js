const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
    serviceId: { type: String, required: true },
    vendorId: { type: String, required: false }, // Made optional - vendor can be selected later
    title: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String },
    quantity: { type: Number, default: 1, min: 1 },
    addons: { type: Array, default: [] }
});

const CartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [CartItemSchema],
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cart', CartSchema);
