const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const protect = require('../middleware/auth'); // Default export
const { protectAdmin } = require('../middleware/adminAuth'); // Named export

// Get user's notifications
router.get('/', protect, notificationController.getUserNotifications);

// Mark notification as read (or all)
router.put('/:id/read', protect, notificationController.markAsRead);

// Create a notification (Internal or Admin use)
router.post('/', protect, notificationController.createNotification);

// Admin Routes
router.get('/admin', protectAdmin, notificationController.getUserNotifications);
router.put('/admin/:id/read', protectAdmin, notificationController.markAsRead);

// Send Broadcast (Admin only)
router.post('/broadcast', protectAdmin, notificationController.sendBroadcast);

module.exports = router;
