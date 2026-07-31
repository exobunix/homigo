import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../auth/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';
import { useRefresh } from '../../hooks/useRefresh';

export const AnalyticsScreen = ({ onNavigate }: { onNavigate?: (page: string) => void }) => {
    const { admin, logout } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeVendors: 0,
        totalBookings: 0,
        totalServices: 0,
        revenue: 0
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        if (!refreshing) setLoading(true);
        const response = await api.getDashboardStats();
        if (response.success) {
            setStats(response.data.stats);
        }
        setLoading(false);
        setRefreshing(false);
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

    const analyticsCards = [
        {
            title: 'Total Revenue',
            value: `₹${(stats.revenue || 0).toLocaleString()}`,
            change: '+15%',
            icon: 'cash',
            gradient: ['#667eea', '#764ba2'],
            description: 'Total earnings from all bookings'
        },
        {
            title: 'User Growth',
            value: stats.totalUsers.toString(),
            change: '+12%',
            icon: 'people',
            gradient: ['#f093fb', '#f5576c'],
            description: 'New users registered this month'
        },
        {
            title: 'Booking Rate',
            value: stats.totalBookings.toString(),
            change: '+8%',
            icon: 'calendar',
            gradient: ['#4facfe', '#00f2fe'],
            description: 'Total bookings processed'
        },
        {
            title: 'Active Vendors',
            value: stats.activeVendors.toString(),
            change: '+5%',
            icon: 'briefcase',
            gradient: ['#43e97b', '#38f9d7'],
            description: 'Vendors currently active'
        }
    ];

    return (
        <ScreenWrapper
            title="Analytics"
            onLogout={logout}
            adminName={admin?.name || 'Admin'}
            currentPage="analytics"
            onNavigate={onNavigate}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Performance Overview</Text>
                    <Text style={styles.subtitle}>Key metrics and growth indicators</Text>
                </View>

                <View style={styles.grid}>
                    {analyticsCards.map((card, index) => (
                        <TouchableOpacity key={index} style={styles.card} activeOpacity={0.9}>
                            <LinearGradient
                                colors={card.gradient as any}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.cardHeader}
                            >
                                <View style={styles.iconContainer}>
                                    <Ionicons name={card.icon as any} size={24} color="#fff" />
                                </View>
                                <View style={styles.changeBadge}>
                                    <Ionicons name="trending-up" size={14} color="#fff" />
                                    <Text style={styles.changeText}>{card.change}</Text>
                                </View>
                            </LinearGradient>

                            <View style={styles.cardContent}>
                                <Text style={styles.cardValue}>{card.value}</Text>
                                <Text style={styles.cardTitle}>{card.title}</Text>
                                <Text style={styles.cardDescription}>{card.description}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Additional Charts Placeholder */}
                <View style={styles.chartSection}>
                    <Text style={styles.sectionTitle}>Revenue Trend</Text>
                    <View style={styles.chartPlaceholder}>
                        <LinearGradient
                            colors={['#f8fafc', '#f1f5f9']}
                            style={styles.chartBg}
                        >
                            <Ionicons name="bar-chart" size={48} color="#cbd5e1" />
                            <Text style={styles.chartText}>Chart visualization coming soon</Text>
                        </LinearGradient>
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    content: {
        paddingBottom: 24,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 32,
    },
    card: {
        width: '47%', // Responsive width for 2 columns
        minWidth: 150,
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    cardHeader: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        height: 80,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    changeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    changeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    cardContent: {
        padding: 16,
        paddingTop: 8,
    },
    cardValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 8,
    },
    cardDescription: {
        fontSize: 12,
        color: '#94a3b8',
        lineHeight: 16,
    },
    chartSection: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 16,
    },
    chartPlaceholder: {
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
    },
    chartBg: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chartText: {
        marginTop: 12,
        color: '#94a3b8',
        fontWeight: '500',
    },
});
