import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/theme/theme';
import { useAppDispatch } from '@/store';
import { logout } from '@/store/slices/authSlice';

const MENU_ITEMS = [
    { name: 'Home', icon: 'home-variant', route: 'Dashboard' },
    { name: 'Bookings', icon: 'calendar-check', route: 'Bookings' },
    { name: 'Services', icon: 'tools', route: 'Services' },
    { name: 'Earnings', icon: 'cash-multiple', route: 'Earnings' },
    { name: 'Profile', icon: 'account', route: 'Profile' },
];

export default function WebSidebar() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const dispatch = useAppDispatch();

    // Determine active route. 
    // Note: In a nested navigator, getting the exact active route name can be tricky.
    // We'll assume the route name matches the sidebar item route for simplicity,
    // or check if the current state includes it.
    const activeRoute = route.name;

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <View style={styles.container}>
            {/* Logo Area */}
            <TouchableOpacity style={styles.logoContainer} onPress={() => navigation.navigate('Dashboard')}>
                <View style={styles.logoIcon}>
                    <MaterialCommunityIcons name="storefront" size={32} color="#ffffff" />
                </View>
                <Text style={styles.logoText}>UrbanVendor</Text>
            </TouchableOpacity>

            {/* Navigation Items */}
            <View style={styles.menuContainer}>
                {MENU_ITEMS.map((item) => {
                    const isActive = activeRoute === item.route || (activeRoute === 'MainTabs' && item.route === 'Dashboard'); // Fallback for initial load

                    return (
                        <TouchableOpacity
                            key={item.route}
                            onPress={() => {
                                // If we are in a stack screen (like BookingDetail), we might need to navigate to MainTabs first
                                if (route.name === 'BookingDetail' || route.name === 'Chat') {
                                    navigation.navigate('MainTabs', { screen: item.route });
                                } else {
                                    navigation.navigate(item.route);
                                }
                            }}
                            style={styles.menuItemWrapper}
                        >
                            {isActive ? (
                                <LinearGradient
                                    colors={[theme.colors.primary, theme.colors.secondary]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.activeBackground}
                                >
                                    <MaterialCommunityIcons name={item.icon as any} size={24} color="#ffffff" />
                                    <Text style={[styles.menuText, styles.activeMenuText]}>{item.name}</Text>
                                </LinearGradient>
                            ) : (
                                <View style={styles.inactiveBackground}>
                                    <MaterialCommunityIcons name={item.icon as any} size={24} color="#94a3b8" />
                                    <Text style={styles.menuText}>{item.name}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Bottom Actions */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <MaterialCommunityIcons name="logout" size={24} color="#ef4444" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                <View style={styles.versionContainer}>
                    <Text style={styles.versionText}>v1.0.0 • Web Portal</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 280,
        height: '100%',
        backgroundColor: '#ffffff',
        borderRightWidth: 1,
        borderRightColor: '#e2e8f0',
        paddingVertical: 32,
        paddingHorizontal: 16,
        display: 'flex',
        flexDirection: 'column',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 48,
        paddingHorizontal: 12,
    },
    logoIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    logoText: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1e293b',
        fontFamily: Platform.select({ web: 'Inter, sans-serif' }),
    },
    menuContainer: {
        flex: 1,
        gap: 8,
    },
    menuItemWrapper: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    activeBackground: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
    },
    inactiveBackground: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: 'transparent',
    },
    menuText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 16,
        color: '#64748b',
        fontFamily: Platform.select({ web: 'Inter, sans-serif' }),
    },
    activeMenuText: {
        color: '#ffffff',
    },
    bottomContainer: {
        marginTop: 'auto',
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 16,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ef4444',
        marginLeft: 16,
    },
    versionContainer: {
        alignItems: 'center',
    },
    versionText: {
        fontSize: 12,
        color: '#94a3b8',
    },
});
