import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Animated, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import { api } from '../../services/api';

export const TrackJobScreen = ({ navigation, route }: any) => {
    const { colors } = useTheme();
    const { bookingId } = route.params || {};
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Status Logic
    const [statusIndex, setStatusIndex] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        if (!bookingId) {
            setLoading(false);
            return;
        }

        const fetchBooking = async () => {
            try {
                const response = await api.getBookingById(bookingId);
                if (response.success) {
                    setBooking(response.data);
                    updateTimeline(response.data);
                }
            } catch (error) {
                console.error('Fetch booking error', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
        const interval = setInterval(fetchBooking, 4000); // Real time updates

        return () => clearInterval(interval);
    }, [bookingId]);

    const updateTimeline = (data: any) => {
        const { status } = data;
        let index = 0;
        if (['pending', 'searching_vendor'].includes(status)) index = 0;
        else if (['accepted', 'confirmed', 'on_the_way', 'arrived'].includes(status)) index = 1;
        else if (['work_started'].includes(status)) index = 2;
        else if (['work_completed', 'completed'].includes(status)) index = 3;

        // Handle cancelled/rejected?
        // For line rendering purposes, we use simple index progress
        setStatusIndex(index);
    };

    const getFormattedTime = (dateStr?: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };

    const steps = [
        {
            title: 'Booking Received',
            time: getFormattedTime(booking?.createdAt),
            active: true,
            completed: statusIndex >= 0
        },
        {
            title: 'Vendor Accepted',
            time: (booking?.acceptedAt || (['accepted', 'confirmed', 'on_the_way', 'arrived', 'work_started', 'work_completed', 'completed'].includes(booking?.status) ? booking?.updatedAt : null)) ? getFormattedTime(booking?.acceptedAt || booking?.updatedAt) : '-',
            active: statusIndex >= 1,
            completed: statusIndex >= 1
        },
        {
            title: 'Job Started',
            time: booking?.startedAt ? getFormattedTime(booking.startedAt) : '-',
            active: statusIndex >= 2,
            completed: statusIndex >= 2
        },
        {
            title: 'Work Completed',
            time: booking?.completedAt ? getFormattedTime(booking.completedAt) : '-',
            active: statusIndex >= 3,
            completed: statusIndex >= 3
        },
    ];

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    if (!booking) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={{ textAlign: 'center', marginTop: 20, color: colors.text }}>Booking not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Track Job</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView ref={scrollViewRef} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Map Section */}
                {/* Map Section Removed */}

                <View style={[styles.contentContainer, { backgroundColor: colors.background }]}>

                    {/* Vendor Card */}
                    {booking.vendorId ? (
                        <View style={[styles.card, { backgroundColor: colors.surface }]}>
                            <View style={styles.providerRow}>
                                <Image
                                    source={{ uri: booking.vendorId.profileImage || 'https://randomuser.me/api/portraits/men/32.jpg' }}
                                    style={styles.providerImage}
                                />
                                <View style={styles.providerInfo}>
                                    <Text style={[styles.providerName, { color: colors.text }]}>{booking.vendorId.name}</Text>
                                    <Text style={[styles.providerRole, { color: colors.textSecondary }]}>Service Provider</Text>
                                    <View style={styles.ratingRow}>
                                        <Ionicons name="star" size={14} color="#FFD700" />
                                        <Text style={[styles.ratingText, { color: colors.textSecondary }]}>{booking.vendorId.avgRating || 4.8}</Text>
                                    </View>
                                </View>
                                <View style={styles.contactButtons}>
                                    <TouchableOpacity
                                        style={[styles.callButton, { backgroundColor: colors.primary }]}
                                        onPress={() => Linking.openURL(`tel:${booking.vendorId.phone}`)}
                                    >
                                        <Ionicons name="call" size={20} color={colors.white} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ) : null}

                    {/* Timeline */}
                    <View style={[styles.card, { backgroundColor: colors.surface, marginTop: spacing.m }]}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>Job Status Timeline</Text>
                        <View style={styles.timeline}>
                            {steps.map((step, index) => (
                                <View key={index} style={styles.timelineItem}>
                                    <View style={styles.timelineLeft}>
                                        <View style={[
                                            styles.timelineDot,
                                            { backgroundColor: colors.surface, borderColor: colors.border },
                                            step.completed && { backgroundColor: '#10b981', borderColor: '#10b981' }
                                        ]}>
                                            {step.completed && <Ionicons name="checkmark" size={12} color={colors.white} />}
                                        </View>
                                        {index < steps.length - 1 && (
                                            <View style={[
                                                styles.timelineLine,
                                                { backgroundColor: colors.border },
                                                (index < statusIndex) && { backgroundColor: '#10b981' }
                                            ]} />
                                        )}
                                    </View>
                                    <View style={styles.timelineContent}>
                                        <Text style={[
                                            styles.timelineStepTitle,
                                            { color: colors.textSecondary },
                                            step.active && { color: colors.text, fontWeight: 'bold' }
                                        ]}>{step.title}</Text>
                                        <Text style={[styles.timelineTime, { color: colors.textSecondary }]}>{step.time}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Actions Card Removed */}

                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.m,
        zIndex: 10,
    },
    backButton: {
        padding: spacing.xs,
    },
    headerTitle: {
        ...typography.h2,
    },
    mapContainer: {
        height: 250,
        width: '100%',
        position: 'relative',
    },
    mapImage: {
        width: '100%',
        height: '100%',
    },
    providerMarker: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerImage: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        zIndex: 2,
    },
    markerPulse: {
        position: 'absolute',
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(233, 30, 99, 0.3)',
        zIndex: 1,
    },
    contentContainer: {
        flex: 1,
        padding: spacing.m,
        marginTop: -20,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
    },
    card: {
        padding: spacing.m,
        borderRadius: borderRadius.m,
        ...shadows.small,
    },
    cardTitle: {
        ...typography.h3,
        marginBottom: spacing.m,
    },
    providerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    providerImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: spacing.m,
    },
    providerInfo: {
        flex: 1,
    },
    providerName: {
        ...typography.h3,
        fontSize: 16,
    },
    providerRole: {
        ...typography.caption,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    ratingText: {
        ...typography.caption,
        marginLeft: 4,
    },
    contactButtons: {
        flexDirection: 'row',
    },
    callButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timeline: {
        paddingLeft: spacing.s,
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 24,
        minHeight: 40,
    },
    timelineLeft: {
        alignItems: 'center',
        marginRight: spacing.m,
        width: 20,
    },
    timelineDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    timelineLine: {
        position: 'absolute',
        top: 20,
        bottom: -24,
        width: 2,
        zIndex: 1,
    },
    timelineContent: {
        flex: 1,
        justifyContent: 'center',
    },
    timelineStepTitle: {
        ...typography.body,
        marginBottom: 2,
    },
    timelineTime: {
        ...typography.caption,
    },
    actionButtonFull: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: borderRadius.m,
    },
    actionButtonFullText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    actionButtonOutline: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: borderRadius.m,
        borderWidth: 1,
    },
    actionButtonOutlineText: {
        fontWeight: '600',
        fontSize: 14,
    }
});
