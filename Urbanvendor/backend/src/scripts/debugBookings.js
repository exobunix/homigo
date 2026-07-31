const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('../config/db');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Vendor = require('../models/Vendor');

const run = async () => {
    try {
        await connectDB();
        console.log('Connected to DB');

        const count = await Booking.countDocuments();
        console.log('Total Bookings:', count);

        const recentBookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('user', 'name email phone')
            .populate('vendor', 'businessName name phone');

        console.log('Recent Bookings Count:', recentBookings.length);
        if (recentBookings.length > 0) {
            console.log('Sample Booking:', JSON.stringify(recentBookings[0], null, 2));
        } else {
            console.log('No bookings found with find() query');
        }

    } catch (e) {
        console.error(e);
    }
    process.exit();
};

run();
