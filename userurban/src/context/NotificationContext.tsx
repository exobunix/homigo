import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
    type: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
    markAsRead: (id: string) => void;
    clearAll: () => void;
    unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;

            const response = await api.getNotifications();
            if (response.success && response.data) {
                // Map API response to local Notification type if needed
                const mappedNotifications = response.data.map((n: any) => ({
                    id: n._id || n.id,
                    title: n.title,
                    message: n.body || n.message,
                    timestamp: new Date(n.createdAt).getTime(),
                    read: n.isRead || false,
                    type: n.type || 'info'
                }));
                setNotifications(mappedNotifications);
            }
        } catch (error) {
            console.log('Error fetching notifications:', error);
        }
    };

    const addNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
        const newNotification: Notification = {
            id: Date.now().toString(),
            title,
            message,
            timestamp: Date.now(),
            read: false,
            type
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        // Optionally call API to mark as read
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, clearAll, unreadCount }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
