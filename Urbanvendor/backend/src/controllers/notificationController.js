const Notification = require('../models/Notification');
const { emitToUser, emitToRole } = require('../socket/socketHandler');

// Placeholder for FCM (Firebase Cloud Messaging)
// You need to set up firebase-admin with your serviceAccountKey.json
const sendPushNotification = async (fcmToken, title, body, data) => {
    // Implementation depends on firebase-admin setup
    // const message = {
    //   notification: { title, body },
    //   data: data,
    //   token: fcmToken
    // };
    // await admin.messaging().send(message);
    console.log('FCM Push (Mock):', { title, body, fcmToken });
};

exports.createNotification = async (req, res) => {
    try {
        const { recipientId, recipientModel, title, message, type, data } = req.body;
        const senderId = req.user ? req.user.id : null; // Assuming auth middleware populates req.user

        // 1. Save to MongoDB
        const notification = new Notification({
            recipient: recipientId,
            recipientModel: recipientModel || 'User',
            sender: senderId,
            title,
            message,
            type,
            data
        });

        await notification.save();

        // 2. Emit Real-time via Socket.io
        const io = req.app.get('io');
        if (io) {
            // Emit to the specific user's room (userId)
            io.to(recipientId).emit('new_notification', notification);
            console.log(`Socket emitted to ${recipientId}`);
        }

        // 3. Send Push Notification (if user is offline or as standard behavior)
        // You would typically look up the user's FCM token from the User model here
        // const user = await User.findById(recipientId);
        // if (user && user.fcmToken) {
        //   await sendPushNotification(user.fcmToken, title, message, data);
        // }

        res.status(201).json({ success: true, data: notification });
    } catch (error) {
        console.error('Create Notification Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getUserNotifications = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : (req.admin ? req.admin.id : null);
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('sender', 'name email avatar'); // Adjust fields based on User model

        const total = await Notification.countDocuments({ recipient: userId });
        const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

        res.status(200).json({
            success: true,
            data: notifications,
            meta: {
                page,
                limit,
                total,
                unreadCount
            }
        });
    } catch (error) {
        console.error('Get Notifications Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user ? req.user.id : (req.admin ? req.admin.id : null);
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        // Mark single notification
        if (id && id !== 'all') {
            const notification = await Notification.findOneAndUpdate(
                { _id: id, recipient: userId },
                { isRead: true },
                { new: true }
            );

            if (!notification) {
                return res.status(404).json({ success: false, message: 'Notification not found' });
            }

            return res.status(200).json({ success: true, data: notification });
        }

        // Mark all as read
        if (id === 'all') {
            await Notification.updateMany(
                { recipient: userId, isRead: false },
                { isRead: true }
            );
            return res.status(200).json({ success: true, message: 'All marked as read' });
        }

    } catch (error) {
        console.error('Mark Read Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.sendBroadcast = async (req, res) => {
    try {
        const { role, title, message, type } = req.body;
        // role: 'user', 'vendor', 'admin', or 'all'

        // 1. Emit to Room
        const io = req.app.get('io');
        if (io) {
            if (role === 'all') {
                io.emit('new_notification', { title, message, type, isBroadcast: true });
            } else {
                io.to(role).emit('new_notification', { title, message, type, isBroadcast: true });
            }
        }

        // Note: For broadcasts, we might not want to save a Notification record for EVERY user 
        // individually unless necessary, as it could be millions of records.
        // Instead, you might have a 'Broadcast' model that clients also fetch.
        // For this example, we'll just emit.

        res.status(200).json({ success: true, message: `Broadcast sent to ${role}` });
    } catch (error) {
        console.error('Broadcast Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
