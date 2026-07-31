import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import { store } from '@/store';
import { showBookingRequest, updateBookingInList } from '@/store/slices/bookingSlice';
import { addMessage } from '@/store/slices/chatSlice';
import { addNotification } from '@/store/slices/notificationSlice';
import { SocketEvents, BookingRequest, ChatMessage, AppNotification } from '@/types';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private sound: Audio.Sound | null = null;

  initialize() {
    console.log('SocketService initialized');
  }

  async playSound() {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/notification.mp3'),
        { shouldPlay: true, isLooping: true }
      );
      this.sound = sound;

      // Stop after 1 minute automatically
      setTimeout(() => {
        this.stopSound();
      }, 60000);
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  }

  async stopSound() {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      }
    } catch (error) {
      console.log('Error stopping sound:', error);
    }
  }

  connect(vendorId: string, token: string) {
    if (this.socket) {
      this.disconnect();
    }

    // Replace with your actual socket server URL
    // Define local IP consistent with API service
    const LOCAL_IP = '192.168.1.38';

    // Replace with your actual socket server URL
    const socketUrl =
      typeof process !== 'undefined' && process.env.EXPO_PUBLIC_API_URL
        ? process.env.EXPO_PUBLIC_API_URL
        : __DEV__
          ? Platform.OS === 'web'
            ? 'http://localhost:3000'
            : `http://${LOCAL_IP}:3000`
          : 'https://urbanproxbackend.onrender.com';

    // Remove /api suffix if present for socket connection
    const cleanSocketUrl = socketUrl.endsWith('/api')
      ? socketUrl.slice(0, -4)
      : socketUrl;

    this.socket = io(cleanSocketUrl, {
      auth: {
        token,
        vendorId,
      },
      transports: ['websocket'],
    });

    this.setupEventListeners(vendorId);
  }

  private setupEventListeners(vendorId: string) {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
      this.isConnected = true;
      this.socket?.emit('join_room', `vendor_${vendorId}`);
      // Join global vendors room for admin announcements
      this.socket?.emit('join_room', 'vendors');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      this.isConnected = false;
    });

    // Booking events
    this.socket.on('new_booking_request', (data: any) => {
      console.log('📋 New booking request:', data);

      const request: BookingRequest = {
        id: data.bookingId,
        serviceName: data.serviceName,
        customerName: data.customerName,
        totalAmount: data.amount,
        customerLocation: {
          ...(data.location || {}),
          address: data.customerAddress || data.location?.address || 'Address not available'
        },
        scheduledTime: data.scheduledTime || 'Now',
        distance: 2.5, // Mock distance for now (can be calculated if vendor loc known)
        expiresAt: data.expiresAt,
        customerId: data.customerId || 'unknown',
        customerPhone: data.customerPhone || '',
        serviceId: data.serviceId || '',
        serviceVariants: [],
        scheduledDate: data.scheduledDate || 'Today',
        estimatedDuration: 60,
        customerRating: 4.5,
        priority: 'normal'
      };

      store.dispatch(showBookingRequest(request));
      this.playSound();

      // 🔔 Web Browser Notification with Sound
      if (Platform.OS === 'web') {
        import('./WebNotificationService').then(({ WebNotificationService }) => {
          WebNotificationService.show(
            'New Booking Request! 🎉',
            `${request.serviceName} from ${request.customerName} - ₹${request.totalAmount}`,
            { playSound: true }
          );
        });
      }

      // Add notification
      const notification: AppNotification = {
        id: Date.now().toString(),
        title: 'New Booking Request! 🎉',
        body: `${request.serviceName} from ${request.customerName}`,
        type: 'booking_request',
        data: { bookingId: request.id },
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      store.dispatch(addNotification(notification));
    });

    this.socket.on('booking_cancelled', (data: { bookingId: string; message: string }) => {
      console.log('❌ Booking cancelled:', data);
      this.playSound(); // Alert the vendor with sound

      const notification: AppNotification = {
        id: Date.now().toString(),
        title: 'Booking Cancelled',
        body: data.message || `Booking ${data.bookingId} was cancelled.`,
        type: 'booking_cancelled',
        data: { bookingId: data.bookingId },
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      store.dispatch(addNotification(notification));

      // Update store safely
      const state = store.getState();
      // Use 'any' to bypass strict root state typing if needed, or assume booking slice exists
      const existingBooking = (state.booking as any)?.activeBookings?.find((b: any) => b.id === data.bookingId);

      if (existingBooking) {
        store.dispatch(updateBookingInList({ ...existingBooking, status: 'cancelled_by_user' }));
      }

      // Web Notification
      if (Platform.OS === 'web') {
        import('./WebNotificationService').then(({ WebNotificationService }) => {
          WebNotificationService.show(
            'Booking Cancelled ❌',
            data.message || `Booking ${data.bookingId} was cancelled.`,
            { playSound: true }
          );
        });
      }
    });

    this.socket.on('payment_received', (data: any) => {
      console.log('💰 Payment received:', data);
      this.playSound();

      const notification: AppNotification = {
        id: Date.now().toString(),
        title: 'Payment Received',
        body: `Received ₹${data.amount} for booking ${data.bookingId}`,
        type: 'payment_received',
        data: { bookingId: data.bookingId },
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      store.dispatch(addNotification(notification));
    });

    // Chat events
    this.socket.on('chat:message', (message: ChatMessage) => {
      console.log('💬 New chat message:', message);
      store.dispatch(addMessage(message));

      if (message.senderType === 'customer') {
        const notification: AppNotification = {
          id: Date.now().toString(),
          title: 'New Message',
          body: message.message,
          type: 'chat_message',
          data: { bookingId: message.bookingId },
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        store.dispatch(addNotification(notification));
      }
    });

    // Admin Notifications
    this.socket.on('admin_notification', (data: any) => {
      console.log('📢 Admin Notification:', data);
      this.playSound();

      const notification: AppNotification = {
        id: Date.now().toString(),
        title: data.title,
        body: data.body,
        type: 'admin_announcement',
        data: {},
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      store.dispatch(addNotification(notification));
    });

    // Generic Notifications
    this.socket.on('notification', (data: any) => {
      console.log('🔔 Notification:', data);
      this.playSound();

      const notification: AppNotification = {
        id: Date.now().toString(),
        title: data.title,
        body: data.body,
        type: 'info',
        data: {},
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      store.dispatch(addNotification(notification));
    });
  }

  // Emit events
  goOnline(vendorId: string, location: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit('vendor:online', { vendorId, location });
    }
  }

  goOffline(vendorId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('vendor:offline', { vendorId });
    }
  }

  acceptBooking(bookingId: string, vendorId: string) {
    this.stopSound();
    if (this.socket && this.isConnected) {
      this.socket.emit('booking:accept', { bookingId, vendorId });
    }
  }

  rejectBooking(bookingId: string, vendorId: string, reason?: string) {
    this.stopSound();
    if (this.socket && this.isConnected) {
      this.socket.emit('booking:reject', { bookingId, vendorId, reason });
    }
  }

  updateBookingStatus(bookingId: string, status: string, location?: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit('booking:status_update', { bookingId, status, location });
    }
  }

  sendMessage(message: ChatMessage) {
    if (this.socket && this.isConnected) {
      this.socket.emit('chat:send_message', message);
    }
  }

  disconnect() {
    this.stopSound();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('🔌 Socket disconnected');
    }
  }

  isSocketConnected() {
    return this.isConnected;
  }
}

export default new SocketService();
