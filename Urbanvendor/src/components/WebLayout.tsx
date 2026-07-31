import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, ScrollView, Text, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import WebSidebar from './WebSidebar';
import { useAppSelector, useAppDispatch } from '@/store';
import { markNotificationAsRead, clearAllNotifications } from '@/store/slices/notificationSlice';
import SocketService from '@/services/SocketService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WebLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    showProfile?: boolean;
    actions?: React.ReactNode;
}

export default function WebLayout({ children, title, subtitle, showProfile = true, actions }: WebLayoutProps) {
    const insets = useSafeAreaInsets();
    const { user } = useAppSelector((state) => state.auth);
    const { notifications, unreadCount } = useAppSelector((state) => state.notification);
    const dispatch = useAppDispatch();
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const connectSocket = async () => {
            try {
                const token = await AsyncStorage.getItem('vendorToken');
                if (token && user?.id) {
                    console.log('🔌 Vendor Web: Connecting socket...', user.id);
                    SocketService.connect(user.id, token);
                    console.log('✅ Vendor Web: Socket connected');
                }
            } catch (error) {
                console.error('❌ Vendor Web: Socket connection error:', error);
            }
        };

        connectSocket();

        return () => {
            console.log('🔌 Vendor Web: Disconnecting socket...');
            SocketService.disconnect();
        };
    }, [user?.id]);

    if (Platform.OS !== 'web') {
        return <>{children}</>;
    }

    return (
        <View style={styles.container}>
            <WebSidebar />

            <View style={styles.mainContent}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        {title && <Text style={styles.headerTitle}>{title}</Text>}
                        {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
                    </View>

                    <View style={styles.headerRight}>
                        {actions}

                        <View style={{ position: 'relative', zIndex: 1000 }}>
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() => setShowNotifications(!showNotifications)}
                            >
                                <MaterialCommunityIcons name="bell-outline" size={24} color="#64748b" />
                                {unreadCount > 0 && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{unreadCount}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            {showNotifications && (
                                <View style={styles.notificationDropdown}>
                                    <View style={styles.notificationHeader}>
                                        <Text style={styles.notificationTitle}>Notifications</Text>
                                        <TouchableOpacity onPress={() => dispatch(clearAllNotifications())}>
                                            <Text style={styles.clearAllText}>Clear All</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <ScrollView style={styles.notificationList} nestedScrollEnabled>
                                        {notifications.length === 0 ? (
                                            <Text style={styles.emptyText}>No notifications</Text>
                                        ) : (
                                            notifications.map(item => (
                                                <TouchableOpacity
                                                    key={item.id}
                                                    style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
                                                    onPress={() => dispatch(markNotificationAsRead(item.id))}
                                                >
                                                    <View style={[styles.dot, {
                                                        backgroundColor:
                                                            item.type === 'booking_cancelled' ? '#ef4444' :
                                                                item.type === 'payment_received' ? '#22c55e' :
                                                                    item.type === 'admin_announcement' ? '#8b5cf6' :
                                                                        '#3b82f6'
                                                    }]} />
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={styles.notifTitle}>{item.title}</Text>
                                                        <Text style={styles.notifBody}>{item.body}</Text>
                                                        <Text style={styles.notifTime}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            ))
                                        )}
                                    </ScrollView>
                                </View>
                            )}
                        </View>

                        {showProfile && (
                            <View style={styles.profileContainer}>
                                <Image
                                    source={{ uri: user?.profileImage || 'https://ui-avatars.com/api/?name=' + (user?.name || 'User') }}
                                    style={styles.avatar as any}
                                />
                                <View style={styles.profileText}>
                                    <Text style={styles.profileName}>{user?.name || 'Vendor'}</Text>
                                    <Text style={styles.profileRole}>Verified Vendor</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* Content */}
                <View style={styles.contentWrapper}>
                    {children}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        height: Platform.OS === 'web' ? ('100vh' as any) : '100%', // Ensure full height on web
        overflow: 'hidden',
    },
    mainContent: {
        flex: 1,
        flexDirection: 'column',
        height: '100%',
        minHeight: 0, // Ensure flex container respects parents constraints
    },
    header: {
        height: 80,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 32,
        zIndex: 100,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        fontFamily: Platform.select({ web: 'Inter, sans-serif' }),
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
        zIndex: 100,
    },
    iconButton: {
        position: 'relative',
        padding: 8,
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#ef4444',
        borderWidth: 1,
        borderColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingLeft: 24,
        borderLeftWidth: 1,
        borderLeftColor: '#e2e8f0',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e2e8f0',
    },
    profileText: {
        justifyContent: 'center',
    },
    profileName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    profileRole: {
        fontSize: 12,
        color: '#64748b',
    },
    contentWrapper: {
        flex: 1,
        minHeight: 0, // CRITICAL: allows scrolling when content overflows
        overflow: 'scroll', // Let children handle scrolling
    },
    // Notification Styles
    notificationDropdown: {
        position: 'absolute',
        top: 50,
        right: 0,
        width: 320,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        zIndex: 1000,
        maxHeight: 400,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    notificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    clearAllText: {
        fontSize: 12,
        color: '#3b82f6',
        fontWeight: '500',
    },
    notificationList: {
        maxHeight: 350,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        alignItems: 'flex-start',
    },
    unreadItem: {
        backgroundColor: '#eff6ff',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 12,
        marginTop: 6,
    },
    notifTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    notifBody: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 4,
        lineHeight: 16,
    },
    notifTime: {
        fontSize: 10,
        color: '#94a3b8',
    },
    emptyText: {
        padding: 24,
        textAlign: 'center',
        color: '#64748b',
    },
});
