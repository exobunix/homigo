import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { WebLayout } from './WebLayout';
import { colors, spacing, typography, shadows, borderRadius, palette } from '../../theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';

const TABS = ['Ongoing', 'History', 'Cancelled'];

const STATUS_CONFIG: any = {
    pending: { label: 'Pending', color: '#FF9800', bg: '#FFF3E0', icon: 'time-outline' },
    accepted: { label: 'Accepted', color: '#2196F3', bg: '#E3F2FD', icon: 'checkmark-circle-outline' },
    confirmed: { label: 'Confirmed', color: '#4CAF50', bg: '#E8F5E9', icon: 'checkbox-outline' },
    on_the_way: { label: 'On the Way', color: '#9C27B0', bg: '#F3E5F5', icon: 'car-outline' },
    arrived: { label: 'Arrived', color: '#00BCD4', bg: '#E0F7FA', icon: 'location-outline' },
    work_started: { label: 'Work Started', color: '#FF5722', bg: '#FBE9E7', icon: 'construct-outline' },
    work_completed: { label: 'Completed', color: '#4CAF50', bg: '#E8F5E9', icon: 'checkmark-done-outline' },
    completed: { label: 'Completed', color: '#4CAF50', bg: '#E8F5E9', icon: 'checkmark-done-outline' },
    cancelled: { label: 'Cancelled', color: '#F44336', bg: '#FFEBEE', icon: 'close-circle-outline' },
    rejected: { label: 'Rejected', color: '#F44336', bg: '#FFEBEE', icon: 'close-circle-outline' },
    cancelled_by_user: { label: 'Cancelled', color: '#F44336', bg: '#FFEBEE', icon: 'close-circle-outline' },
    rejected_by_vendor: { label: 'Rejected', color: '#F44336', bg: '#FFEBEE', icon: 'close-circle-outline' },
    searching_vendor: { label: 'Searching Vendor', color: '#FF9800', bg: '#FFF3E0', icon: 'search-outline' },
    waiting_vendor_response: { label: 'Waiting Response', color: '#FF9800', bg: '#FFF3E0', icon: 'hourglass-outline' },
    waiting_user_approval: { label: 'Awaiting Approval', color: '#FF9800', bg: '#FFF3E0', icon: 'help-circle-outline' },
    no_vendor_available: { label: 'No Vendor', color: '#F44336', bg: '#FFEBEE', icon: 'alert-circle-outline' },
};

