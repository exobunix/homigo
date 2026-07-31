const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'paid'],
        default: 'pending'
    },
    requestDate: {
        type: Date,
        default: Date.now
    },
    paymentDate: {
        type: Date
    },
    transactionId: {
        type: String
    },
    notes: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Payout', payoutSchema);
