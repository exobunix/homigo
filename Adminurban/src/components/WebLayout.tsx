import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../auth/AuthContext';

interface WebLayoutProps {
    children: React.ReactNode;
    title: string;
    onLogout: () => void;
    adminName: string;
    currentPage?: string;
    onNavigate?: (page: string) => void;
    noPadding?: boolean;
}

export const WebLayout = ({ children, title, onLogout, adminName, currentPage = 'dashboard', onNavigate, noPadding = false }: WebLayoutProps) => {
    const { width } = useWindowDimensions();
    const { admin } = useAuth();
    const isMobile = width < 768 || Platform.OS !== 'web';
    const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

    const handleNavigation = (page: string) => {
        if (onNavigate) {
            onNavigate(page);
            if (isMobile) setIsSidebarOpen(false);
        }
    };

    // Mobile Layout (Native App or Small Web)
    if (Platform.OS !== 'web') {
        return (
            <View style={styles.mobileContainer}>
                <ScrollView contentContainerStyle={styles.mobileContent}>
                    {children}
                </ScrollView>
            </View>
        );
    }

    // Web Layout
    return (
        <View style={styles.container}>
            {/* Sidebar */}
            {(isSidebarOpen || !isMobile) && (
                <View style={[styles.sidebar, isMobile && styles.sidebarMobile]}>
                    <View style={styles.sidebarHeader}>
                        <Text style={styles.logo}>Urban Admin</Text>
                        {isMobile && (
                            <TouchableOpacity onPress={() => setIsSidebarOpen(false)}>
                                <Ionicons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                        )}
                    </View>

                    <ScrollView style={styles.menu} showsVerticalScrollIndicator={false}>
                        <TouchableOpacity
                            style={currentPage === 'dashboard' ? styles.menuItemActive : styles.menuItem}
                            onPress={() => handleNavigation('dashboard')}
                        >
                            <Ionicons name="grid-outline" size={20} color={currentPage === 'dashboard' ? '#fff' : '#94a3b8'} />
                            <Text style={currentPage === 'dashboard' ? styles.menuTextActive : styles.menuText}>Dashboard</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={currentPage === 'users' ? styles.menuItemActive : styles.menuItem}
                            onPress={() => handleNavigation('users')}
                        >
                            <Ionicons name="people-outline" size={20} color={currentPage === 'users' ? '#fff' : '#94a3b8'} />
                            <Text style={currentPage === 'users' ? styles.menuTextActive : styles.menuText}>Users</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={currentPage === 'vendors' ? styles.menuItemActive : styles.menuItem}
                            onPress={() => handleNavigation('vendors')}
                        >
                            <Ionicons name="briefcase-outline" size={20} color={currentPage === 'vendors' ? '#fff' : '#94a3b8'} />
                            <Text style={currentPage === 'vendors' ? styles.menuTextActive : styles.menuText}>Vendors</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={currentPage === 'bookings' ? styles.menuItemActive : styles.menuItem}
                            onPress={() => handleNavigation('bookings')}
                        >
                            <Ionicons name="calendar-outline" size={20} color={currentPage === 'bookings' ? '#fff' : '#94a3b8'} />
                            <Text style={currentPage === 'bookings' ? styles.menuTextActive : styles.menuText}>Bookings</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={currentPage === 'analytics' ? styles.menuItemActive : styles.menuItem}
                            onPress={() => handleNavigation('analytics')}
                        >
                            <Ionicons name="bar-chart-outline" size={20} color={currentPage === 'analytics' ? '#fff' : '#94a3b8'} />
                            <Text style={currentPage === 'analytics' ? styles.menuTextActive : styles.menuText}>Analytics</Text>
                        </TouchableOpacity>

                        <View style={styles.menuSection}>
                            <Text style={styles.menuSectionTitle}>FINANCE</Text>
                        </View>

                        <TouchableOpacity
                            style={currentPage === 'payouts' ? styles.menuItemActive : styles.menuItem}
                            onPress={() => handleNavigation('payouts')}
                        >
                            <Ionicons name="cash-outline" size={20} color={currentPage === 'payouts' ? '#fff' : '#94a3b8'} />
                            <Text style={currentPage === 'payouts' ? styles.menuTextActive : styles.menuText}>Payouts</Text>
                        </TouchableOpacity>

                        <View style={styles.menuSection}>
                            <Text style={styles.menuSectionTitle}>CONTENT MANAGEMENT</Text>
                        </View>

                        <TouchableOpacity
                            style={currentPage === 'categories' ? styles.menuItemActive : styles.menuItem}
                            onPress={() => handleNavigation('categories')}
                        >
                            <Ionicons name="albums-outline" size={20} color={currentPage === 'categories' ? '#fff' : '#94a3b8'} />
                            <Text style={currentPage === 'categories' ? styles.menuTextActive : styles.menuText}>Categories</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={currentPage === 'banners' ? styles.menuItemActive : styles.menuItem}
                            onPress={() => handleNavigation('banners')}
                        >
                            <Ionicons name="images-outline" size={20} color={currentPage === 'banners' ? '#fff' : '#94a3b8'} />
                            <Text style={currentPage === 'banners' ? styles.menuTextActive : styles.menuText}>Banners</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={currentPage === 'web-content' ? styles.menuItemActive : styles.menuItem}
                            onPress={() => handleNavigation('web-content')}
                        >
                            <Ionicons name="desktop-outline" size={20} color={currentPage === 'web-content' ? '#fff' : '#94a3b8'} />
                            <Text style={currentPage === 'web-content' ? styles.menuTextActive : styles.menuText}>Web Home Page</Text>
                        </TouchableOpacity>

                        {(admin?.role === 'super_admin' || admin?.email === 'masteradmin@urban.com') && (
                            <TouchableOpacity
                                style={currentPage === 'admins' ? styles.menuItemActive : styles.menuItem}
                                onPress={() => handleNavigation('admins')}
                            >
                                <Ionicons name="people-circle-outline" size={20} color={currentPage === 'admins' ? '#fff' : '#94a3b8'} />
                                <Text style={currentPage === 'admins' ? styles.menuTextActive : styles.menuText}>Admins</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={currentPage === 'cities' ? styles.menuItemActive : styles.menuItem}
                            onPress={() => handleNavigation('cities')}
                        >
                            <Ionicons name="location-outline" size={20} color={currentPage === 'cities' ? '#fff' : '#94a3b8'} />
                            <Text style={currentPage === 'cities' ? styles.menuTextActive : styles.menuText}>Cities</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={currentPage === 'addons' ? styles.menuItemActive : styles.menuItem}
                            onPress={() => handleNavigation('addons')}
                        >
                            <Ionicons name="cube-outline" size={20} color={currentPage === 'addons' ? '#fff' : '#94a3b8'} />
                            <Text style={currentPage === 'addons' ? styles.menuTextActive : styles.menuText}>Add-ons</Text>
                        </TouchableOpacity>



                        <TouchableOpacity
                            style={currentPage === 'notifications' ? styles.menuItemActive : styles.menuItem}
                            onPress={() => handleNavigation('notifications')}
                        >
                            <Ionicons name="notifications-outline" size={20} color={currentPage === 'notifications' ? '#fff' : '#94a3b8'} />
                            <Text style={currentPage === 'notifications' ? styles.menuTextActive : styles.menuText}>Notifications</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={currentPage === 'testimonials' ? styles.menuItemActive : styles.menuItem}
                            onPress={() => handleNavigation('testimonials')}
                        >
                            <Ionicons name="chatbubbles-outline" size={20} color={currentPage === 'testimonials' ? '#fff' : '#94a3b8'} />
                            <Text style={currentPage === 'testimonials' ? styles.menuTextActive : styles.menuText}>Testimonials</Text>
                        </TouchableOpacity>



                        <TouchableOpacity
                            style={currentPage === 'profile' || currentPage === 'editProfile' || currentPage === 'settings' ? styles.menuItemActive : styles.menuItem}
                            onPress={() => handleNavigation('profile')}
                        >
                            <Ionicons name="person-outline" size={20} color={currentPage === 'profile' || currentPage === 'editProfile' || currentPage === 'settings' ? '#fff' : '#94a3b8'} />
                            <Text style={currentPage === 'profile' || currentPage === 'editProfile' || currentPage === 'settings' ? styles.menuTextActive : styles.menuText}>Profile</Text>
                        </TouchableOpacity>
                        <View style={{ height: 20 }} />
                    </ScrollView>
                </View>
            )}

            {/* Main Content */}
            <View style={styles.main}>
                {/* Top Bar */}
                <View style={styles.topBar}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                        {isMobile && (
                            <TouchableOpacity onPress={() => setIsSidebarOpen(true)}>
                                <Ionicons name="menu" size={24} color="#1e293b" />
                            </TouchableOpacity>
                        )}
                        <Text style={styles.pageTitle}>{title}</Text>
                    </View>
                    <View style={styles.topBarRight}>
                        <View style={styles.adminInfo}>
                            <Text style={styles.adminName}>{adminName}</Text>
                            <Text style={styles.adminRole}>Super Admin</Text>
                        </View>
                        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
                            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Content */}
                <View style={[styles.content, noPadding && styles.noPadding]}>
                    {children}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
    },
    mobileContainer: {
        flex: 1,
        backgroundColor: '#f1f5f9',
    },
    mobileContent: {
        padding: 16,
    },
    sidebar: {
        width: 260,
        backgroundColor: '#1e293b',
        borderRightWidth: 1,
        borderRightColor: '#334155',
    },
    sidebarMobile: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 10,
    },
    sidebarHeader: {
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    menu: {
        padding: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 4,
    },
    menuItemActive: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 4,
        backgroundColor: '#3b82f6',
    },
    menuText: {
        marginLeft: 12,
        fontSize: 15,
        color: '#94a3b8',
        fontWeight: '500',
    },
    menuTextActive: {
        marginLeft: 12,
        fontSize: 15,
        color: '#fff',
        fontWeight: '600',
    },
    main: {
        flex: 1,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    topBarRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    adminInfo: {
        alignItems: 'flex-end',
    },
    adminName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    adminRole: {
        fontSize: 12,
        color: '#64748b',
    },
    logoutBtn: {
        padding: 8,
    },
    content: {
        flex: 1,
        padding: 24,
    },
    noPadding: {
        padding: 0,
    },
    contentContainer: {
        padding: 24,
    },
    menuSection: {
        marginTop: 24,
        marginBottom: 8,
        paddingHorizontal: 12,
    },
    menuSectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#64748b',
        letterSpacing: 1,
    },
});
