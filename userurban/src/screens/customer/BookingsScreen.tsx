import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography, shadows, borderRadius } from '../../theme/tokens';
import { Ionicons } from '@expo/vector-icons';



const TABS = ['Ongoing', 'History', 'Cancelled'];

export const BookingsScreen = ({ navigation }: any) => {
    const { colors, isDark } = useTheme();
    const [activeTab, setActiveTab] = useState('Ongoing');
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch bookings from backend
    React.useEffect(() => {
        let intervalId: NodeJS.Timeout;

        const fetchBookings = async () => {
            try {
                const { api } = require('../../services/api');
                // Use 'me' to fetch bookings for the currently authenticated user
                const response = await api.getUserBookings('me');

                if (response.success) {
                    setBookings(response.data);
                }
            } catch (error) {
                console.log('Error fetching bookings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
        // Poll every 5 seconds
        intervalId = setInterval(fetchBookings, 5000);

        return () => clearInterval(intervalId);
    }, []);

    const getFilteredBookings = () => {
        if (activeTab === 'Ongoing') {
            return bookings.filter(b => ['pending', 'accepted', 'confirmed', 'on_the_way', 'arrived', 'work_started', 'searching_vendor', 'waiting_vendor_response', 'waiting_user_approval'].includes(b.status));
        }
        if (activeTab === 'History') {
            return bookings.filter(b => b.status === 'work_completed' || b.status === 'completed');
        }
        if (activeTab === 'Cancelled') {
            return bookings.filter(b => ['cancelled', 'rejected', 'cancelled_by_user', 'rejected_by_vendor', 'no_vendor_available'].includes(b.status));
        }
        return [];
    };

    const handleTrack = (booking: any) => {
        navigation.navigate('TrackJobScreen', { bookingId: booking._id || booking.id });
    };

    const handleRate = () => {
        Alert.alert('Rate Service', 'Thank you for rating!');
    };

    const handleApproval = async (bookingId: string, action: 'approve' | 'reject') => {
        try {
            const { api } = require('../../services/api');
            const response = await api.approveBooking(bookingId, action);
            if (response.success) {
                Alert.alert('Success', action === 'approve' ? 'Vendor approved!' : 'Booking cancelled.');
                // Refresh bookings
                const res = await api.getUserBookings('me');
                if (res.success) setBookings(res.data);
            }
        } catch (error) {
            console.error('Approval error:', error);
            Alert.alert('Error', 'Failed to process request.');
        }
    };

    const renderItem = ({ item }: any) => {
        if (item.status === 'waiting_user_approval') {
            return (
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.primary, borderWidth: 1 }]}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="alert-circle" size={24} color={colors.primary} />
                        <View style={styles.headerInfo}>
                            <Text style={[styles.serviceName, { color: colors.text }]}>Action Required</Text>
                            <Text style={[styles.dateTime, { color: colors.textSecondary }]}>
                                Previous vendor declined.
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <Text style={{ color: colors.text, marginBottom: 8 }}>
                        Recommended Alternative:
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#eee', marginRight: 12 }} />
                        <View>
                            <Text style={{ fontWeight: 'bold', color: colors.text }}>{item.proposedVendorId?.name || 'Vendor B'}</Text>
                            <Text style={{ color: colors.textSecondary }}>Rating: {item.proposedVendorId?.avgRating || 4.8} ⭐</Text>
                        </View>
                    </View>

                    <View style={styles.cardFooter}>
                        <TouchableOpacity
                            onPress={() => handleApproval(item._id, 'reject')}
                            style={[styles.actionButtonOutline, { borderColor: colors.error, flex: 1, marginRight: 8 }]}
                        >
                            <Text style={[styles.actionButtonTextOutline, { color: colors.error, textAlign: 'center' }]}>Cancel Request</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleApproval(item._id, 'approve')}
                            style={[styles.actionButton, { backgroundColor: colors.primary, flex: 1, marginLeft: 8 }]}
                        >
                            <Text style={[styles.actionButtonText, { color: colors.white, textAlign: 'center' }]}>Approve</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        return (
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <View style={styles.cardHeader}>
                    <View style={[styles.serviceIconContainer, { backgroundColor: isDark ? colors.surfaceHighlight : colors.background }]}>
                        <Ionicons name="construct-outline" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={[styles.serviceName, { color: colors.text }]}>{item.serviceName || item.items?.[0]?.name || item.items?.[0]?.title || 'Service'}</Text>
                        <Text style={[styles.dateTime, { color: colors.textSecondary }]}>
                            {item.scheduledDate} • {item.scheduledTime}
                        </Text>
                    </View>
                    <Text style={[styles.price, { color: colors.text }]}>${item.totalAmount}</Text>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <View style={styles.cardFooter}>
                    <View style={styles.statusContainer}>
                        <View style={[styles.statusDot, {
                            backgroundColor: ['pending', 'accepted', 'on_the_way', 'arrived', 'work_started', 'confirmed'].includes(item.status) ? colors.primary :
                                ['work_completed', 'completed'].includes(item.status) ? colors.success :
                                    ['searching_vendor', 'waiting_vendor_response'].includes(item.status) ? colors.warning : colors.error
                        }]} />
                        <Text style={[styles.statusText, {
                            color: ['pending', 'accepted', 'on_the_way', 'arrived', 'work_started', 'confirmed'].includes(item.status) ? colors.primary :
                                ['work_completed', 'completed'].includes(item.status) ? colors.success :
                                    ['searching_vendor', 'waiting_vendor_response'].includes(item.status) ? colors.warning : colors.error
                        }]}>
                            {item.status.replace(/_/g, ' ').toUpperCase()}
                        </Text>
                    </View>

                    {['pending', 'accepted', 'on_the_way', 'arrived', 'work_started', 'confirmed'].includes(item.status) && (
                        <TouchableOpacity onPress={() => handleTrack(item)} style={[styles.actionButton, { backgroundColor: colors.primary }]}>
                            <Text style={[styles.actionButtonText, { color: colors.white }]}>Track Job</Text>
                        </TouchableOpacity>
                    )}
                    {['work_completed', 'completed'].includes(item.status) && (
                        <TouchableOpacity onPress={handleRate} style={[styles.actionButtonOutline, { borderColor: colors.border }]}>
                            <Text style={[styles.actionButtonTextOutline, { color: colors.text }]}>Rate</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>My Bookings</Text>
            </View>

            <View style={[styles.tabsContainer, { backgroundColor: colors.background }]}>
                {TABS.map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && { borderBottomColor: colors.primary }]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, { color: activeTab === tab ? colors.primary : colors.textSecondary }]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={getFilteredBookings()}
                keyExtractor={(item, index) => item._id || item.id || index.toString()}
                contentContainerStyle={styles.listContent}
                renderItem={renderItem}
                refreshing={loading}
                onRefresh={() => {
                    setLoading(true);
                    const { api } = require('../../services/api');
                    api.getUserBookings('me').then((response: any) => {
                        if (response.success) {
                            console.log('Fetched Bookings Sample:', JSON.stringify(response.data[0], null, 2));
                            setBookings(response.data);
                        }
                        setLoading(false);
                    }).catch(() => setLoading(false));
                }}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No {activeTab.toLowerCase()} bookings found</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: spacing.m,
        borderBottomWidth: 1,
    },
    headerTitle: {
        ...typography.h2,
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.m,
        paddingBottom: spacing.s,
    },
    tab: {
        marginRight: spacing.l,
        paddingVertical: spacing.s,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabText: {
        ...typography.body,
        fontWeight: '600',
    },
    listContent: {
        padding: spacing.m,
    },
    card: {
        borderRadius: borderRadius.m,
        padding: spacing.m,
        marginBottom: spacing.m,
        ...shadows.small,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    serviceIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.m,
    },
    headerInfo: {
        flex: 1,
    },
    serviceName: {
        ...typography.bodyBold,
        marginBottom: 2,
    },
    dateTime: {
        ...typography.caption,
    },
    price: {
        ...typography.bodyBold,
    },
    divider: {
        height: 1,
        marginVertical: spacing.m,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: spacing.s,
    },
    statusText: {
        ...typography.caption,
        fontWeight: '600',
    },
    actionButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: borderRadius.s,
    },
    actionButtonText: {
        ...typography.caption,
        fontWeight: '600',
    },
    actionButtonOutline: {
        borderWidth: 1,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: borderRadius.s,
    },
    actionButtonTextOutline: {
        ...typography.caption,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: spacing.xxl,
    },
    emptyText: {
        ...typography.body,
        marginTop: spacing.m,
    }
});
