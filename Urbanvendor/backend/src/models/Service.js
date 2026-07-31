const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    icon: { type: String },
    color: { type: String },
    basePrice: { type: Number },
    image: { type: String },
    description: { type: String },
    active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Service', ServiceSchema);
