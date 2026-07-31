const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import Model - adjusting path since we are in backend/ root
const Booking = require('./src/models/Booking');

const MONGODB_URI = process.env.MONGODB_URI;
const TARGET_VENDOR_ID = '691c350ac6e326a631619c4d'; // The ID of the logged-in vendor (Yogesh Sengar)

async function fixBookings() {
    try {
        console.log('Connecting to MongoDB...');
        console.log('URI:', MONGODB_URI);

        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is missing from .env');
        }

        await mongoose.connect(MONGODB_URI);
        console.log('Connected successfully.');

        console.log(`Updating all bookings to vendor ID: ${TARGET_VENDOR_ID}`);

        // Update all bookings to belong to this vendor
        // We are updating ALL bookings here to ensure they show up. 
        // In a real prod env, we would be more selective, but for this dev fix it's appropriate.
        const result = await Booking.updateMany(
            {},
            { $set: { vendor: TARGET_VENDOR_ID } }
        );

        console.log('Update Result:', result);
        console.log(`Successfully updated ${result.modifiedCount} bookings.`);

        const count = await Booking.countDocuments({ vendor: TARGET_VENDOR_ID });
        console.log(`Total bookings for vendor ${TARGET_VENDOR_ID}: ${count}`);

    } catch (error) {
        console.error('Error executing fix script:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

fixBookings();
