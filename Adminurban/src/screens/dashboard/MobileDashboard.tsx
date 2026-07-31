import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl, Animated } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../auth/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';
import { useRefresh } from '../../hooks/useRefresh';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
    strokeWidth: 3,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForBackgroundLines: {
        strokeDasharray: "",
        stroke: "#E5E7EB"
    }
};

const AnimatedBubble = ({ size, top, left }: { size: number; top: number; left: number }) => (
    <View
        style={{
            position: 'absolute',
            width: size,
            height: size,
            top: top,
            left: left,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: size / 2,
            opacity: 0.6,
        }}
    />
);

interface StatsCardProps {
    title: string;
    value: string | number;
    change: string;
    icon: any;
    gradient: readonly [string, string];
}

const StatsCard = ({ title, value, change, icon: IconName, gradient }: StatsCardProps) => (
    <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statsCard}
    >
        <AnimatedBubble size={80} top={-30} left={-20} />
        <AnimatedBubble size={60} top={60} left={120} />

        <View style={styles.statsHeader}>
            <View style={styles.iconContainer}>
                <Ionicons name={IconName} size={24} color="white" />
            </View>
            <View style={styles.changeBadge}>
                <Text style={styles.changeText}>{change}</Text>
            </View>
        </View>

        <View>
            <Text style={styles.statsTitle}>{title}</Text>
            <Text style={styles.statsValue}>{value}</Text>
        </View>
    </LinearGradient>
);

const QuickActionButton = ({ icon: IconName, label, color, onPress }: { icon: any; label: string; color: string; onPress?: () => void }) => (
    <TouchableOpacity style={styles.quickActionBtn} onPress={onPress}>
        <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
            <Ionicons name={IconName} size={28} color="#4F46E5" />
        </View>
        <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
);

const MetricCard = ({ label, value, icon: IconName, bgColor, iconColor }: any) => (
    <View style={styles.metricCardWrapper}>
        <View style={[styles.metricCard, { backgroundColor: bgColor }]}>
            <View style={styles.metricHeader}>
                <Ionicons name={IconName} size={20} color={iconColor} />
                <Text style={styles.metricLabel}>{label}</Text>
            </View>
            <Text style={styles.metricValue}>{value}</Text>
        </View>
    </View>
);

const ActivityItem = ({ title, time, icon: IconName, color, bg }: any) => (
    <View style={styles.activityItem}>
        <View style={[styles.activityIconContainer, { backgroundColor: bg }]}>
            <Ionicons name={IconName} size={16} color={color} />
        </View>
        <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>{title}</Text>
            <Text style={styles.activityTime}>{time}</Text>
        </View>
    </View>
);

