import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../auth/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export const EnhancedDashboard = ({ onNavigate }: { onNavigate?: (page: string) => void }) => {
    const { admin, logout } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeVendors: 0,
        totalBookings: 0,
        totalServices: 0,
        revenue: 0,
        pendingBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        const response = await api.getDashboardStats();
        if (response.success) {
            setStats(response.data.stats);
            setRecentActivity(response.data.recentActivity?.bookings || []);
        }
        setLoading(false);
    };

    const statCards = [
        {
            title: 'Total Revenue',
            value: `₹${stats.revenue?.toLocaleString() || 0}`,
            icon: 'trending-up',
            gradient: ['#10b981', '#059669'],
            change: '+12.5%',
            changePositive: true
        },
        {
            title: 'Total Bookings',
            value: stats.totalBookings || 0,
            icon: 'calendar',
            gradient: ['#3b82f6', '#2563eb'],
            change: '+8.2%',
            changePositive: true
        },
        {
            title: 'Active Vendors',
            value: stats.activeVendors || 0,
            icon: 'people',
            gradient: ['#8b5cf6', '#7c3aed'],
            change: '+5.1%',
            changePositive: true
        },
        {
            title: 'Total Users',
            value: stats.totalUsers || 0,
            icon: 'person',
            gradient: ['#f59e0b', '#d97706'],
            change: '+15.3%',
            changePositive: true
        }
    ];

    const quickActions = [
        { title: 'Categories', icon: 'albums', route: 'categories', color: '#3b82f6' },
        { title: 'Banners', icon: 'images', route: 'banners', color: '#8b5cf6' },
        { title: 'Cities', icon: 'location', route: 'cities', color: '#10b981' },
        { title: 'Add-ons', icon: 'cube', route: 'addons', color: '#f59e0b' },
        { title: 'Testimonials', icon: 'chatbubbles', route: 'testimonials', color: '#ec4899' },
        { title: 'Payouts', icon: 'cash', route: 'payouts', color: '#6366f1' },
        { title: 'Notifications', icon: 'notifications', route: 'notifications', color: '#ef4444' },
        { title: 'Services', icon: 'construct', route: 'services', color: '#14b8a6' }
    ];

    const bookingStats = [
        { label: 'Pending', value: stats.pendingBookings || 0, color: '#f59e0b', icon: 'time' },
        { label: 'Completed', value: stats.completedBookings || 0, color: '#10b981', icon: 'checkmark-circle' },
        { label: 'Cancelled', value: stats.cancelledBookings || 0, color: '#ef4444', icon: 'close-circle' }
    ];

    const handleNavigate = (route: string) => {
        if (onNavigate) {
            onNavigate(route);
        }
    };

    if (loading) {
        return (
            <ScreenWrapper
                title="Dashboard"
                onLogout={logout}
                adminName={admin?.name || 'Admin'}
                currentPage="dashboard"
                onNavigate={onNavigate}
            >
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.loadingText}>Loading dashboard...</Text>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            title="Dashboard"
            onLogout={logout}
            adminName={admin?.name || 'Admin'}
            currentPage="dashboard"
            onNavigate={onNavigate}
        >
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                    <View>
                        <Text style={styles.welcomeText}>Welcome back,</Text>
                        <Text style={styles.adminName}>{admin?.name || 'Admin'}</Text>
                    </View>
                    <TouchableOpacity style={styles.refreshButton} onPress={fetchStats}>
                        <Ionicons name="refresh" size={20} color="#64748b" />
                    </TouchableOpacity>
                </View>

                {/* Stats Cards Grid */}
                <View style={styles.statsGrid}>
                    {statCards.map((card, index) => (
                        <View key={index} style={styles.statCardWrapper}>
                            <LinearGradient
                                colors={card.gradient as any}
                                style={styles.statCard}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={styles.statCardHeader}>
                                    <View style={styles.statIconContainer}>
                                        <Ionicons name={card.icon as any} size={24} color="#fff" />
                                    </View>
                                    <View style={[styles.changeBadge, !card.changePositive && styles.changeBadgeNegative]}>
                                        <Ionicons
                                            name={card.changePositive ? "arrow-up" : "arrow-down"}
                                            size={12}
                                            color="#fff"
                                        />
                                        <Text style={styles.changeText}>{card.change}</Text>
                                    </View>
                                </View>
                                <Text style={styles.statValue}>{card.value}</Text>
                                <Text style={styles.statTitle}>{card.title}</Text>
                            </LinearGradient>
                        </View>
                    ))}
                </View>

                {/* Booking Stats */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Booking Overview</Text>
                    <View style={styles.bookingStatsContainer}>
                        {bookingStats.map((stat, index) => (
                            <View key={index} style={styles.bookingStatCard}>
                                <View style={[styles.bookingStatIcon, { backgroundColor: stat.color + '20' }]}>
                                    <Ionicons name={stat.icon as any} size={28} color={stat.color} />
                                </View>
                                <Text style={styles.bookingStatValue}>{stat.value}</Text>
                                <Text style={styles.bookingStatLabel}>{stat.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                        {quickActions.map((action, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.actionCard}
                                onPress={() => handleNavigate(action.route)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.actionIconContainer, { backgroundColor: action.color + '15' }]}>
                                    <Ionicons name={action.icon as any} size={24} color={action.color} />
                                </View>
                                <Text style={styles.actionTitle}>{action.title}</Text>
                                <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Recent Activity */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    {recentActivity.length > 0 ? (
                        <View style={styles.activityListContainer}>
                            {recentActivity.map((activity, index) => (
                                <View key={index} style={styles.activityItem}>
                                    <View style={[styles.activityIconWrapper, { backgroundColor: '#3b82f615' }]}>
                                        <Ionicons name="calendar-outline" size={20} color="#3b82f6" />
                                    </View>
                                    <View style={styles.activityContent}>
                                        <Text style={styles.activityTitle}>{activity.serviceName || 'New Booking'}</Text>
                                        <Text style={styles.activitySubtitle}>
                                            {activity.user?.name || 'Customer'} • {activity.status}
                                        </Text>
                                    </View>
                                    <Text style={styles.activityTime}>
                                        {new Date(activity.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.activityCard}>
                            <Ionicons name="time-outline" size={48} color="#cbd5e1" />
                            <Text style={styles.activityPlaceholder}>No recent activity</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 100,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#64748b',
    },
    welcomeSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 24,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    welcomeText: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 4,
    },
    adminName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    refreshButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 12,
        gap: 16,
    },
    statCardWrapper: {
        width: (isWeb ? 'calc(25% - 12px)' : (width - 56) / 2) as any,
        minWidth: 160,
    },
    statCard: {
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    statCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    changeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    changeBadgeNegative: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
    },
    changeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    statTitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 16,
    },
    bookingStatsContainer: {
        flexDirection: 'row',
        gap: 16,
        flexWrap: 'wrap',
    },
    bookingStatCard: {
        flex: 1,
        minWidth: 140,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    bookingStatIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    bookingStatValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 4,
    },
    bookingStatLabel: {
        fontSize: 14,
        color: '#64748b',
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    actionCard: {
        width: (isWeb ? 'calc(25% - 9px)' : (width - 64) / 2) as any,
        minWidth: 140,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    actionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    actionTitle: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#0f172a',
    },
    activityCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    activityPlaceholder: {
        marginTop: 12,
        fontSize: 14,
        color: '#94a3b8',
    },
    activityListContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    activityIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: 2,
    },
    activitySubtitle: {
        fontSize: 13,
        color: '#64748b',
        textTransform: 'capitalize',
    },
    activityTime: {
        fontSize: 12,
        color: '#94a3b8',
    }
});
