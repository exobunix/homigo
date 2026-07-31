import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Modal, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { Card, Text, Button, Chip, Divider, Avatar, TextInput, IconButton, Portal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchActiveBookings, fetchCompletedBookings, acceptBooking, rejectBooking, updateBookingStatus } from '@/store/slices/bookingSlice';
import WebLayout from '@/components/WebLayout';
import { theme } from '@/theme/theme';
import { bookingAPI } from '@/services/api';

export default function BookingDetail({ route, navigation }: any) {
    const { bookingId } = route.params || {};
    const { activeBookings, completedBookings } = useAppSelector((state) => state.booking);
    const dispatch = useAppDispatch();

    // OTP State for starting job


    // OTP State for completing job
    const [showCompleteOtpModal, setShowCompleteOtpModal] = React.useState(false);
    const [completionOtp, setCompletionOtp] = React.useState('');
    const [completingJob, setCompletingJob] = React.useState(false);
    const [otpError, setOtpError] = React.useState('');

    useEffect(() => {
        if (activeBookings.length === 0 && completedBookings.length === 0) {
            dispatch(fetchActiveBookings());
            dispatch(fetchCompletedBookings(1));
        }
    }, [dispatch, activeBookings.length, completedBookings.length]);

    const mockBookings = [
        {
            id: 'demo-1',
            customerName: 'Rahul Verma',
            serviceName: 'AC Service',
            scheduledTime: '4:30 PM',
            address: 'Andheri West, Mumbai',
            status: 'pending',
            amount: 750,
            items: [{ name: 'AC Service', qty: 1, price: '₹750' }]
        },
        {
            id: 'demo-2',
            customerName: 'Sneha Kapoor',
            serviceName: 'Deep Cleaning',
            scheduledTime: '6:00 PM',
            address: 'Bandra East, Mumbai',
            status: 'on_the_way',
            amount: 1200,
            items: [{ name: 'Deep Cleaning', qty: 1, price: '₹1200' }]
        },
        {
            id: 'demo-3',
            customerName: 'Karan Singh',
            serviceName: 'Full Home Cleaning',
            scheduledTime: '2:00 PM',
            address: 'Powai, Mumbai',
            status: 'work_completed',
            amount: 1500,
            items: [{ name: 'Full Home Cleaning', qty: 1, price: '₹1500' }]
        }
    ];

    const reduxBooking = (activeBookings.find((b: any) => b.id === bookingId) || completedBookings.find((b: any) => b.id === bookingId) || mockBookings.find(b => b.id === bookingId)) as any;

    // Local state to handle immediate updates (like completion) before Redux syncs
    const [completedBookingData, setCompletedBookingData] = React.useState<any>(null);

    const booking = completedBookingData || reduxBooking;

    const handleAccept = () => {
        if (booking) {
            dispatch(acceptBooking(booking.id));
            navigation.goBack();
        }
    };

    const handleReject = () => {
        if (booking) {
            dispatch(rejectBooking({ bookingId: booking.id, reason: 'Vendor rejected' }));
            navigation.goBack();
        }
    };

    const handleCancel = () => {
        if (booking) {
            dispatch(updateBookingStatus({ bookingId: booking.id, status: 'cancelled' }));
            navigation.goBack();
        }
    };

    if (!booking) {
        return (
            <WebLayout title="Booking Details">
                <View style={styles.centerContainer}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#ef4444" />
                    <Text style={styles.errorText}>Booking not found.</Text>
                    <Button mode="contained" onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
                        Go Back
                    </Button>
                </View>
            </WebLayout>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accepted': return '#3b82f6';
            case 'pending': return '#f59e0b';
            case 'completed': case 'work_completed': return '#10b981';
            case 'cancelled': case 'rejected': case 'rejected_by_vendor': case 'cancelled_by_user': case 'no_vendor_available': return '#ef4444';
            default: return '#64748b';
        }
    };

    const handleStartJob = () => {
        if (window.confirm('Are you sure you want to start the job?')) {
            dispatch(updateBookingStatus({ bookingId: booking.id, status: 'work_started' as any }));
        }
    };

    const handleCompleteJob = () => {
        // Show OTP modal for service completion
        setShowCompleteOtpModal(true);
        setCompletionOtp('');
        setOtpError('');
    };

    const verifyCompletionOtp = async () => {
        if (completionOtp.length !== 6) {
            setOtpError('Please enter 6-digit OTP');
            return;
        }

        setCompletingJob(true);
        setOtpError('');

        try {
            const response = await bookingAPI.verifyCompletionOtp(booking.id, completionOtp);
            if (response.data?.success) {
                // Update local state immediately to reflect changes (hide info, show banner)
                if (response.data.data) {
                    setCompletedBookingData(response.data.data);
                }
                setShowCompleteOtpModal(false);
                // alert('Job Completed Successfully!'); // Optional: removed to be less intrusive since UI updates
                dispatch(fetchActiveBookings());
                dispatch(fetchCompletedBookings(1));
                // navigation.goBack(); // Removed to keep user on the page to see completion status
            } else {
                setOtpError(response.data?.message || 'Invalid OTP');
            }
        } catch (error: any) {
            console.error('OTP verification error:', error);
            setOtpError(error.response?.data?.message || 'Invalid OTP. Please try again.');
        } finally {
            setCompletingJob(false);
        }
    };

    const isJobCompleted = ['work_completed', 'completed'].includes(booking.status);

    const timelineSection = (
        <Card style={[styles.card, { marginTop: 24 }]}>
            <Card.Content>
                <Text style={styles.sectionTitle}>Job Status Timeline</Text>
                <View style={styles.timelineContainer}>
                    {[
                        { title: 'Booking Received', time: booking.createdAt, statusCheck: ['pending', 'confirmed', 'accepted', 'on_the_way', 'arrived', 'work_started', 'work_completed', 'completed'] },
                        { title: 'Vendor Accepted', time: booking.acceptedAt || (booking.status !== 'pending' ? booking.updatedAt : null), statusCheck: ['confirmed', 'accepted', 'on_the_way', 'arrived', 'work_started', 'work_completed', 'completed'] },
                        { title: 'Job Started', time: booking.startedAt, statusCheck: ['work_started', 'work_completed', 'completed'] },
                        { title: 'Work Completed', time: booking.otpVerifiedAt || booking.completedAt, statusCheck: ['work_completed', 'completed'] }
                    ].map((step, index, arr) => {
                        // Check if this step is completed based on current status
                        const isCompletedStep = step.statusCheck.includes(booking.status);
                        const hasTime = !!step.time;

                        return (
                            <View key={index} style={styles.timelineItem}>
                                <View style={styles.timeColumn}>
                                    <Text style={styles.timelineTime}>
                                        {hasTime && isCompletedStep ? new Date(step.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                    </Text>
                                </View>
                                <View style={styles.timelineVisual}>
                                    <View style={[styles.timelineDot, { backgroundColor: isCompletedStep ? '#10b981' : '#cbd5e1' }]} />
                                    {index < arr.length - 1 && <View style={[styles.timelineLine, { backgroundColor: isCompletedStep ? '#10b981' : '#e2e8f0' }]} />}
                                </View>
                                <View style={styles.timelineContent}>
                                    <Text style={[styles.timelineTitle, { color: isCompletedStep ? '#1e293b' : '#94a3b8' }]}>{step.title}</Text>
                                    {isCompletedStep && hasTime && <Text style={styles.timelineDate}>{new Date(step.time).toLocaleDateString()}</Text>}
                                </View>
                            </View>
                        );
                    })}
                </View>
            </Card.Content>
        </Card>
    );

    return (
        <WebLayout
            title="Booking Details"
            subtitle={`ID: ${booking.id}`}
            actions={
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                    {/* Show Chat only for active bookings */}
                    {!['work_completed', 'completed', 'cancelled', 'rejected'].includes(booking.status) && (
                        <Button mode="outlined" icon="message-text-outline" onPress={() => navigation.navigate('Chat', { bookingId, name: booking.customerName })}>
                            Chat
                        </Button>
                    )}

                    {/* Show Completed badge for finished jobs */}
                    {['work_completed', 'completed'].includes(booking.status) && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#ecfdf5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#10b981' }}>
                            <MaterialCommunityIcons name="check-circle" size={20} color="#10b981" />
                            <Text style={{ color: '#10b981', fontWeight: '700', marginLeft: 8 }}>Service Completed</Text>
                        </View>
                    )}

                    {['accepted', 'confirmed'].includes(booking.status) && (
                        <>
                            <Button mode="outlined" buttonColor="white" textColor="#ef4444" style={{ borderColor: '#ef4444' }} onPress={handleCancel}>
                                Cancel
                            </Button>
                            <Button mode="contained" buttonColor="#3b82f6" onPress={handleStartJob}>
                                Start Job
                            </Button>
                        </>
                    )}

                    {['confirmed', 'on_the_way', 'arrived', 'work_started', 'in_progress'].includes(booking.status) && (
                        <Button mode="contained" buttonColor="#10b981" onPress={handleCompleteJob}>
                            Complete Job
                        </Button>
                    )}

                    {booking.status === 'pending' && (
                        <>
                            <Button mode="contained" buttonColor="#ef4444" onPress={handleReject}>
                                Reject
                            </Button>
                            <Button mode="contained" buttonColor="#10b981" onPress={handleAccept}>
                                Accept Booking
                            </Button>
                        </>
                    )}
                </View>
            }
        >
            <View style={[styles.container, styles.scrollContent]}>
                <View style={styles.grid}>
                    {/* Left Column - Booking Info */}
                    <View style={styles.leftColumn}>
                        <Card style={styles.card}>
                            <Card.Content>
                                <View style={styles.headerRow}>
                                    <View>
                                        <Text style={styles.serviceTitle}>{booking.serviceName}</Text>
                                        <View style={styles.metaRow}>
                                            <MaterialCommunityIcons name="calendar-clock" size={16} color="#64748b" />
                                            <Text style={styles.metaText}>{booking.time || booking.scheduledTime}</Text>
                                        </View>
                                    </View>
                                    <Chip
                                        style={{ backgroundColor: getStatusColor(booking.status) + '20' }}
                                        textStyle={{ color: getStatusColor(booking.status) }}
                                    >
                                        {booking.status?.toUpperCase()}
                                    </Chip>
                                </View>

                                <Divider style={styles.divider} />

                                <Text style={styles.sectionTitle}>Order Summary</Text>
                                {/* Assuming items are in booking.items or we just show service name if items not available */}
                                {booking.items && booking.items.length > 0 ? (
                                    booking.items.map((item: any, index: number) => (
                                        <View key={index} style={styles.itemRow}>
                                            <Text style={styles.itemName}>{item.name} x{item.qty}</Text>
                                            {/* Hide price after service completion */}
                                            {!['work_completed', 'completed'].includes(booking.status) && (
                                                <Text style={styles.itemPrice}>{item.price}</Text>
                                            )}
                                        </View>
                                    ))
                                ) : (
                                    <View style={styles.itemRow}>
                                        <Text style={styles.itemName}>{booking.serviceName}</Text>
                                        {/* Hide price after service completion */}
                                        {!['work_completed', 'completed'].includes(booking.status) && (
                                            <Text style={styles.itemPrice}>₹{booking.amount}</Text>
                                        )}
                                    </View>
                                )}

                                {/* Hide total amount after service completion */}
                                {!['work_completed', 'completed'].includes(booking.status) && (
                                    <>
                                        <Divider style={styles.divider} />
                                        <View style={styles.totalRow}>
                                            <Text style={styles.totalLabel}>Total Amount</Text>
                                            <Text style={styles.totalValue}>₹{booking.amount || booking.totalAmount}</Text>
                                        </View>
                                    </>
                                )}

                                {/* Show Service Completed Banner */}
                                {['work_completed', 'completed'].includes(booking.status) && (
                                    <View style={styles.completedBanner}>
                                        <MaterialCommunityIcons name="check-circle" size={32} color="#10b981" />
                                        <View style={{ marginLeft: 12 }}>
                                            <Text style={styles.completedTitle}>Service Completed</Text>
                                            <Text style={styles.completedSubtitle}>OTP verified successfully</Text>
                                        </View>
                                    </View>
                                )}
                            </Card.Content>
                        </Card>

                        {/* Show timeline in left column ONLY if NOT completed (Active) */}
                        {!isJobCompleted && timelineSection}
                    </View>

                    {/* Right Column - Customer Info */}
                    <View style={styles.rightColumn}>
                        <Card style={styles.card}>
                            <Card.Content>
                                <Text style={styles.sectionTitle}>Customer Details</Text>
                                <View style={styles.customerProfile}>
                                    <Avatar.Text size={64} label={booking.customerName?.[0] || 'C'} style={{ backgroundColor: '#e0e7ff' }} color="#4338ca" />
                                    <View style={{ marginLeft: 16 }}>
                                        <Text style={styles.customerName}>{booking.customerName}</Text>
                                        <Text style={styles.customerType}>Customer</Text>
                                    </View>
                                </View>

                                {/* Show address only for active bookings, hide after completion */}
                                {!['work_completed', 'completed'].includes(booking.status) ? (
                                    <>
                                        <View style={styles.contactRow}>
                                            <View style={styles.iconBox}>
                                                <MaterialCommunityIcons name="phone" size={20} color="#6366f1" />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.contactLabel}>Phone</Text>
                                                <Text style={styles.contactValue} numberOfLines={1}>{booking.customerPhone}</Text>
                                            </View>
                                        </View>

                                        <View style={styles.contactRow}>
                                            <View style={styles.iconBox}>
                                                <MaterialCommunityIcons name="map-marker" size={20} color="#6366f1" />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.contactLabel}>Address</Text>
                                                <Text style={styles.contactValue} numberOfLines={3}>{booking.address || booking.customerLocation?.address || 'Address not available'}</Text>
                                            </View>
                                        </View>

                                        <Button
                                            mode="outlined"
                                            style={{ marginTop: 16, borderColor: '#e2e8f0' }}
                                            onPress={() => {
                                                const addr = booking.address || booking.customerLocation?.address;
                                                const lat = booking.customerLocation?.latitude;
                                                const lng = booking.customerLocation?.longitude;
                                                // Prefer coordinates, fallback to address query
                                                const query = (lat && lng && (lat !== 0 || lng !== 0))
                                                    ? `${lat},${lng}`
                                                    : encodeURIComponent(addr || '');

                                                if (query) {
                                                    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
                                                }
                                            }}
                                        >
                                            View on Map
                                        </Button>
                                    </>
                                ) : (
                                    <View style={[styles.completedBanner, { marginTop: 16 }]}>
                                        <MaterialCommunityIcons name="shield-check" size={24} color="#10b981" />
                                        <View style={{ marginLeft: 12, flex: 1 }}>
                                            <Text style={{ color: '#059669', fontWeight: '600' }}>Details Hidden</Text>
                                            <Text style={{ color: '#6b7280', fontSize: 12 }}>Customer info hidden after service completion</Text>
                                        </View>
                                    </View>
                                )}
                            </Card.Content>
                        </Card>

                        {/* Show timeline in right column ONLY if completed */}
                        {isJobCompleted && timelineSection}
                    </View>
                </View>

                {/* Completion OTP Modal */}
                <Modal visible={showCompleteOtpModal} transparent animationType="fade" onRequestClose={() => !completingJob && setShowCompleteOtpModal(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.otpModalContainer}>
                            <View style={styles.otpHeader}>
                                <Text style={styles.otpTitle}>Complete Service</Text>
                                <IconButton icon="close" onPress={() => !completingJob && setShowCompleteOtpModal(false)} disabled={completingJob} />
                            </View>
                            <Text style={styles.otpDesc}>
                                Ask the customer for the 6-digit completion OTP shown in their booking details.
                            </Text>

                            <TextInput
                                mode="outlined"
                                label="Enter 6-digit OTP"
                                value={completionOtp}
                                onChangeText={(text) => {
                                    setCompletionOtp(text);
                                    setOtpError('');
                                }}
                                keyboardType="number-pad"
                                maxLength={6}
                                style={styles.otpInput}
                                autoFocus
                                error={!!otpError}
                            />

                            {otpError ? (
                                <Text style={{ color: '#ef4444', marginTop: 8, textAlign: 'center' }}>{otpError}</Text>
                            ) : null}

                            <Button
                                mode="contained"
                                onPress={verifyCompletionOtp}
                                loading={completingJob}
                                disabled={completingJob}
                                style={{ marginTop: 16 }}
                                contentStyle={{ paddingVertical: 4 }}
                                buttonColor="#10b981"
                            >
                                {completingJob ? 'Verifying...' : 'Complete Job'}
                            </Button>
                        </View>
                    </View>
                </Modal>
            </View >
        </WebLayout >
    );
}