export const MobileDashboard = ({ onNavigate }: { onNavigate?: (page: string) => void }) => {
    const { admin, logout } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeVendors: 0,
        totalBookings: 0,
        totalServices: 0,
        revenue: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const scrollX = useRef(new Animated.Value(0)).current;

    const fetchStats = async () => {
        try {
            const response = await api.getDashboardStats();
            if (response.success) {
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useRefresh(
        useCallback(() => {
            fetchStats();
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchStats();
    }, []);

    const mainStats = [
        {
            title: 'Total Revenue',
            value: `₹${stats.revenue?.toLocaleString() || 0}`,
            icon: 'trending-up',
            gradient: ['#10b981', '#059669'] as const,
            change: '+12.5%',
        },
        {
            title: 'Total Bookings',
            value: stats.totalBookings || 0,
            icon: 'calendar',
            gradient: ['#3b82f6', '#2563eb'] as const,
            change: '+8.2%',
        },
        {
            title: 'Active Vendors',
            value: stats.activeVendors || 0,
            icon: 'people',
            gradient: ['#8b5cf6', '#7c3aed'] as const,
            change: '+5.1%',
        },
        {
            title: 'Total Users',
            value: stats.totalUsers || 0,
            icon: 'person',
            gradient: ['#f59e0b', '#d97706'] as const,
            change: '+15.3%',
        }
    ];

    const quickActions = [
        { id: 'users', icon: 'people', label: 'Users', color: '#e0e7ff', page: 'users' },
        { id: 'vendors', icon: 'briefcase', label: 'Vendors', color: '#dbeafe', page: 'vendors' },
        { id: 'bookings', icon: 'calendar', label: 'Bookings', color: '#fef3c7', page: 'bookings' },
        { id: 'categories', icon: 'albums', label: 'Categories', color: '#dcfce7', page: 'categories' },
        { id: 'banners', icon: 'images', label: 'Banners', color: '#fce7f3', page: 'banners' },
        { id: 'cities', icon: 'location', label: 'Countries', color: '#cffafe', page: 'cities' },
        { id: 'testimonials', icon: 'chatbubbles', label: 'Reviews', color: '#ccfbf1', page: 'testimonials' },
        { id: 'services', icon: 'construct', label: 'Services', color: '#e0e7ff', page: 'services' },
    ];

    return (
        <ScreenWrapper
            title="Dashboard"
            onLogout={logout}
            adminName={admin?.name || 'Admin'}
            currentPage="dashboard"
            onNavigate={onNavigate}
            noPadding
        >
            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />
                }
            >
                {/* Header Section */}
                <View style={styles.headerContainer}>
                    <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.headerGradient}>
                        <AnimatedBubble size={150} top={10} left={screenWidth - 100} />
                        <AnimatedBubble size={100} top={120} left={20} />
                        <AnimatedBubble size={80} top={60} left={screenWidth / 2} />

                        <View style={styles.headerContent}>
                            <View>
                                <Text style={styles.welcomeText}>Hey,</Text>
                                <Text style={styles.adminNameText}>{admin?.role || 'Admin'}</Text>
                            </View>
                            <TouchableOpacity style={styles.notificationButton}>
                                <Ionicons name="notifications-outline" size={24} color="#fff" />
                                <View style={styles.notificationBadge} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.progressCard}>
                            <Text style={styles.progressTitle}>System Status</Text>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: '100%' }]} />
                            </View>
                            <Text style={styles.progressText}>All systems operational</Text>
                        </View>
                    </LinearGradient>
                </View>

                <View style={styles.contentContainer}>
                    {/* STATS CARDS - Carousel */}
                    <Animated.ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.carousel}
                        pagingEnabled
                        snapToInterval={screenWidth - 40}
                        decelerationRate="fast"
                        contentContainerStyle={{ paddingHorizontal: 10 }}
                    >
                        {mainStats.map((stat, index) => (
                            <View key={index} style={{ width: screenWidth - 40, paddingHorizontal: 5 }}>
                                <StatsCard
                                    title={stat.title}
                                    value={stat.value}
                                    change={stat.change}
                                    icon={stat.icon}
                                    gradient={stat.gradient}
                                />
                            </View>
                        ))}
                    </Animated.ScrollView>

                    {/* Quick Actions */}
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Quick Actions</Text>
                        <View style={styles.quickActionsGrid}>
                            {quickActions.map((action) => (
                                <View key={action.id} style={styles.quickActionWrapper}>
                                    <QuickActionButton
                                        icon={action.icon}
                                        label={action.label}
                                        color={action.color}
                                        onPress={() => onNavigate && onNavigate(action.page)}
                                    />
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Chart Section */}
                    <View style={styles.sectionCard}>
                        <View style={styles.chartHeader}>
                            <View>
                                <Text style={styles.sectionTitle}>Booking Trends</Text>
                                <Text style={styles.subTitle}>Last 6 months</Text>
                            </View>
                            <View style={styles.growthBadge}>
                                <Text style={styles.growthText}>+12.5%</Text>
                            </View>
                        </View>

                        <LineChart
                            data={{
                                labels: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
                                datasets: [{
                                    data: [20, 45, 28, 80, 99, 43],
                                    color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
                                    strokeWidth: 4
                                }]
                            }}
                            width={screenWidth - 60}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={{ borderRadius: 16 }}
                            withVerticalLines={false}
                        />
                    </View>

                    {/* Booking Status (Performance Metrics Style) */}
                    <View style={styles.metricsSection}>
                        <Text style={styles.sectionTitlePadding}>Booking Status</Text>
                        <View style={styles.metricsGrid}>
                            <MetricCard
                                label="Completed"
                                value={stats.completedBookings || 0}
                                icon="checkmark-circle"
                                bgColor="#dcfce7"
                                iconColor="#10b981"
                            />
                            <MetricCard
                                label="Confirmed"
                                value={stats.confirmedBookings || 0}
                                icon="thumbs-up"
                                bgColor="#e0e7ff"
                                iconColor="#4f46e5"
                            />
                            <MetricCard
                                label="Pending"
                                value={stats.pendingBookings || 0}
                                icon="time"
                                bgColor="#fef3c7"
                                iconColor="#f59e0b"
                            />
                            <MetricCard
                                label="Cancelled"
                                value={stats.cancelledBookings || 0}
                                icon="close-circle"
                                bgColor="#fee2e2"
                                iconColor="#ef4444"
                            />
                        </View>
                    </View>

                    {/* Recent Activity */}
                    <View style={styles.sectionCard}>
                        <View style={styles.chartHeader}>
                            <Text style={styles.sectionTitle}>Recent Activity</Text>
                            <TouchableOpacity>
                                <Text style={{ color: '#4F46E5', fontWeight: '600', fontSize: 12 }}>View All</Text>
                            </TouchableOpacity>
                        </View>

                        <ActivityItem
                            title="New user registered"
                            time="2 min ago"
                            icon="person-add"
                            color="#10B981"
                            bg="#dcfce7"
                        />
                        <ActivityItem
                            title="New booking received"
                            time="15 min ago"
                            icon="calendar"
                            color="#3B82F6"
                            bg="#dbeafe"
                        />
                        <ActivityItem
                            title="Vendor verification pending"
                            time="1 hour ago"
                            icon="briefcase"
                            color="#F59E0B"
                            bg="#fef3c7"
                        />
                        <ActivityItem
                            title="Payment received"
                            time="2 hours ago"
                            icon="cash"
                            color="#8B5CF6"
                            bg="#ede9fe"
                        />
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    headerContainer: {
        overflow: 'hidden',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    headerGradient: {
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 24,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        zIndex: 10,
    },
    welcomeText: {
        color: '#c7d2fe',
        fontSize: 18,
        fontWeight: '500',
    },
    adminNameText: {
        color: '#fff',
        fontSize: 30,
        fontWeight: 'bold',
    },
    notificationButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
        borderWidth: 1,
        borderColor: '#fff',
    },
    progressCard: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    progressTitle: {
        color: '#fff',
        fontWeight: '600',
        marginBottom: 8,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 4,
    },
    progressText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        marginTop: 8,
    },
    contentContainer: {
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 40,
        marginTop: -30,
    },
    carousel: {
        marginBottom: 24,
    },
    statsCard: {
        padding: 20,
        borderRadius: 24,
        height: 160,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        position: 'relative',
        overflow: 'hidden',
    },
    statsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    iconContainer: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 12,
        borderRadius: 16,
    },
    changeBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    changeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    statsTitle: {
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
        fontSize: 14,
        marginBottom: 4,
    },
    statsValue: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 32,
    },
    sectionCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        marginBottom: 24,
        marginHorizontal: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
    },
    sectionTitlePadding: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
        paddingHorizontal: 10,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    quickActionWrapper: {
        width: '25%',
        alignItems: 'center',
        marginBottom: 16,
    },
    quickActionBtn: {
        alignItems: 'center',
        padding: 4,
    },
    quickActionIcon: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    quickActionLabel: {
        color: '#374151',
        fontWeight: '500',
        fontSize: 12,
        textAlign: 'center',
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    subTitle: {
        color: '#9ca3af',
        fontSize: 12,
    },
    growthBadge: {
        backgroundColor: '#dcfce7',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
    },
    growthText: {
        color: '#16a34a',
        fontSize: 12,
        fontWeight: 'bold',
    },
    metricsSection: {
        marginBottom: 24,
        marginHorizontal: 10,
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -4,
    },
    metricCardWrapper: {
        width: '50%',
        padding: 4,
    },
    metricCard: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    metricHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    metricLabel: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '500',
        marginLeft: 8,
        flex: 1,
    },
    metricValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    activityIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 2,
    },
    activityTime: {
        fontSize: 12,
        color: '#9ca3af',
    },
});
