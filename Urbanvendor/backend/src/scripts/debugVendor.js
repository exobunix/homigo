const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const Vendor = require('../models/Vendor');
const Booking = require('../models/Booking');
const connectDB = require('../config/db');

async function debugVendor() {
    try {
        await connectDB();
        console.log('Connected to DB');

        const vendor = await Vendor.findOne({ name: 'Yogesh Thakur' });
        if (!vendor) {
            console.log('❌ Vendor Yogesh Thakur not found');
            return;
        }

        console.log(`🔎 Vendor Found: ${vendor.name} (${vendor._id})`);

        // Find ALL bookings for this vendor
        const bookings = await Booking.find({ vendor: vendor._id });
        console.log(`Found ${bookings.length} TOTAL bookings for this vendor.`);

        bookings.forEach(b => {
            console.log(` - ID: ${b._id} | Status: '${b.status}' | Amount: ${b.totalAmount} | Vendor: ${b.vendor}`);
        });

        const completed = bookings.filter(b => b.status === 'work_completed');
        console.log(`Note: ${completed.length} are 'work_completed'.`);

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

debugVendor();
