const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        trim: true
    },
    profileImage: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['super_admin', 'admin', 'support'],
        default: 'admin'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    totalRevenue: {
        type: Number,
        default: 0
    }
});

// Method to check password
adminSchema.methods.checkPassword = async function (password) {
    return await bcrypt.compare(password, this.passwordHash);
};

// Method to set password
adminSchema.methods.setPassword = async function (password) {
    this.passwordHash = await bcrypt.hash(password, 10);
};

module.exports = mongoose.model('Admin', adminSchema);