export const WebBookings = ({ onNavigate }: { onNavigate: (route: string, params?: any) => void }) => {
    const [activeTab, setActiveTab] = useState('Ongoing');
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [approvingBooking, setApprovingBooking] = useState<string | null>(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await api.getUserBookings('me');
                if (response.success && response.data) {
                    setBookings(response.data);
                }
            } catch (error) {
                console.log('Error fetching bookings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
        const interval = setInterval(fetchBookings, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleApproveVendor = async (bookingId: string) => {
        try {
            setApprovingBooking(bookingId);
            const response = await api.approveNextVendor(bookingId);
            if (response.success) {
                // Refresh bookings
                const updatedBookings = await api.getUserBookings('me');
                if (updatedBookings.success) {
                    setBookings(updatedBookings.data);
                }
            }
        } catch (error) {
            console.log('Error approving vendor:', error);
        } finally {
            setApprovingBooking(null);
        }
    };

    const handleRejectVendor = async (bookingId: string) => {
        try {
            setApprovingBooking(bookingId);
            const response = await api.rejectNextVendor(bookingId);
            if (response.success) {
                // Refresh bookings
                const updatedBookings = await api.getUserBookings('me');
                if (updatedBookings.success) {
                    setBookings(updatedBookings.data);
                }
            }
        } catch (error) {
            console.log('Error rejecting vendor:', error);
        } finally {
            setApprovingBooking(null);
        }
    };

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

    const filteredBookings = getFilteredBookings();

    const renderBookingCard = (item: any) => {
        const statusInfo = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
        const isApproving = approvingBooking === item._id;

        return (
            <TouchableOpacity
                key={item._id || item.id}
                style={styles.bookingCard}
                onPress={() => setSelectedBooking(item)}
            >
                {/* Card Header */}
                <View style={styles.cardHeader}>
                    <View style={styles.serviceInfo}>
                        <View style={[styles.serviceIcon, { backgroundColor: colors.primary + '15' }]}>
                            <Ionicons name="construct-outline" size={24} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.serviceName}>{item.serviceName || 'Service'}</Text>
                            <View style={styles.dateTimeRow}>
                                <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                                <Text style={styles.dateTime}>
                                    {new Date(item.scheduledDate).toLocaleDateString('en-US', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </Text>
                                <Ionicons name="time-outline" size={14} color={colors.textSecondary} style={{ marginLeft: spacing.m }} />
                                <Text style={styles.dateTime}>{item.scheduledTime}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.priceContainer}>
                        <Text style={styles.priceLabel}>Total</Text>
                        <Text style={styles.price}>₹{item.totalAmount || '0'}</Text>
                    </View>
                </View>

                {/* Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                    <Ionicons name={statusInfo.icon} size={16} color={statusInfo.color} />
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                </View>

                {/* Vendor Info (if available) */}
                {item.vendor && (
                    <View style={styles.vendorInfo}>
                        <Ionicons name="person-circle-outline" size={20} color={colors.textSecondary} />
                        <Text style={styles.vendorName}>{item.vendor.name || 'Vendor'}</Text>
                        {item.vendor.rating && (
                            <View style={styles.ratingContainer}>
                                <Ionicons name="star" size={14} color="#FFD700" />
                                <Text style={styles.rating}>{item.vendor.rating}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Proposed Vendor Info (for waiting_user_approval) */}
                {item.status === 'waiting_user_approval' && item.proposedVendorId && (
                    <View style={[styles.vendorInfo, { backgroundColor: '#FFF3E0' }]}>
                        <Ionicons name="person-add-outline" size={20} color="#FF9800" />
                        <Text style={styles.vendorName}>New Vendor: {item.proposedVendorId.name || 'Vendor'}</Text>
                        {item.proposedVendorId.avgRating && (
                            <View style={styles.ratingContainer}>
                                <Ionicons name="star" size={14} color="#FFD700" />
                                <Text style={styles.rating}>{item.proposedVendorId.avgRating}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Action Buttons */}
                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => onNavigate('booking-detail', { booking: item, bookingId: item._id })}
                    >
                        <Text style={styles.actionButtonText}>View Details</Text>
                        <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                    </TouchableOpacity>

                    {item.status === 'waiting_user_approval' && (
                        <>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.primaryAction]}
                                onPress={() => handleApproveVendor(item._id)}
                                disabled={isApproving}
                            >
                                {isApproving ? (
                                    <ActivityIndicator size="small" color={colors.white} />
                                ) : (
                                    <>
                                        <Text style={[styles.actionButtonText, { color: colors.white }]}>Approve</Text>
                                        <Ionicons name="checkmark" size={16} color={colors.white} />
                                    </>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, { borderColor: '#F44336' }]}
                                onPress={() => handleRejectVendor(item._id)}
                                disabled={isApproving}
                            >
                                <Text style={[styles.actionButtonText, { color: '#F44336' }]}>Cancel</Text>
                                <Ionicons name="close" size={16} color="#F44336" />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <WebLayout onNavigate={onNavigate}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
                {/* Page Header */}
                <View style={styles.pageHeader}>
                    <View>
                        <Text style={styles.pageTitle}>My Bookings</Text>
                        <Text style={styles.pageSubtitle}>Track and manage your service bookings</Text>
                    </View>
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{bookings.length}</Text>
                            <Text style={styles.statLabel}>Total</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{getFilteredBookings().length}</Text>
                            <Text style={styles.statLabel}>{activeTab}</Text>
                        </View>
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    {TABS.map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.activeTab]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                            <View style={[styles.tabCount, activeTab === tab && styles.activeTabCount]}>
                                <Text style={[styles.tabCountText, activeTab === tab && styles.activeTabCountText]}>
                                    {tab === 'Ongoing' ? bookings.filter(b => ['pending', 'accepted', 'confirmed', 'on_the_way', 'arrived', 'work_started', 'searching_vendor', 'waiting_vendor_response', 'waiting_user_approval'].includes(b.status)).length :
                                        tab === 'History' ? bookings.filter(b => b.status === 'work_completed' || b.status === 'completed').length :
                                            bookings.filter(b => ['cancelled', 'rejected', 'cancelled_by_user', 'rejected_by_vendor', 'no_vendor_available'].includes(b.status)).length}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Bookings Content */}
                <View style={styles.content}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={styles.loadingText}>Loading bookings...</Text>
                        </View>
                    ) : filteredBookings.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="calendar-outline" size={80} color={colors.textSecondary} />
                            <Text style={styles.emptyTitle}>No {activeTab.toLowerCase()} bookings</Text>
                            <Text style={styles.emptyText}>
                                {activeTab === 'Ongoing' ? 'Book a service to get started!' :
                                    `You don't have any ${activeTab.toLowerCase()} bookings yet.`}
                            </Text>
                            {activeTab === 'Ongoing' && (
                                <>
                                    <TouchableOpacity style={styles.bookNowButton} onPress={() => onNavigate('home')}>
                                        <Text style={styles.bookNowText}>Book a Service</Text>
                                    </TouchableOpacity>

                                    {/* Hint if History has items */}
                                    {bookings.filter(b => b.status === 'work_completed' || b.status === 'completed').length > 0 && (
                                        <TouchableOpacity
                                            style={{ marginTop: spacing.l }}
                                            onPress={() => setActiveTab('History')}
                                        >
                                            <Text style={{ color: colors.primary, fontWeight: '600' }}>
                                                View {bookings.filter(b => b.status === 'work_completed' || b.status === 'completed').length} completed bookings in History
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </>
                            )}
                        </View>
                    ) : (
                        filteredBookings.map(renderBookingCard)
                    )}
                </View>
            </ScrollView>
        </WebLayout>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        maxWidth: 1100,
        alignSelf: 'center',
        width: '100%',
        padding: spacing.xl,
        paddingBottom: spacing.xxl,
    },
    pageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.xl,
    },
    pageTitle: {
        ...typography.h1,
        fontSize: 36,
        marginBottom: spacing.xs,
    },
    pageSubtitle: {
        ...typography.body,
        color: colors.textSecondary,
        fontSize: 16,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.m,
    },
    statCard: {
        backgroundColor: colors.white,
        padding: spacing.m,
        borderRadius: borderRadius.l,
        alignItems: 'center',
        minWidth: 100,
        ...shadows.small,
    },
    statValue: {
        ...typography.h2,
        fontSize: 28,
        color: colors.primary,
    },
    statLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        padding: spacing.xs,
        marginBottom: spacing.xl,
        ...shadows.small,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.m,
        paddingHorizontal: spacing.l,
        borderRadius: borderRadius.l,
        gap: spacing.s,
    },
    activeTab: {
        backgroundColor: colors.primary,
    },
    tabText: {
        ...typography.bodyBold,
        color: colors.textSecondary,
        fontSize: 15,
    },
    activeTabText: {
        color: colors.white,
    },
    tabCount: {
        backgroundColor: palette.gray200,
        paddingHorizontal: spacing.s,
        paddingVertical: 2,
        borderRadius: borderRadius.round,
        minWidth: 24,
        alignItems: 'center',
    },
    activeTabCount: {
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    tabCountText: {
        ...typography.caption,
        fontWeight: '700',
        color: colors.text,
        fontSize: 12,
    },
    activeTabCountText: {
        color: colors.white,
    },
    content: {
        gap: spacing.m,
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: spacing.xxl * 2,
    },
    loadingText: {
        ...typography.body,
        color: colors.textSecondary,
        marginTop: spacing.m,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: spacing.xxl * 2,
    },
    emptyTitle: {
        ...typography.h3,
        fontSize: 24,
        marginTop: spacing.l,
        marginBottom: spacing.s,
    },
    emptyText: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        maxWidth: 400,
    },
    bookNowButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.m,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.m,
        marginTop: spacing.xl,
    },
    bookNowText: {
        ...typography.bodyBold,
        color: colors.white,
    },
    bookingCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        padding: spacing.l,
        ...shadows.medium,
        borderWidth: 1,
        borderColor: palette.gray100,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.m,
    },
    serviceInfo: {
        flex: 1,
        flexDirection: 'row',
        gap: spacing.m,
        alignItems: 'flex-start',
    },
    serviceIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    serviceName: {
        ...typography.h3,
        fontSize: 18,
        marginBottom: spacing.xs,
    },
    dateTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    dateTime: {
        ...typography.caption,
        color: colors.textSecondary,
        fontSize: 13,
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    priceLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    price: {
        ...typography.h3,
        fontSize: 22,
        color: colors.primary,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.m,
        borderRadius: borderRadius.round,
        gap: spacing.xs,
        marginBottom: spacing.m,
    },
    statusText: {
        ...typography.caption,
        fontWeight: '700',
        fontSize: 12,
    },
    vendorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.s,
        paddingVertical: spacing.m,
        paddingHorizontal: spacing.m,
        backgroundColor: palette.gray50,
        borderRadius: borderRadius.m,
        marginBottom: spacing.m,
    },
    vendorName: {
        ...typography.bodyBold,
        flex: 1,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    rating: {
        ...typography.caption,
        fontWeight: '700',
    },
    cardActions: {
        flexDirection: 'row',
        gap: spacing.m,
        marginTop: spacing.s,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.m,
        paddingHorizontal: spacing.l,
        borderRadius: borderRadius.m,
        borderWidth: 1,
        borderColor: colors.primary,
        gap: spacing.xs,
    },
    primaryAction: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    actionButtonText: {
        ...typography.bodyBold,
        color: colors.primary,
        fontSize: 14,
    },
});
