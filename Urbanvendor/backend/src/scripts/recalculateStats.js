const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const Vendor = require('../models/Vendor');
const Booking = require('../models/Booking');
const Payout = require('../models/Payout');
const Admin = require('../models/Admin');
const connectDB = require('../config/db');

async function recalculateStats() {
    try {
        await connectDB();
        console.log('Connected to DB');

        const vendors = await Vendor.find({});
        console.log(`Found ${vendors.length} vendors`);

        let totalPlatformRevenue = 0;

        for (const vendor of vendors) {
            // Calculate Total Earnings & Jobs
            const bookings = await Booking.find({
                vendor: vendor._id,
                status: 'work_completed'
            });

            let totalGrossEarnings = 0;
            bookings.forEach(b => {
                totalGrossEarnings += (Number(b.totalAmount) || 0);
            });

            // Commission 20%
            const commission = totalGrossEarnings * 0.20;
            const netEarnings = totalGrossEarnings - commission;
            totalPlatformRevenue += commission;

            // Calculate Payouts
            const payouts = await Payout.find({
                vendor: vendor._id,
                status: { $in: ['pending', 'approved', 'paid'] }
            });

            let totalPayouts = 0;
            payouts.forEach(p => {
                totalPayouts += (Number(p.amount) || 0);
            });

            const walletBalance = netEarnings - totalPayouts;

            // Recalculate Today's Earnings (simple date match)
            let todayGross = 0;
            const today = new Date();
            const startOfDay = new Date(today.setHours(0, 0, 0, 0));
            bookings.forEach(b => {
                const completionDate = b.otpVerifiedAt || b.updatedAt;
                if (completionDate && new Date(completionDate) >= startOfDay) {
                    todayGross += (Number(b.totalAmount) || 0);
                }
            });
            const todayNet = todayGross * 0.80;

            // Update Vendor
            vendor.totalEarnings = totalGrossEarnings;
            vendor.walletBalance = walletBalance;
            vendor.totalJobs = bookings.length;
            vendor.todayEarnings = todayNet;

            await vendor.save();
            console.log(`✅ Updated ${vendor.name || vendor.phone}: Gross ₹${totalGrossEarnings} | Net ₹${netEarnings} | Balance ₹${walletBalance}`);
        }

        // Update Admin Revenue
        await Admin.updateMany({}, { $set: { totalRevenue: totalPlatformRevenue } });
        console.log(`💰 Admin Total Revenue Updated: ₹${totalPlatformRevenue}`);

        console.log('🎉 Recalculation Complete!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

recalculateStats();
