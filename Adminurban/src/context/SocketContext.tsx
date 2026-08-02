import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { api } from '../services/api';

// Configure local notifications
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    notifications: any[];
    markAsRead: (id: string) => void;
}

const SocketContext = createContext<SocketContextType>({} as SocketContextType);

// Match API_URL logic from api.ts
const SOCKET_URL = Platform.select({
    web: 'http://127.0.0.1:3000',
    android: 'http://192.168.1.48:3000',
    ios: 'http://192.168.1.48:3000',
    default: 'http://192.168.1.48:3000'
});

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        let newSocket: Socket;

        const initSocket = async () => {
            const token = await AsyncStorage.getItem('adminToken');

            if (token) {
                // Fetch initial notifications
                const response = await api.getMyNotifications();
                if (response.success) {
                    setNotifications(response.data);
                }

                // Get Socket URL (clean /api suffix)
                const getSocketUrl = () => {
                    if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
                        const url = process.env.EXPO_PUBLIC_API_URL;
                        return url.endsWith('/api') ? url.slice(0, -4) : url;
                    }

                    return Platform.select({
                        web: __DEV__ ? 'http://localhost:3000' : 'https://homigo-ubpu.onrender.com',
                        android: 'http://192.168.1.48:3000',
                        ios: 'http://192.168.1.48:3000',
                        default: 'https://homigo-ubpu.onrender.com'
                    });
                };

                const socketUrl = getSocketUrl();
                console.log('🔌 Admin Socket URL:', socketUrl);

                // Connect to the Socket.IO server
                newSocket = io(socketUrl, {
                    auth: { token },
                    transports: ['websocket'], // Force websocket
                });

                newSocket.on('connect', () => {
                    console.log('Socket connected:', newSocket.id);
                    setIsConnected(true);
                });

                newSocket.on('disconnect', () => {
                    console.log('Socket disconnected');
                    setIsConnected(false);
                });

                newSocket.on('connect_error', (err) => {
                    console.log('Socket connection error:', err);
                });

                // Listen for new notifications
                newSocket.on('new_notification', async (notification: any) => {
                    console.log('New Notification Received:', notification);

                    // Add to local state
                    setNotifications(prev => [notification, ...prev]);

                    // Show local notification (if app is in foreground)
                    try {
                        await Notifications.scheduleNotificationAsync({
                            content: {
                                title: notification.title,
                                body: notification.message,
                                data: notification.data,
                                sound: true,
                            },
                            trigger: null, // Show immediately
                        });
                    } catch (error) {
                        console.log('Notification schedule error (Expo Go limitation?):', error);
                    }
                });

                setSocket(newSocket);
            }
        };

        initSocket();

        return () => {
            if (newSocket) newSocket.disconnect();
        };
    }, []);

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));

        // API call
        await api.markMyNotificationRead(id);
    };

    return (
        <SocketContext.Provider value={{ socket, isConnected, notifications, markAsRead }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
