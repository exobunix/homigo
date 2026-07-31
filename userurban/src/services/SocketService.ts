import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';
import { Audio } from 'expo-av';

type NotificationHandler = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => void;

class SocketService {
    private socket: Socket | null = null;
    private isConnected = false;
    private sound: Audio.Sound | null = null;
    private onNotification: NotificationHandler | null = null;

    initialize() {
        console.log('SocketService initialized');
    }

    setNotificationHandler(handler: NotificationHandler) {
        this.onNotification = handler;
    }

    async playSound() {
        try {
            if (this.sound) {
                await this.sound.unloadAsync();
            }
            // Use a default sound or ensure the file exists
            const { sound } = await Audio.Sound.createAsync(
                require('../../assets/sounds/notification.mp3'),
                { shouldPlay: true }
            );
            this.sound = sound;
        } catch (error) {
            console.log('Error playing sound:', error);
        }
    }

    connect(userId: string, token: string) {
        if (this.socket) {
            this.disconnect();
        }

        console.log('🔌 User SocketService: Connecting...', { userId, hasToken: !!token });

        // Socket server URL
        // Socket server URL
        let socketUrl = Platform.OS === 'web'
            ? (__DEV__ ? 'http://localhost:3000' : 'https://urbanproxbackend.onrender.com')
            : 'http://192.168.1.38:3000';

        // Use environment variable if available (Production/Vercel)
        if (Platform.OS === 'web' && typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
            socketUrl = process.env.EXPO_PUBLIC_API_URL;
        }

        // Remove /api suffix if present for socket connection
        if (socketUrl.endsWith('/api')) {
            socketUrl = socketUrl.slice(0, -4);
        }

        console.log('🔌 Socket URL:', socketUrl);

        this.socket = io(socketUrl, {
            auth: {
                token,
                userId,
            },
            transports: ['websocket'],
        });

        this.setupEventListeners(userId);
    }

