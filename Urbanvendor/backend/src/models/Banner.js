const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: {
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
        required: true
    },
    link: {
        type: String,
        trim: true
    },
    linkType: {
        type: String,
        enum: ['service', 'category', 'vendor', 'external', 'none'],
        default: 'none'
    },
    linkId: {
        type: mongoose.Schema.Types.ObjectId
    },
    position: {
        type: String,
        enum: ['home_top', 'home_middle', 'home_bottom', 'category', 'service'],
        default: 'home_top'
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Banner', bannerSchema);
