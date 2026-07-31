const mongoose = require('mongoose');

const countryCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    countryName: {
        type: String,
        required: true
    },
    flag: {
        type: String
    },
    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('CountryCode', countryCodeSchema);
