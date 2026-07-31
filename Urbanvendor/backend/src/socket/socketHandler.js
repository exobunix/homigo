const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming you have a User model
// Import other models if needed: Vendor, Admin

// Store active user sockets: userId -> [socketId1, socketId2]
const userSockets = new Map();

const socketHandler = (io) => {
    // Middleware for authentication (optional but recommended)
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization;

            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }

            // Remove 'Bearer ' if present
            const tokenString = token.startsWith('Bearer ') ? token.slice(7) : token;

            const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
            socket.user = decoded; // { id, role, ... }
            next();
        } catch (err) {
            console.error('Socket Auth Error:', err.message);
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Client connected: ${socket.id}, User: ${socket.user?.id} (${socket.user?.role})`);

        // 1. Join User's Private Room
        if (socket.user && socket.user.id) {
            const userId = socket.user.id;
            socket.join(userId);

            // Track socket IDs for this user
            if (!userSockets.has(userId)) {
                userSockets.set(userId, new Set());
            }
            userSockets.get(userId).add(socket.id);

            console.log(`👤 User ${userId} joined private room`);
        }

        // 2. Join Role-based Rooms (admin, vendor, user)
        if (socket.user && socket.user.role) {
            const roleRoom = socket.user.role; // e.g., 'admin', 'vendor', 'user'
            socket.join(roleRoom);
            console.log(`👥 User joined group: ${roleRoom}`);
        }

        // 3. Handle custom room joins
        socket.on('join_room', (roomName) => {
            socket.join(roomName);
            console.log(`🚪 User ${socket.user?.id} joined room: ${roomName}`);
        });

        // 4. Handle Disconnect
        socket.on('disconnect', () => {
            console.log(`❌ Client disconnected: ${socket.id}`);
            if (socket.user && socket.user.id) {
                const userId = socket.user.id;
                if (userSockets.has(userId)) {
                    userSockets.get(userId).delete(socket.id);
                    if (userSockets.get(userId).size === 0) {
                        userSockets.delete(userId);
                    }
                }
            }
        });

        // 5. Custom Events (Example: Client sends a message)
        socket.on('send_message', (data) => {
            // Handle incoming messages if needed
            console.log('Message received:', data);
        });
    });
};

// Helper function to emit to a specific user
const emitToUser = (io, userId, event, data) => {
    io.to(userId).emit(event, data);
};

// Helper function to emit to a role group
const emitToRole = (io, role, event, data) => {
    io.to(role).emit(event, data);
};

module.exports = { socketHandler, emitToUser, emitToRole };
