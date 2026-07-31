const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    days: [{
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    maxBookings: {
        type: Number,
        default: 10
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('TimeSlot', timeSlotSchema);
