import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView, useWindowDimensions } from 'react-native';
import { colors, spacing, typography, shadows, borderRadius, palette } from '../../theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { requestFcmToken, onMessageListener } from '../../config/firebaseweb'; // Import Firebase Helpers
import { api } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SocketService from '../../services/SocketService';
import { useNotifications } from '../../context/NotificationContext';

interface WebLayoutProps {
    children: React.ReactNode;
    onNavigate?: (route: string, params?: any) => void;
}

export const WebLayout: React.FC<WebLayoutProps> = ({ children, onNavigate }) => {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const [userAddress, setUserAddress] = useState<string>('Select Location');
    const [isLoadingAddress, setIsLoadingAddress] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const { notifications, unreadCount, markAsRead, clearAll, addNotification } = useNotifications();

    useEffect(() => {
        console.log('🔍 WebLayout mounted, calling fetchUserAddress...');
        fetchUserAddress();

        // Cleanup socket on unmount
        return () => {
            console.log('🔌 WebLayout unmounting, disconnecting socket...');
            SocketService.disconnect();
        };
    }, []);

    const fetchUserAddress = async () => {
        console.log('🔍 fetchUserAddress: Starting...');
        try {
            // 1. Try to load correctly saved local location first
            const savedLocation = await AsyncStorage.getItem('user_location');
            if (savedLocation) {
                console.log('📍 using saved location:', savedLocation);
                setUserAddress(savedLocation);
            }

            const token = await AsyncStorage.getItem('userToken');

            if (token) {
                const response = await api.getProfile();
                if (response.success && response.data) {
                    const profile = response.data;
                    const userId = profile._id || profile.id;
                    setIsAuthenticated(true);

                    // Connect to socket
                    SocketService.setNotificationHandler((title, body, type) => {
                        addNotification(title, body, type);
                        if (Platform.OS === 'web') {
                            if (window.Notification && Notification.permission === "granted") {
                                new Notification(title, { body });
                            } else if (window.Notification && Notification.permission !== "denied") {
                                Notification.requestPermission().then(permission => {
                                    if (permission === "granted") new Notification(title, { body });
                                });
                            }
                        }
                    });
                    SocketService.connect(userId, token);

                    // Check for profile address only if we don't have a local override
                    if (!savedLocation) {
                        if (profile.addresses && profile.addresses.length > 0) {
                            const defaultAddress = profile.addresses.find((addr: any) => addr.isDefault) || profile.addresses[0];
                            const addressText = `${defaultAddress.city || defaultAddress.area || defaultAddress.locality || 'Your Location'}`;
                            setUserAddress(addressText);
                            AsyncStorage.setItem('user_location', addressText);
                        } else if (profile.location) {
                            const locText = profile.location.city || profile.location.area || 'Your Location';
                            setUserAddress(locText);
                            AsyncStorage.setItem('user_location', locText);
                        }
                    }

                    // 🔥 4. Setup Firebase Notifications (Web)
                    if (Platform.OS === 'web') {
                        try {
                            const fcmToken = await requestFcmToken();
                            if (fcmToken) {
                                // Update backend with this token
                                await api.updateProfile({ fcmToken });
                                console.log('✅ FCM Token synced to backend');
                            }
                        } catch (err) {
                            console.error('Failed to sync FCM token', err);
                        }

                        // Listen for foreground messages
                        onMessageListener().then((payload: any) => {
                            console.log('🔔 Foreground Notification:', payload);
                            addNotification(payload.notification.title, payload.notification.body, 'info');
                            // Show native browser notification if supported
                            if (window.Notification && Notification.permission === "granted") {
                                new Notification(payload.notification.title, { body: payload.notification.body });
                            }
                        });
                    }
                }
            } else {
                setIsAuthenticated(false);
            }

            // 3. Fallback to GPS if still "Select Location" (and not just loading)
            // We check if we are still at default
            // Note: We need to check state, but state updates are async. 
            // We rely on 'savedLocation' check or the API success check.
            const currentStored = await AsyncStorage.getItem('user_location');
            if (!currentStored) {
                console.log('🌍 Auto-detecting location via GPS...');
                try {
                    const position = await getCurrentLocation();
                    const { latitude, longitude } = position.coords;
                    const locationName = await reverseGeocode(latitude, longitude);
                    if (locationName && locationName !== 'Your Location') {
                        setUserAddress(locationName);
                        AsyncStorage.setItem('user_location', locationName);
                    }
                } catch (gpsError) {
                    console.log('Could not auto-detect location');
                }
            }

        } catch (error: any) {
            console.error('❌ fetchUserAddress: Error:', error);
            setIsAuthenticated(false);
        } finally {
            setIsLoadingAddress(false);
        }
    };


    const getCurrentLocation = () => {
        return new Promise<GeolocationPosition>((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
        });
    };

    const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
        try {
            // Using Nominatim (OpenStreetMap) for reverse geocoding
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
            );
            const data = await response.json();

            if (data && data.address) {
                const city = data.address.city || data.address.town || data.address.village || data.address.county;
                const state = data.address.state;
                return city ? `${city}${state ? ', ' + state : ''}` : 'Your Location';
            }
            return 'Your Location';
        } catch (error) {
            console.error('Reverse geocoding failed:', error);
            return 'Your Location';
        }
    };

    const handleLocationClick = async () => {
        setIsLoadingAddress(true);
        try {
            const position = await getCurrentLocation();
            const { latitude, longitude } = position.coords;

            // 1. Get readable address from coordinates
            let locationName = await reverseGeocode(latitude, longitude);

            // 2. If authenticated, SAVE to Database and FETCH updated profile data
            if (isAuthenticated) {
                try {
                    // Update profile with new location
                    const response = await api.updateProfile({
                        location: {
                            latitude,
                            longitude,
                            city: locationName
                        }
                    });

                    // 3. Use the address FROM THE DATABASE response if available
                    if (response && response.success && response.data) {
                        const profile = response.data;
                        // Prioritize the location data we just saved/received from backend
                        if (profile.location && profile.location.city) {
                            locationName = profile.location.city;
                        } else if (profile.addresses && profile.addresses.length > 0) {
                            // Fallback to default address if location didn't save correctly (though unlikely)
                            const defaultAddress = profile.addresses.find((addr: any) => addr.isDefault) || profile.addresses[0];
                            locationName = defaultAddress.city || defaultAddress.area || locationName;
                        }
                        console.log('✅ Address fetched from database:', locationName);
                    }
                } catch (error) {
                    console.log('Could not save location to profile, using local geocode');
                }
            }

            // 4. Update UI and Local Storage with the final confirmed address
            setUserAddress(locationName);
            await AsyncStorage.setItem('user_location', locationName);

        } catch (error: any) {
            console.error('Error getting location:', error);
            setIsLoadingAddress(false);

            // Handle specific error cases
            if (error.code === 1) {
                // Permission denied
                const shouldContinue = window.confirm(
                    'Location access was denied. Would you like to enter your city manually?'
                );
                if (shouldContinue) {
                    const manualCity = window.prompt('Enter your city name:', 'New Delhi');
                    if (manualCity) {
                        setUserAddress(manualCity);
                        AsyncStorage.setItem('user_location', manualCity);
                        if (isAuthenticated) {
                            try {
                                await api.updateProfile({
                                    location: { city: manualCity }
                                });
                            } catch (e) {
                                console.log('Could not save manual location');
                            }
                        }
                    }
                }
            } else {
                // Other errors
                alert(
                    error.message ||
                    'Could not get your location. Please enable location services in your browser settings.'
                );
            }
            return;
        } finally {
            setIsLoadingAddress(false);
        }
    };

    const handleAccountClick = () => {
        if (isAuthenticated) {
            onNavigate?.('profile');
        } else {
            onNavigate?.('login');
        }
    };

    return (
        <View style={styles.container}>
            {/* Navbar */}
            <View style={styles.navbar}>
                <View style={styles.navContent}>
                    <View style={styles.navLeft}>
                        <TouchableOpacity onPress={() => onNavigate?.('home')}>
                            <Text style={styles.logo}>Homigo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.locationContainer} onPress={handleLocationClick}>
                            <Ionicons name="location-outline" size={20} color={colors.black} />
                            <Text style={[styles.locationText, isMobile && { maxWidth: 150 }]} numberOfLines={1}>{isLoadingAddress ? 'Loading...' : userAddress}</Text>
                            {!isMobile && <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />}
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.navRight, isMobile && { gap: spacing.s }]}>
                        {!isMobile && (
                            <>
                                <TouchableOpacity style={styles.navLink} onPress={() => onNavigate?.('home')}>
                                    <Text style={styles.navLinkText}>Home</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.navLink} onPress={() => onNavigate?.('bookings')}>
                                    <Text style={styles.navLinkText}>Bookings</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* Notification Bell - Keep on Header */}
                        <View style={{ position: 'relative', marginRight: isMobile ? 0 : 15 }}>
                            <TouchableOpacity onPress={() => setShowNotifications(!showNotifications)}>
                                <Ionicons name="notifications-outline" size={24} color={colors.text} />
                                {unreadCount > 0 && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{unreadCount}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                            {/* Dropdown ... */}
                            {showNotifications && (
                                <View style={styles.notificationDropdown}>
                                    <View style={styles.notificationHeader}>
                                        <Text style={styles.notificationTitle}>Notifications</Text>
                                        <TouchableOpacity onPress={clearAll}>
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
                                                    style={[styles.notificationItem, !item.read && styles.unreadItem]}
                                                    onPress={() => markAsRead(item.id)}
                                                >
                                                    <View style={[styles.dot, { backgroundColor: item.type === 'error' ? colors.error : item.type === 'success' ? colors.success : colors.primary }]} />
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={styles.notifTitle}>{item.title}</Text>
                                                        <Text style={styles.notifBody}>{item.message}</Text>
                                                        <Text style={styles.notifTime}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            ))
                                        )}
                                    </ScrollView>
                                </View>
                            )}
                        </View>

                        {!isMobile && (
                            <TouchableOpacity style={styles.navLink} onPress={() => onNavigate?.('cart')}>
                                <Ionicons name="cart-outline" size={24} color={colors.text} />
                            </TouchableOpacity>
                        )}

                        {!isMobile && (
                            <TouchableOpacity style={styles.accountIconButton} onPress={handleAccountClick}>
                                <Ionicons name="person-circle-outline" size={32} color={colors.black} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            {/* Scrollable Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>
                    {children}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.footerContent}>
                        <View style={styles.footerColumn}>
                            <Text style={styles.footerTitle}>Homigo</Text>
                            <Text style={styles.footerLink} onPress={() => onNavigate?.('static', { page: 'about-us' })}>About Us</Text>
                            <Text style={styles.footerLink} onPress={() => onNavigate?.('static', { page: 'terms' })}>Terms & Conditions</Text>
                            <Text style={styles.footerLink} onPress={() => onNavigate?.('static', { page: 'privacy' })}>Privacy Policy</Text>
                            <Text style={styles.footerLink} onPress={() => onNavigate?.('static', { page: 'anti-discrimination' })}>Anti-Discrimination Policy</Text>
                            <Text style={styles.footerLink} onPress={() => onNavigate?.('static', { page: 'impact' })}>Impact</Text>
                        </View>
                        <View style={styles.footerColumn}>
                            <Text style={styles.footerTitle}>For Customers</Text>
                            <Text style={styles.footerLink} onPress={() => onNavigate?.('static', { page: 'reviews' })}>Reviews</Text>
                            <Text style={styles.footerLink} onPress={() => onNavigate?.('static', { page: 'categories-near-you' })}>Categories Near You</Text>
                            <Text style={styles.footerLink} onPress={() => onNavigate?.('static', { page: 'blog' })}>Blog</Text>
                            <Text style={styles.footerLink} onPress={() => onNavigate?.('static', { page: 'contact-us' })}>Contact Us</Text>
                        </View>
                        <View style={styles.footerColumn}>
                            <Text style={styles.footerTitle}>For Partners</Text>
                            <Text style={styles.footerLink} onPress={() => onNavigate?.('static', { page: 'register-professional' })}>Register as a Professional</Text>
                        </View>
                        <View style={styles.footerColumn}>
                            <Text style={styles.footerTitle}>Social Links</Text>
                            <View style={styles.socialIcons}>
                                <Ionicons name="logo-twitter" size={24} color={colors.white} />
                                <Ionicons name="logo-facebook" size={24} color={colors.white} />
                                <Ionicons name="logo-instagram" size={24} color={colors.white} />
                                <Ionicons name="logo-linkedin" size={24} color={colors.white} />
                            </View>
                            <View style={styles.appStoreBadges}>
                                <View style={styles.badgePlaceholder}><Text style={styles.badgeText}>App Store</Text></View>
                                <View style={styles.badgePlaceholder}><Text style={styles.badgeText}>Google Play</Text></View>
                            </View>
                        </View>
                    </View>
                    <View style={styles.footerBottom}>
                        <Text style={styles.copyright}>© 2026 Homigo Technologies India Pvt. Ltd.</Text>
                    </View>
                </View>
            </ScrollView>
            {/* Bottom Navigation for Mobile */}
            {isMobile && (
                <View style={[styles.bottomNav, { paddingBottom: Platform.OS === 'ios' ? 20 : 10 }]}>
                    <TouchableOpacity style={styles.bottomNavItem} onPress={() => onNavigate?.('home')}>
                        <Ionicons name="home-outline" size={24} color={colors.textSecondary} />
                        <Text style={styles.bottomNavText}>Home</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.bottomNavItem} onPress={() => onNavigate?.('bookings')}>
                        <Ionicons name="calendar-outline" size={24} color={colors.textSecondary} />
                        <Text style={styles.bottomNavText}>Bookings</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.bottomNavItem} onPress={() => onNavigate?.('cart')}>
                        <Ionicons name="cart-outline" size={24} color={colors.textSecondary} />
                        <Text style={styles.bottomNavText}>Cart</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.bottomNavItem} onPress={handleAccountClick}>
                        <Ionicons name="person-outline" size={24} color={colors.textSecondary} />
                        <Text style={styles.bottomNavText}>Account</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        height: Platform.OS === 'web' ? '100vh' : '100%' as any,
        overflow: Platform.OS === 'web' ? 'hidden' : undefined, // Prevent horizontal page sway
    },
    navbar: {
        width: '100%',
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        zIndex: 9999, // Increased zIndex to ensure dropdown appears above everything
        alignItems: 'center',
        ...shadows.small,
    },
    navContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: 1200,
        paddingHorizontal: spacing.l,
        paddingVertical: spacing.m,
    },
    navLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        fontSize: 24,
        fontWeight: '800',
        marginRight: spacing.xl,
        color: colors.black,
        letterSpacing: -1,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        cursor: 'pointer',
    },
    locationText: {
        ...typography.body,
        fontWeight: '500',
        color: colors.text,
    },
    navRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.l,
    },
    navLink: {
        padding: spacing.s,
    },
    navLinkText: {
        ...typography.body,
        fontWeight: '600',
        color: colors.text,
    },
    accountIconButton: {
        padding: spacing.xs,
        borderRadius: borderRadius.round,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        width: '100%',
    },
    scrollView: {
        flex: 1,
        width: '100%',
    },
    scrollContent: {
        flexGrow: 1,
    },
    footer: {
        backgroundColor: colors.black,
        paddingTop: spacing.xl,
        paddingBottom: spacing.l,
        width: '100%',
        alignItems: 'center',
    },
    footerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 1200,
        paddingHorizontal: spacing.l,
        flexWrap: 'wrap',
        gap: spacing.xl,
    },
    footerColumn: {
        flex: 1,
        minWidth: 200,
    },
    footerTitle: {
        ...typography.h3,
        color: colors.white,
        marginBottom: spacing.l,
        fontSize: 18,
    },
    footerLink: {
        ...typography.body,
        color: palette.gray300,
        marginBottom: spacing.s,
        cursor: 'pointer',
    },
    socialIcons: {
        flexDirection: 'row',
        gap: spacing.m,
        marginBottom: spacing.l,
    },
    appStoreBadges: {
        flexDirection: 'row',
        gap: spacing.m,
    },
    badgePlaceholder: {
        backgroundColor: palette.gray800,
        paddingVertical: spacing.s,
        paddingHorizontal: spacing.m,
        borderRadius: borderRadius.s,
        borderWidth: 1,
        borderColor: palette.gray700,
    },
    badgeText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '600',
    },
    footerBottom: {
        width: '100%',
        maxWidth: 1200,
        paddingHorizontal: spacing.l,
        borderTopWidth: 1,
        borderTopColor: palette.gray800,
        paddingTop: spacing.l,
        marginTop: spacing.xl,
    },
    copyright: {
        ...typography.caption,
        color: palette.gray500,
    },
    // Enhanced Notification Styles
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: colors.error,
        borderRadius: 10,
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationDropdown: {
        position: 'absolute',
        top: 45, // Adjusted top position
        right: -10, // Align with the right edge
        width: 360, // Slightly wider for better readability
        backgroundColor: colors.white,
        borderRadius: 16, // More rounded corners
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10, // Higher elevation for Android
        zIndex: 10000,
        maxHeight: 500,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)', // Subtle border
        overflow: 'hidden',
    },
    notificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: '#fafafa', // Slight background distinction
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        letterSpacing: -0.5,
    },
    clearAllText: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: '600',
    },
    notificationList: {
        maxHeight: 400,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        alignItems: 'flex-start',
        backgroundColor: colors.white,
    },
    unreadItem: {
        backgroundColor: '#f0f9ff', // Light blue tint for unread
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: spacing.m,
        marginTop: 5,
    },
    notifTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    notifBody: {
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: 6,
        lineHeight: 18,
    },
    notifTime: {
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: '500',
    },
    emptyText: {
        padding: spacing.xl,
        textAlign: 'center',
        color: colors.textSecondary,
        fontStyle: 'italic',
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        elevation: 20,
        zIndex: 99999,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    bottomNavItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    bottomNavText: {
        fontSize: 10,
        marginTop: 4,
        color: colors.textSecondary,
        fontWeight: '500',
    },
});
