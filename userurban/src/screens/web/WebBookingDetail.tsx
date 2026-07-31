import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Platform } from 'react-native';
import { WebLayout } from './WebLayout';
import { colors, spacing, typography, shadows, borderRadius, palette } from '../../theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';

interface WebBookingDetailProps {
    onNavigate: (route: string, params?: any) => void;
    params: {
        booking?: any;
        bookingId?: string;
    };
}

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
};

export const WebBookingDetail: React.FC<WebBookingDetailProps> = ({ onNavigate, params }) => {
    const [booking, setBooking] = useState<any>(params.booking || null);
    const [loading, setLoading] = useState(!params.booking);
    const [otpData, setOtpData] = useState<{ otp: string, bookingId: string } | null>(null);
    const [otpLoading, setOtpLoading] = useState(false);

    useEffect(() => {
        if (!booking && params.bookingId) {
            fetchBookingDetails();
        }
    }, [params.bookingId]);

    const fetchBookingDetails = async () => {
        try {
            if (params.bookingId) {
                const response = await api.getBookingById(params.bookingId);
                if (response.success && response.data) {
                    setBooking(response.data);
                }
            }
        } catch (error) {
            console.error('Error fetching booking details:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch OTP for active bookings
    useEffect(() => {
        if (booking && ['pending', 'accepted', 'confirmed', 'on_the_way', 'arrived', 'work_started', 'waiting_vendor_response'].includes(booking.status)) {
            fetchOtp();
        }
    }, [booking]);

    const fetchOtp = async () => {
        if (!booking?._id) return;
        try {
            setOtpLoading(true);
            const response = await api.getBookingOtp(booking._id);
            if (response.success && response.data) {
                setOtpData(response.data);
            }
        } catch (error) {
            console.error('Error fetching OTP:', error);
        } finally {
            setOtpLoading(false);
        }
    };

    if (loading) {
        return (
            <WebLayout onNavigate={onNavigate}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </WebLayout>
        );
    }

    if (!booking) {
        return (
            <WebLayout onNavigate={onNavigate}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
                    <Text style={styles.errorText}>Booking not found</Text>
                    <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('bookings')}>
                        <Text style={styles.backButtonText}>Back to Bookings</Text>
                    </TouchableOpacity>
                </View>
            </WebLayout>
        );
    }

    const statusInfo = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;

    // Cancellation Logic (5 minutes window)
    const [cancelTimeLeft, setCancelTimeLeft] = useState(0);

    useEffect(() => {
        if (!booking) return;
        const checkTimer = () => {
            const createdAt = new Date(booking.createdAt).getTime();
            const now = Date.now();
            const diff = now - createdAt;
            const limit = 5 * 60 * 1000; // 5 minutes
            if (diff < limit) {
                setCancelTimeLeft(Math.ceil((limit - diff) / 1000));
            } else {
                setCancelTimeLeft(0);
            }
        };
        checkTimer();
        const interval = setInterval(checkTimer, 1000);
        return () => clearInterval(interval);
    }, [booking]);

    const formatCancelTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleCancelBooking = async () => {
        if (!booking?._id) return;
        // Simple web confirmation
        if (Platform.OS === 'web' && !window.confirm('Are you sure you want to cancel?')) return;

        try {
            setLoading(true);
            const res = await api.cancelBooking(booking._id);
            if (res.success) {
                // Navigate back to bookings list
                onNavigate('bookings');
            } else {
                // Handle error (maybe toast in future)
                console.warn(res.message);
            }
        } catch (error) {
            console.error('Cancel failed', error);
        } finally {
            setLoading(false);
        }
    };

    const scrollViewRef = useRef<ScrollView>(null);

    return (
        <WebLayout onNavigate={onNavigate}>
            <ScrollView ref={scrollViewRef} style={styles.container} contentContainerStyle={styles.contentContainer}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => onNavigate('bookings')} style={styles.headerBack}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                        <Text style={styles.headerTitle}>Booking Details</Text>
                    </TouchableOpacity>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                        <Ionicons name={statusInfo.icon} size={18} color={statusInfo.color} />
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                    </View>
                </View>

                <View style={styles.grid}>
                    {/* Left Column: Service & Payment */}
                    <View style={styles.leftColumn}>

                        {/* Service Card */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>Service Information</Text>
                            </View>
                            <View style={styles.serviceRow}>
                                <View style={[styles.serviceIcon, { backgroundColor: colors.primary + '15' }]}>
                                    <Ionicons name="construct-outline" size={28} color={colors.primary} />
                                </View>
                                <View>
                                    <Text style={styles.serviceName}>{booking.serviceName}</Text>
                                    <View style={styles.metaRow}>
                                        <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                                        <Text style={styles.metaText}>{new Date(booking.scheduledDate).toDateString()}</Text>
                                        <View style={styles.dotSeparator} />
                                        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                                        <Text style={styles.metaText}>{booking.scheduledTime}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.addressRow}>
                                <Ionicons name="location-outline" size={20} color={colors.primary} />
                                <View>
                                    <Text style={styles.addressLabel}>Service Location</Text>
                                    <Text style={styles.addressValue}>{booking.address || booking.customerLocation?.address || 'Address not available'}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Payment Card */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>Payment Details</Text>
                            </View>

                            {booking.items && booking.items.length > 0 ? (
                                booking.items.map((item: any, idx: number) => (
                                    <View key={idx} style={styles.billRow}>
                                        <Text style={styles.billLabel}>{item.name} x{item.qty}</Text>
                                        <Text style={styles.billValue}>₹{item.price * item.qty}</Text>
                                    </View>
                                ))
                            ) : (
                                <View style={styles.billRow}>
                                    <Text style={styles.billLabel}>Base Price</Text>
                                    <Text style={styles.billValue}>₹{booking.amount || booking.totalAmount}</Text>
                                </View>
                            )}

                            <View style={styles.divider} />

                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Total Amount</Text>
                                <Text style={styles.totalValue}>₹{booking.totalAmount}</Text>
                            </View>
                        </View>

                    </View>

                    {/* Right Column: Vendor & Actions */}
                    <View style={styles.rightColumn}>

                        {/* Vendor Card */}
                        {booking.vendor ? (
                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardTitle}>Provider Details</Text>
                                </View>
                                <View style={styles.vendorProfile}>
                                    <View style={styles.avatarContainer}>
                                        {booking.vendor.profileImage ? (
                                            <Image source={{ uri: booking.vendor.profileImage }} style={styles.avatar as any} />
                                        ) : (
                                            <View style={styles.avatarPlaceholder}>
                                                <Text style={styles.avatarText}>{booking.vendor.name?.charAt(0) || 'V'}</Text>
                                            </View>
                                        )}
                                        <View style={styles.verifiedBadge}>
                                            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                                        </View>
                                    </View>
                                    <Text style={styles.vendorName}>{booking.vendor.name}</Text>
                                    <View style={styles.ratingBadge}>
                                        <Ionicons name="star" size={12} color={colors.white} />
                                        <Text style={styles.ratingText}>{booking.vendor.rating || '4.8'}</Text>
                                    </View>
                                </View>

                                <View style={styles.actionGrid}>
                                    <TouchableOpacity style={styles.actionBtn}>
                                        <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
                                        <Text style={styles.actionBtnText}>Chat</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.actionBtn}>
                                        <Ionicons name="call-outline" size={20} color={colors.primary} />
                                        <Text style={styles.actionBtnText}>Call</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>Provider</Text>
                                <View style={styles.noVendor}>
                                    <Ionicons name="search-outline" size={32} color={colors.textSecondary} />
                                    <Text style={styles.noVendorText}>Looking for a provider...</Text>
                                </View>
                            </View>
                        )}


                        {/* OTP Card - Show for active bookings */}
                        {otpData && !['work_completed', 'completed'].includes(booking.status) && (
                            <View style={styles.otpCard}>
                                <View style={styles.otpCardHeader}>
                                    <Ionicons name="key-outline" size={24} color={colors.primary} />
                                    <Text style={styles.otpCardTitle}>Service Completion OTP</Text>
                                </View>
                                <Text style={styles.otpCode}>{otpData.otp}</Text>
                                <Text style={styles.otpHint}>
                                    Share this OTP with the vendor when service is complete
                                </Text>
                                <View style={styles.bookingIdRow}>
                                    <Text style={styles.bookingIdLabel}>Booking ID:</Text>
                                    <Text style={styles.bookingIdValue}>{otpData.bookingId}</Text>
                                </View>
                            </View>
                        )}

                        {/* Service Completed Banner */}
                        {['work_completed', 'completed'].includes(booking.status) && (
                            <View style={styles.completedCard}>
                                <View style={styles.completedHeader}>
                                    <Ionicons name="checkmark-circle" size={32} color={colors.success} />
                                    <Text style={styles.completedTitle}>Service Completed</Text>
                                </View>
                                <Text style={styles.completedSubtitle}>
                                    Your service has been marked as completed. Thank you for using our platform!
                                </Text>
                                <TouchableOpacity style={styles.ratingButton}>
                                    <Ionicons name="star-outline" size={18} color={colors.primary} />
                                    <Text style={styles.ratingButtonText}>Rate Service</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Action Card */}
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Actions</Text>

                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={() => onNavigate('track-job', { bookingId: booking._id })}
                            >
                                <Ionicons name="map-outline" size={18} color={colors.white} />
                                <Text style={styles.primaryButtonText}>Track Job</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.outlineButton}
                                onPress={() => onNavigate('help')}
                            >
                                <Text style={styles.outlineButtonText}>Need Help?</Text>
                            </TouchableOpacity>

                            {cancelTimeLeft > 0 && ['pending', 'accepted', 'confirmed', 'searching_vendor', 'waiting_vendor_response'].includes(booking.status) && (
                                <TouchableOpacity
                                    style={[styles.outlineButton, { borderColor: colors.error }]}
                                    onPress={handleCancelBooking}
                                >
                                    <Text style={[styles.outlineButtonText, { color: colors.error }]}>
                                        Cancel Booking ({formatCancelTime(cancelTimeLeft)})
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                    </View>
                </View>

            </ScrollView>
        </WebLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    contentContainer: {
        maxWidth: 1100,
        width: '100%',
        alignSelf: 'center',
        padding: spacing.xl,
        paddingBottom: spacing.xxl,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 600,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 500,
        gap: spacing.m,
    },
    errorText: {
        ...typography.h3,
        color: colors.textSecondary,
    },
    backButton: {
        padding: spacing.m,
        backgroundColor: colors.white,
        borderRadius: borderRadius.m,
        ...shadows.small,
    },
    backButtonText: {
        color: colors.primary,
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    headerBack: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.m,
    },
    headerTitle: {
        ...typography.h2,
        fontSize: 28,
        color: colors.black,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.s,
        paddingHorizontal: spacing.l,
        borderRadius: borderRadius.round,
        gap: 6,
    },
    statusText: {
        fontWeight: '700',
        fontSize: 14,
    },
    grid: {
        flexDirection: 'row',
        gap: spacing.xl,
        flexWrap: 'wrap',
    },
    leftColumn: {
        flex: 2,
        minWidth: 350,
        gap: spacing.l,
    },
    rightColumn: {
        flex: 1,
        minWidth: 300,
        gap: spacing.l,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        padding: spacing.l,
        ...shadows.medium,
        borderWidth: 1,
        borderColor: palette.gray100,
    },
    cardHeader: {
        marginBottom: spacing.l,
    },
    cardTitle: {
        ...typography.h3,
        fontSize: 18,
        color: colors.text,
    },
    serviceRow: {
        flexDirection: 'row',
        gap: spacing.m,
        alignItems: 'center',
    },
    serviceIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    serviceName: {
        ...typography.h3,
        fontSize: 20,
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    dotSeparator: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.textSecondary,
        marginHorizontal: 2,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: spacing.l,
    },
    addressRow: {
        flexDirection: 'row',
        gap: spacing.m,
        alignItems: 'flex-start',
    },
    addressLabel: {
        fontWeight: '600',
        color: colors.text,
        marginBottom: 2,
    },
    addressValue: {
        color: colors.textSecondary,
        maxWidth: 400,
        lineHeight: 20,
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.s,
    },
    billLabel: {
        color: colors.textSecondary,
        fontSize: 15,
    },
    billValue: {
        color: colors.text,
        fontWeight: '500',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontWeight: '700',
        fontSize: 16,
    },
    totalValue: {
        fontWeight: '800',
        fontSize: 24,
        color: colors.primary,
    },
    vendorProfile: {
        alignItems: 'center',
        marginBottom: spacing.l,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: spacing.s,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: palette.gray200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '700',
        color: colors.textSecondary,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.white,
        borderRadius: 10,
    },
    vendorName: {
        ...typography.h3,
        fontSize: 18,
        marginBottom: 4,
    },
    ratingBadge: {
        flexDirection: 'row',
        backgroundColor: colors.success,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        color: colors.white,
        fontWeight: '700',
        fontSize: 12,
    },
    actionGrid: {
        flexDirection: 'row',
        gap: spacing.m,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.s,
        borderRadius: borderRadius.m,
        backgroundColor: colors.background,
        gap: 6,
    },
    actionBtnText: {
        fontWeight: '600',
        color: colors.primary,
    },
    noVendor: {
        alignItems: 'center',
        padding: spacing.l,
        gap: spacing.m,
    },
    noVendorText: {
        color: colors.textSecondary,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.m,
        borderRadius: borderRadius.m,
        marginBottom: spacing.m,
        gap: 8,
    },
    primaryButtonText: {
        color: colors.white,
        fontWeight: '700',
        fontSize: 16,
    },
    outlineButton: {
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: spacing.m,
        borderRadius: borderRadius.m,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.s,
    },
    outlineButtonText: {
        color: colors.text,
        fontWeight: '600',
    },
    // OTP Card Styles
    otpCard: {
        backgroundColor: '#F0FDF4', // Light green background
        borderRadius: borderRadius.xl,
        padding: spacing.l,
        borderWidth: 2,
        borderColor: colors.success,
        marginBottom: spacing.l,
    },
    otpCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.s,
        marginBottom: spacing.m,
    },
    otpCardTitle: {
        ...typography.h3,
        fontSize: 16,
        color: colors.success,
    },
    otpCode: {
        fontSize: 48,
        fontWeight: '800',
        letterSpacing: 12,
        textAlign: 'center',
        color: colors.text,
        marginVertical: spacing.m,
        fontFamily: 'monospace',
    },
    otpHint: {
        textAlign: 'center',
        color: colors.textSecondary,
        fontSize: 14,
        marginBottom: spacing.m,
    },
    bookingIdRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.s,
        paddingTop: spacing.m,
        borderTopWidth: 1,
        borderTopColor: colors.success + '30',
    },
    bookingIdLabel: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    bookingIdValue: {
        fontWeight: '700',
        fontSize: 14,
        color: colors.text,
        fontFamily: 'monospace',
    },
    // Service Completed Styles
    completedCard: {
        backgroundColor: '#F0FDF4',
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.success,
        marginBottom: spacing.l,
        alignItems: 'center',
    },
    completedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.m,
        marginBottom: spacing.m,
    },
    completedTitle: {
        ...typography.h3,
        fontSize: 22,
        color: colors.success,
    },
    completedSubtitle: {
        textAlign: 'center',
        color: colors.text,
        fontSize: 16,
        marginBottom: spacing.l,
    },
    ratingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.primary,
        paddingHorizontal: spacing.l,
        paddingVertical: spacing.m,
        borderRadius: borderRadius.m,
        gap: 8,
    },
    ratingButtonText: {
        color: colors.primary,
        fontWeight: '700',
        fontSize: 16,
    },
});