const styles = StyleSheet.create({
    container: {
        // flex: 1, // Removed to allow scroll
        // height: '100%', // Removed to allow scroll
        // overflow: 'hidden', // Removed to allow scroll
    },
    scrollContent: {
        flexGrow: 1,
        padding: 32,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 18,
        color: '#64748b',
        marginTop: 16,
    },
    grid: {
        flexDirection: 'row',
        gap: 32,
        flexWrap: 'wrap',
    },
    leftColumn: {
        flex: 2,
        minWidth: 400,
    },
    rightColumn: {
        flex: 1,
        minWidth: 300,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    serviceTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        color: '#64748b',
        fontSize: 14,
    },
    divider: {
        marginVertical: 20,
        backgroundColor: '#e2e8f0',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 16,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    itemName: {
        fontSize: 15,
        color: '#334155',
    },
    itemPrice: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1e293b',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    totalValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    customerProfile: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    customerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    customerType: {
        fontSize: 13,
        color: '#64748b',
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e0e7ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactLabel: {
        fontSize: 12,
        color: '#64748b',
    },
    contactValue: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '500',
        flex: 1,
    },
    timelineContainer: {
        marginTop: 16,
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    timeColumn: {
        width: 60,
        alignItems: 'flex-end',
        marginRight: 16,
    },
    timelineVisual: {
        alignItems: 'center',
        marginRight: 16,
    },
    timelineDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#fff',
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 4,
    },
    timelineContent: {
        flex: 1,
        paddingBottom: 4,
    },
    timelineTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    timelineDate: {
        fontSize: 12,
        color: '#64748b',
    },
    timelineTime: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    otpModalContainer: {
        width: 400,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 24,
        elevation: 5,
    },
    otpHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    otpTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    otpDesc: {
        color: '#64748b',
        marginBottom: 24,
    },
    otpInput: {
        backgroundColor: 'white',
        fontSize: 24,
        letterSpacing: 8,
        textAlign: 'center',
    },
    // Service Completed Banner Styles
    completedBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ecfdf5',
        padding: 16,
        borderRadius: 12,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#10b981',
    },
    completedTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#10b981',
    },
    completedSubtitle: {
        fontSize: 14,
        color: '#059669',
        marginTop: 2,
    },
});
