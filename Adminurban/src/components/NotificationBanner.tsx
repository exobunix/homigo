import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSocket } from '../context/SocketContext';

export const NotificationBanner = () => {
    const { notifications } = useSocket();
    const [visible, setVisible] = useState(false);
    const [currentNotification, setCurrentNotification] = useState<any>(null);
    const slideAnim = useState(new Animated.Value(-100))[0];

    useEffect(() => {
        if (notifications.length > 0) {
            const latest = notifications[0];
            // Only show if it's a new notification (simple check, in real app use IDs)
            if (latest !== currentNotification) {
                setCurrentNotification(latest);
                showBanner();
            }
        }
    }, [notifications]);

    const showBanner = () => {
        setVisible(true);
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
        }).start();

        // Auto hide after 4 seconds
        setTimeout(() => {
            hideBanner();
        }, 4000);
    };

    const hideBanner = () => {
        Animated.timing(slideAnim, {
            toValue: -150,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setVisible(false);
        });
    };

    if (!visible || !currentNotification) return null;

    return (
        <SafeAreaView style={styles.safeArea}>
            <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
                <View style={styles.content}>
                    <View style={[styles.iconContainer, { backgroundColor: '#e0e7ff' }]}>
                        <Ionicons name="notifications" size={24} color="#4f46e5" />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{currentNotification.title}</Text>
                        <Text style={styles.message} numberOfLines={2}>
                            {currentNotification.message}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={hideBanner} style={styles.closeButton}>
                        <Ionicons name="close" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        position: 'absolute',
        top: Platform.OS === 'android' ? 30 : 0,
        left: 0,
        right: 0,
        zIndex: 9999,
    },
    container: {
        marginHorizontal: 16,
        backgroundColor: 'white',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    content: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 2,
    },
    message: {
        fontSize: 12,
        color: '#6b7280',
    },
    closeButton: {
        padding: 4,
    },
});
