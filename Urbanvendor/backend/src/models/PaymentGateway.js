const mongoose = require('mongoose');

const paymentGatewaySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: ['Stripe', 'Razorpay', 'PayPal']
    },
    publicKey: {
        type: String,
        required: true
    },
    secretKey: {
        type: String,
        required: true
    },
    mode: {
        type: String,
        enum: ['sandbox', 'live'],
        default: 'sandbox'
    },
    isActive: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('PaymentGateway', paymentGatewaySchema);