    private setupEventListeners(userId: string) {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('✅ User Socket connected! Joining room: user_' + userId);
            this.isConnected = true;
            // Join user-specific room
            this.socket?.emit('join_room', `user_${userId}`);
            // Join global users room for admin announcements
            this.socket?.emit('join_room', 'users');
        });

        this.socket.on('connect_error', (error) => {
            console.log('❌ User Socket connect error:', error.message);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('🔌 User Socket disconnected:', reason);
            this.isConnected = false;
        });

        // Booking events
        this.socket.on('booking_accepted', (data: any) => {
            console.log('✅ Booking accepted:', data);
            this.playSound();
            if (this.onNotification) {
                this.onNotification('Booking Accepted', `Your booking for ${data.serviceName || 'service'} has been accepted!`, 'success');
            }
            // 🔔 Simple Web Browser Notification with Sound
            if (Platform.OS === 'web') {
                try {
                    const audio = new (window as any).Audio('/notification.mp3');
                    audio.volume = 1.0;
                    audio.play().catch(() => { });
                } catch (e) { }

                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Vendor Found! 🎉', {
                        body: `${data.vendorName || 'A vendor'} has accepted your booking!`,
                        icon: '/assets/icon.png',
                        requireInteraction: true
                    });
                }
            }
        });

        this.socket.on('booking_rejected', (data: any) => {
            console.log('❌ Booking rejected:', data);
            this.playSound();
            if (this.onNotification) {
                this.onNotification('Booking Rejected', `Your booking for ${data.serviceName || 'service'} was rejected.`, 'error');
            }
            // 🔔 Simple Web Browser Notification with Sound
            if (Platform.OS === 'web') {
                try {
                    const audio = new (window as any).Audio('/notification.mp3');
                    audio.volume = 1.0;
                    audio.play().catch(() => { });
                } catch (e) { }

                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Looking for another vendor...', {
                        body: `We're finding someone else for ${data.serviceName || 'your service'}`,
                        icon: '/assets/icon.png'
                    });
                }
            }
        });

        this.socket.on('booking_completed', (data: any) => {
            console.log('✅ Booking completed:', data);
            this.playSound();
            if (this.onNotification) {
                this.onNotification('Booking Completed', `Your service ${data.serviceName || ''} has been completed.`, 'success');
            }
            // 🔔 Simple Web Browser Notification with Sound
            if (Platform.OS === 'web') {
                try {
                    const audio = new (window as any).Audio('/notification.mp3');
                    audio.volume = 1.0;
                    audio.play().catch(() => { });
                } catch (e) { }

                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Service Completed! 🌟', {
                        body: `Your service ${data.serviceName || ''} has been completed successfully.`,
                        icon: '/assets/icon.png',
                        requireInteraction: true
                    });
                }
            }
        });

        // 🔔 When vendor rejects and system is looking for next vendor
        this.socket.on('vendor_approval_needed', (data: any) => {
            console.log('🔄 Looking for next vendor:', data);
            this.playSound();
            if (this.onNotification) {
                this.onNotification('Looking for Vendor', data.message || 'Finding another vendor for you...', 'info');
            }
            if (Platform.OS === 'web') {
                try {
                    const audio = new (window as any).Audio('/notification.mp3');
                    audio.volume = 1.0;
                    audio.play().catch(() => { });
                } catch (e) { }
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Finding Another Vendor 🔍', {
                        body: data.message || 'Previous vendor unavailable. Finding another for you!',
                        icon: '/assets/icon.png'
                    });
                }
            }
        });

        // 🔔 When no vendors available
        this.socket.on('no_vendor_available', (data: any) => {
            console.log('❌ No vendors available:', data);
            this.playSound();
            if (this.onNotification) {
                this.onNotification('No Vendors Available', data.message || 'Sorry, no vendors available right now.', 'error');
            }
            if (Platform.OS === 'web') {
                try {
                    const audio = new (window as any).Audio('/notification.mp3');
                    audio.volume = 1.0;
                    audio.play().catch(() => { });
                } catch (e) { }
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('No Vendors Available 😔', {
                        body: data.message || 'Sorry, no vendors available. Please try again later.',
                        icon: '/assets/icon.png'
                    });
                }
            }
        });

        this.socket.on('technician_en_route', (data: any) => {
            console.log('🚗 Technician en route:', data);
            this.playSound();
            if (this.onNotification) {
                this.onNotification('On the Way', `Your professional is on the way!`, 'info');
            }
        });

        this.socket.on('technician_arrived', (data: any) => {
            console.log('📍 Technician arrived:', data);
            this.playSound();
            if (this.onNotification) {
                this.onNotification('Arrived', `Your professional has arrived at your location.`, 'info');
            }
        });

        this.socket.on('booking_started', (data: any) => {
            console.log('▶️ Booking started:', data);
            this.playSound();
            if (this.onNotification) {
                this.onNotification('Work Started', `Your service has started.`, 'info');
            }
        });

        // Admin Notifications
        this.socket.on('admin_notification', (data: any) => {
            console.log('📢 Admin Notification:', data);
            this.playSound();
            if (this.onNotification) {
                this.onNotification(data.title, data.body, data.type || 'info');
            }
        });

        // Generic Notifications
        this.socket.on('notification', (data: any) => {
            console.log('🔔 Notification:', data);
            this.playSound();
            if (this.onNotification) {
                this.onNotification(data.title, data.body, data.type || 'info');
            }
        });

        // 🔄 Unified Status Update (Matches Backend Logic)
        this.socket.on('booking_status_update', (data: any) => {
            console.log('🔄 Booking Status Update:', data);
            this.playSound();
            if (this.onNotification) {
                this.onNotification(data.title || 'Status Update', data.body || `Status: ${data.status}`, 'info');
            }
            // Web Notification
            if (Platform.OS === 'web') {
                try {
                    const audio = new (window as any).Audio('/notification.mp3');
                    audio.volume = 1.0;
                    audio.play().catch(() => { });
                } catch (e) { }

                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification(data.title || 'Status Updated', {
                        body: data.body || '',
                        icon: '/assets/icon.png'
                    });
                }
            }
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            console.log('🔌 Socket disconnected');
        }
    }
}

export default new SocketService();
