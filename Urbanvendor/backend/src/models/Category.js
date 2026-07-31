const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        default: ''
    },
    icon: {
        type: String,
        default: ''
    },
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    level: {
        type: String,
        enum: ['main', 'sub', 'child'],
        default: 'main'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    basePrice: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        default: 0
    },
    order: {
        type: Number,
        default: 0
    },
    duration: {
        type: Number,
        default: 0 // Duration in minutes
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

// Update timestamp on save
categorySchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Category', categorySchema);
