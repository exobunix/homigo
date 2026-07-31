const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    type: { type: String, default: 'Home' }, // e.g., Home, Work, Current Location
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    state: String,
    pincode: { type: String, required: true },
    latitude: Number,
    longitude: Number,
    isDefault: { type: Boolean, default: false }
});

const UserSchema = new mongoose.Schema(
    {
        phone: { type: String, required: true, unique: true },
        name: { type: String },
        email: { type: String },
        profileImage: { type: String },
        savedAddresses: [AddressSchema],
        fcmToken: { type: String }, // For push notifications
        isVerified: { type: Boolean, default: false },
        isBlocked: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
