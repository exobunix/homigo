const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Routes
const authRoutes = require('./authRoutes');
const bookingRoutes = require('./bookingRoutes');
const userRoutes = require('./userRoutes');
const serviceRoutes = require('./serviceRoutes');
const vendorRoutes = require('./vendorRoutes');
const contentRoutes = require('./contentRoutes');
const settingsRoutes = require('./settingsRoutes');

router.use('/auth', authRoutes); // Vendor Auth
router.use('/user', userRoutes); // User Auth & Profile
router.use('/bookings', bookingRoutes);
router.use('/services', serviceRoutes); // Public Service Routes
router.use('/vendors', vendorRoutes); // Public Vendor Routes
router.use('/cart', require('./cartRoutes')); // Cart Routes
router.use('/admin', require('./adminRoutes')); // Admin Routes
router.use('/content', contentRoutes); // Content Management (Categories, Addons, etc.)
router.use('/settings', settingsRoutes); // Settings (Payment Gateways, etc.)

const notificationRoutes = require('./notificationRoutes');
router.use('/notifications', notificationRoutes);

router.use('/earnings', (req, res) => {
    res.json({ success: true, data: {}, message: 'Earnings stub' });
});

router.use('/location', (req, res) => {
    res.json({ success: true, data: [], message: 'Location stub' });
});

module.exports = router;
