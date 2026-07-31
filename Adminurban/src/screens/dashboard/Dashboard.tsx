import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform, RefreshControl } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../auth/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';
import { useRefresh } from '../../hooks/useRefresh';
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from '../../config/firebase';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export const Dashboard = ({ onNavigate }: { onNavigate?: (page: string) => void }) => {
    const { admin, logout } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeVendors: 0,
        totalBookings: 0,
        revenue: 0
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    const fetchDashboardData = async () => {
        try {
            const response = await api.getDashboardStats();
            if (response.success) {
                setStats(response.data.stats);
                setRecentActivity(response.data.recentActivity.bookings || []);
            }
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useRefresh(
        useCallback(() => {
            fetchDashboardData();
        }, [])
    );

    // 🔥 Real-time Booking Updates (Admin)
    React.useEffect(() => {
        if (!db) return;

        // Listen to active_bookings collection
        const q = query(collection(db, "active_bookings"), limit(5));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const liveBookings: any[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                liveBookings.push({
                    serviceName: data.serviceName || 'New Booking',
                    user: { name: data.customerName || 'Customer' },
                    status: data.status,
                    createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000).toISOString() : new Date().toISOString()
                });
            });

            if (liveBookings.length > 0) {
                console.log('🔥 Admin received live updates:', liveBookings.length);
                setRecentActivity(liveBookings);
            }
        });

        return () => unsubscribe();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchDashboardData();
    }, []);

    const statsData = [
        {
            id: 1,
            title: 'Total Users',
            value: stats.totalUsers.toLocaleString(),
            change: '+12%',
            icon: 'people',
            gradient: ['#667eea', '#764ba2'],
            lightColor: '#f3f4ff'
        },
        {
            id: 2,
            title: 'Active Vendors',
            value: stats.activeVendors.toString(),
            change: '+8%',
            icon: 'briefcase',
            gradient: ['#f093fb', '#f5576c'],
            lightColor: '#fff0f6'
        },
        {
            id: 3,
            title: 'Total Bookings',
            value: stats.totalBookings.toLocaleString(),
            change: '+23%',
            icon: 'calendar',
            gradient: ['#4facfe', '#00f2fe'],
            lightColor: '#f0fbff'
        },
        {
            id: 4,
            title: 'Revenue',
            value: `₹${(stats.revenue || 0).toLocaleString()}`,
            change: '+18%',
            icon: 'cash',
            gradient: ['#43e97b', '#38f9d7'],
            lightColor: '#f0fff8'
        },
    ];

    const quickActions = [
        { id: 1, title: 'Add User', icon: 'person-add', gradient: ['#667eea', '#764ba2'], screen: 'Users' },
        { id: 2, title: 'New Vendor', icon: 'briefcase', gradient: ['#f093fb', '#f5576c'], screen: 'Vendors' },
        { id: 3, title: 'Bookings', icon: 'calendar', gradient: ['#4facfe', '#00f2fe'], screen: 'Bookings' },
        { id: 4, title: 'Analytics', icon: 'bar-chart', gradient: ['#43e97b', '#38f9d7'], screen: 'Analytics' },
    ];

    return (
        <ScreenWrapper
            title="Dashboard"
            onLogout={logout}
            adminName={admin?.name || 'Admin'}
            currentPage="dashboard"
            onNavigate={onNavigate}
            noPadding={true}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Welcome Card with Gradient */}
                <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.welcomeCard}
                >
                    <View style={styles.welcomeContent}>
                        <Text style={styles.welcomeTitle}>Welcome back,</Text>
                        <Text style={styles.welcomeName}>{admin?.name || 'Admin'}! 👋</Text>
                        <Text style={styles.welcomeSubtitle}>Here's your overview for today</Text>
                    </View>
                    <TouchableOpacity style={styles.notificationButton}>
                        <Ionicons name="notifications" size={24} color="#fff" />
                        <View style={styles.notificationBadge}>
                            <Text style={styles.badgeText}>3</Text>
                        </View>
                    </TouchableOpacity>
                </LinearGradient>

                {/* Stats Grid with Gradients */}
                <View style={[styles.statsGrid, isWeb && styles.statsGridWeb]}>
                    {statsData.map((stat, index) => (
                        <TouchableOpacity
                            key={stat.id}
                            style={[styles.statCard, { backgroundColor: stat.lightColor }, isWeb && styles.statCardWeb]}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={stat.gradient as any}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.statIconContainer}
                            >
                                <Ionicons name={stat.icon as any} size={28} color="#fff" />
                            </LinearGradient>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statTitle}>{stat.title}</Text>
                            <View style={styles.statChange}>
                                <Ionicons name="trending-up" size={16} color="#10b981" />
                                <Text style={styles.changeText}>{stat.change}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Quick Actions with Gradients */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={[styles.actionsGrid, isWeb && styles.actionsGridWeb]}>
                        {quickActions.map((action) => (
                            <TouchableOpacity
                                key={action.id}
                                style={[styles.actionCard, isWeb && styles.actionCardWeb]}
                                activeOpacity={0.8}
                                onPress={() => onNavigate?.(action.screen.toLowerCase())}
                            >
                                <LinearGradient
                                    colors={action.gradient as any}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.actionGradient}
                                >
                                    <Ionicons name={action.icon as any} size={32} color="#fff" />
                                    <Text style={styles.actionTitle}>{action.title}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Recent Activity */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Activity</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>See All →</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.activityList}>
                        {recentActivity.length > 0 ? (
                            recentActivity.map((activity, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.activityItem}
                                    activeOpacity={0.7}
                                >
                                    <LinearGradient
                                        colors={['#4facfe', '#00f2fe']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.activityIcon}
                                    >
                                        <Ionicons name="calendar" size={22} color="#fff" />
                                    </LinearGradient>
                                    <View style={styles.activityContent}>
                                        <Text style={styles.activityTitle}>{activity.serviceName || 'Booking'}</Text>
                                        <Text style={styles.activitySubtitle}>
                                            {activity.user?.name || 'User'} • {activity.status}
                                        </Text>
                                    </View>
                                    <Text style={styles.activityTime}>
                                        {new Date(activity.createdAt).toLocaleDateString()}
                                    </Text>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>No recent activity</Text>
                        )}
                    </View>
                </View>

                <View style={{ height: 32 }} />
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        padding: 24,
    },
    welcomeCard: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 32,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    welcomeContent: {
        flex: 1,
    },
    welcomeTitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 4,
        fontWeight: '600',
    },
    welcomeName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    welcomeSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    notificationButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#ef4444',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 32,
    },
    statsGridWeb: {
        gap: 24,
    },
    statCard: {
        width: (width - 64) / 2,
        borderRadius: 20,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    statCardWeb: {
        width: 250,
        flex: 1,
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    statTitle: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '600',
        marginBottom: 12,
    },
    statChange: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        gap: 4,
    },
    changeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#10b981',
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 16,
    },
    seeAllText: {
        color: '#3b82f6',
        fontWeight: '600',
        fontSize: 14,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    actionsGridWeb: {
        gap: 24,
    },
    actionCard: {
        width: (width - 64) / 2,
        height: 100,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    actionCardWeb: {
        width: 200,
        flex: 1,
    },
    actionGradient: {
        flex: 1,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionTitle: {
        color: '#fff',
        fontWeight: 'bold',
        marginTop: 8,
        fontSize: 15,
    },
    activityList: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
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
        color: '#1e293b',
        marginBottom: 2,
    },
    activitySubtitle: {
        fontSize: 13,
        color: '#64748b',
    },
    activityTime: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '500',
    },
    emptyText: {
        textAlign: 'center',
        padding: 20,
        color: '#64748b',
    },
});
