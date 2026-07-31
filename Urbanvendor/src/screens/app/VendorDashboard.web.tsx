import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, Modal } from 'react-native';
import { Card, Text, Button, Chip, Avatar, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchActiveBookings, acceptBooking, rejectBooking } from '@/store/slices/bookingSlice';
import { toggleOnlineStatus, loadUserFromStorage } from '@/store/slices/authSlice';
import WebLayout from '@/components/WebLayout';
import SocketService from '../../services/SocketService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '../../store';
import { requestFcmToken, onMessageListener } from '../../config/firebasevendor';
import { authAPI } from '../../services/api';
import { theme } from '@/theme/theme';

export default function VendorDashboard({ navigation }: any) {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { activeBookings, currentRequest } = useAppSelector((state) => state.booking);
    const [timers, setTimers] = React.useState<{ [key: string]: number }>({});
    const isOnline = user?.isOnline || false;

    // Premium State
    const [isPremium, setIsPremium] = React.useState((user as any)?.role === 'premium_vendor' || false);

    // Premium Modal State
    const [showPremiumModal, setShowPremiumModal] = React.useState(false);
    const [premiumPlanning, setPremiumPlanning] = React.useState<'monthly' | 'yearly'>('monthly');
    const [processingUpgrade, setProcessingUpgrade] = React.useState(false);

    //  Connect Socket when component mounts
    useEffect(() => {
        const connectSocket = async () => {
            // Debug: log user object
            console.log('🔍 User object:', user);

            const vendorId = user?.id || (user as any)?._id;
            if (!vendorId) {
                console.log('❌ No vendor ID found, skipping socket connect');
                return;
            }

            try {
                // Token is stored as 'authToken' during login
                let token = await AsyncStorage.getItem('authToken');

                // Fallback to localStorage for web
                if (!token && Platform.OS === 'web' && typeof localStorage !== 'undefined') {
                    token = localStorage.getItem('authToken') || localStorage.getItem('token');
                    console.log('🔑 Checking localStorage:', token ? 'FOUND' : 'NOT FOUND');
                }

                console.log('🔑 Token:', token ? 'FOUND' : 'NOT FOUND');

                if (token) {
                    console.log('🔌 VendorDashboard: Connecting socket for vendor', vendorId);
                    SocketService.connect(vendorId, token);
                } else {
                    console.log('❌ No token found, socket will not connect');
                }
            } catch (e) {
                console.error('Socket connect error:', e);
            }
        };

        connectSocket();

        // Request notification permission
        if (Platform.OS === 'web' && 'Notification' in window) {
            Notification.requestPermission().then(p => console.log('🔔 Permission:', p));
        }

        return () => {
            console.log('🔌 VendorDashboard: Disconnecting socket');
            SocketService.disconnect();
        };
    }, [user?.id]);

    // Initial fetch
    useEffect(() => {
        dispatch(fetchActiveBookings());
        dispatch(loadUserFromStorage());
    }, [dispatch]);

    // 🔔 Show notification with LOOPING sound when new booking comes in
    const [notificationAudio, setNotificationAudio] = React.useState<any>(null);

    useEffect(() => {
        if (currentRequest && Platform.OS === 'web') {
            console.log('📋 New booking request detected!', currentRequest);
            dispatch(fetchActiveBookings());

            // Request permission if not granted
            if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission();
            }

            // Play LOOPING sound until accept/reject
            console.log('🔊 Starting looping notification sound...');

            // Use SocketService sound (has looping built-in)
            SocketService.playSound();

            // Also try browser Audio as backup
            try {
                const audio = new (window as any).Audio('/notification.mp3');
                audio.volume = 1.0;
                audio.loop = true;
                audio.play()
                    .then(() => console.log('✅ Browser audio started!'))
                    .catch((e: any) => console.log('⚠️ Browser audio blocked (normal on first visit):', e.message));
                setNotificationAudio(audio);
            } catch (e) {
                console.log('⚠️ Browser audio fallback skipped');
            }

            // Show browser notification
            console.log('🔔 Notification permission:', Notification.permission);
            if ('Notification' in window && Notification.permission === 'granted') {
                const notif = new Notification('New Booking Request! 🎉', {
                    body: `${currentRequest.serviceName || 'Service'} from ${currentRequest.customerName || 'Customer'} - ₹${currentRequest.totalAmount || 0}`,
                    icon: '/assets/icon.png',
                    requireInteraction: true
                });
                console.log('✅ Notification created:', notif);
            } else {
                alert(`🔔 NEW BOOKING!\n${currentRequest.serviceName || 'Service'} from ${currentRequest.customerName || 'Customer'}`);
            }
        } else {
            // 🛑 Stop sound when currentRequest becomes null (accepted/rejected)
            if (notificationAudio) {
                console.log('🔇 Stopping notification sound');
                notificationAudio.pause();
                notificationAudio.currentTime = 0;
                setNotificationAudio(null);
            }
            // Also stop SocketService sound
            SocketService.stopSound();
        }
    }, [currentRequest, dispatch]);

    // Poll for updates every 10 seconds as a fallback
    useEffect(() => {
        const interval = setInterval(() => {
            dispatch(fetchActiveBookings());
        }, 10000);
        return () => clearInterval(interval);
    }, [dispatch]);

    // Setup Push Notifications (Web)
    useEffect(() => {
        const setupNotifications = async () => {
            if (Platform.OS === 'web') {
                // 1. Get Token & Save
                try {
                    // Safety check
                    const token = await requestFcmToken();
                    if (token) {
                        await authAPI.updateProfile({ fcmToken: token });
                        console.log('✅ Vendor FCM Token synced');
                    }
                } catch (e) { console.warn('Firebase init skipped:', e); }

                // 2. Listen for Messages
                try {
                    onMessageListener().then((payload: any) => {
                        console.log('🔔 New Booking:', payload);
                        if (payload.notification) {
                            const title = payload.notification.title;
                            // Native Browser Notification
                            if (window.Notification && Notification.permission === "granted") {
                                new Notification(title, {
                                    body: payload.notification.body,
                                    icon: '/assets/icon.png'
                                });
                            }
                            // Also refresh bookings immediately
                            dispatch(fetchActiveBookings());
                        }
                    });
                } catch (e) { }
            }
        };
        setupNotifications();
    }, [dispatch]);

    // Track auto-rejected bookings to prevent duplicate calls
    const autoRejectedRef = React.useRef<Set<string>>(new Set());

    // Timer Logic for Pending Bookings
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const newTimers: { [key: string]: number } = {};

            activeBookings.forEach((b: any) => {
                if (b.status === 'waiting_vendor_response' && b.vendorOfferExpiresAt) {
                    const expiresAt = new Date(b.vendorOfferExpiresAt).getTime();
                    const diff = Math.max(0, Math.floor((expiresAt - now) / 1000));
                    newTimers[b.id] = diff;

                    // ⏰ Auto-reject if timer hits 0
                    if (diff === 0 && !autoRejectedRef.current.has(b.id)) {
                        console.log('⏰ Timer expired for booking', b.id, '- Auto-rejecting...');
                        autoRejectedRef.current.add(b.id);
                        handleReject(b.id);
                    }
                }
            });
            setTimers(newTimers);
        }, 1000);

        return () => clearInterval(interval);
    }, [activeBookings]);

    const handleToggleOnline = () => {
        dispatch(toggleOnlineStatus(!isOnline));
    };

    const handleAccept = (bookingId: string) => {
        dispatch(acceptBooking(bookingId));
    };

    const handleReject = (bookingId: string) => {
        dispatch(rejectBooking({ bookingId, reason: 'Vendor rejected' }));
    };

    // Filter bookings
    // Update pending filter to include 'waiting_vendor_response'
    const pendingBookings = activeBookings.filter((b: any) => b.status === 'pending' || b.status === 'waiting_vendor_response') || [];
    const todayBookings = activeBookings.filter((b: any) => b.status !== 'pending' && b.status !== 'waiting_vendor_response' && b.status !== 'completed') || [];

    const displayPending = pendingBookings;
    const displayToday = todayBookings;

    return (
        <WebLayout title="Home">
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>

                {/* Hero Section */}
                <LinearGradient
                    colors={[theme.colors.primary, '#4f46e5']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.hero}
                >
                    <View style={styles.heroContent}>
                        <View>
                            <Text style={styles.heroGreeting}>Good Afternoon, {user?.name?.split(' ')[0] || 'Partner'}! 👋</Text>
                            <Text style={styles.heroSubtitle}>You have {displayPending.length} new requests waiting for you.</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 }}>
                                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Vendor ID: {user?.id}</Text>
                                <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
                                    <Text style={{ color: '#fff', fontSize: 12 }}>{isOnline ? 'Online' : 'Offline'}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: 12 }}>
                            <Button
                                mode="contained"
                                buttonColor={isOnline ? "#22c55e" : "#ef4444"}
                                textColor="#ffffff"
                                icon={isOnline ? "check-circle" : "close-circle"}
                                onPress={handleToggleOnline}
                            >
                                {isOnline ? 'Online' : 'Offline'}
                            </Button>
                            <Button
                                mode="contained"
                                buttonColor="#ffffff"
                                textColor={theme.colors.primary}
                                icon="lightning-bolt"
                                onPress={() => navigation.navigate('Bookings')}
                            >
                                View Schedule
                            </Button>
                        </View>
                    </View>

                    {/* Quick Stats Overlay */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>₹{(user as any)?.walletBalance?.toFixed(2) || '0.00'}</Text>
                            <Text style={styles.statLabel}>Wallet Balance</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{activeBookings.length}</Text>
                            <Text style={styles.statLabel}>Active Jobs</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Text style={styles.statValue}>{(user as any)?.avgRating || '5.0'}</Text>
                                <MaterialCommunityIcons name="star" size={20} color="#fbbf24" />
                            </View>
                            <Text style={styles.statLabel}>Rating</Text>
                        </View>
                    </View>
                </LinearGradient>

                <View style={styles.mainGrid}>
                    {/* Left Column: Pending Requests & Today's Schedule */}
                    <View style={styles.leftColumn}>

                        {/* Pending Requests */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>New Requests</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Bookings')}>
                                <Text style={styles.seeAll}>See all</Text>
                            </TouchableOpacity>
                        </View>

                        {displayPending.length === 0 ? (
                            <Card style={styles.emptyCard}>
                                <Card.Content style={{ alignItems: 'center', padding: 24 }}>
                                    <MaterialCommunityIcons name="calendar-check" size={48} color="#cbd5e1" />
                                    <Text style={{ marginTop: 12, color: '#64748b' }}>No new requests at the moment.</Text>
                                </Card.Content>
                            </Card>
                        ) : (
                            <View style={styles.cardsGrid}>
                                {displayPending.map((booking: any, index: number) => (
                                    <Animated.View
                                        key={booking.id || index}
                                        entering={FadeInDown.delay(index * 100)}
                                        style={styles.requestCardWrapper}
                                    >
                                        <Card style={styles.requestCard}>
                                            <Card.Content>
                                                <View style={styles.cardHeader}>
                                                    <Avatar.Text size={40} label={booking.customerName?.[0] || 'C'} style={{ backgroundColor: '#e0e7ff' }} color="#4338ca" />
                                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                                        <Text style={styles.customerName}>{booking.customerName || 'Unknown Customer'}</Text>
                                                        <Text style={styles.serviceName}>{booking.serviceName || 'Service'}</Text>
                                                    </View>
                                                    <View style={{ alignItems: 'flex-end' }}>
                                                        <Chip style={styles.priceChip}>₹{booking.amount || booking.totalAmount || 0}</Chip>
                                                        {timers[booking.id] !== undefined && (
                                                            <Text style={{ color: timers[booking.id] < 10 ? '#ef4444' : '#f59e0b', fontSize: 12, fontWeight: 'bold', marginTop: 4 }}>
                                                                Expires in {timers[booking.id]}s
                                                            </Text>
                                                        )}
                                                    </View>
                                                </View>

                                                <View style={styles.cardMeta}>
                                                    <View style={styles.metaItem}>
                                                        <MaterialCommunityIcons name="calendar-clock" size={16} color="#64748b" />
                                                        <Text style={styles.metaText}>{booking.scheduledTime || booking.time || 'Time TBD'}</Text>
                                                    </View>
                                                    <View style={styles.metaItem}>
                                                        <MaterialCommunityIcons name="map-marker" size={16} color="#64748b" />
                                                        <Text style={styles.metaText} numberOfLines={1}>{booking.customerLocation?.address || booking.address || 'No Address'}</Text>
                                                    </View>
                                                </View>

                                                <View style={styles.cardActions}>
                                                    <Button
                                                        mode="outlined"
                                                        style={{ flex: 1, borderColor: '#ef4444' }}
                                                        textColor="#ef4444"
                                                        onPress={() => handleReject(booking.id)}
                                                    >
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        mode="contained"
                                                        style={{ flex: 1 }}
                                                        buttonColor={theme.colors.primary}
                                                        onPress={() => handleAccept(booking.id)}
                                                        disabled={timers[booking.id] === 0}
                                                    >
                                                        Accept
                                                    </Button>
                                                </View>
                                            </Card.Content>
                                        </Card>
                                    </Animated.View>
                                ))}
                            </View>
                        )}

                        {/* Today's Schedule */}
                        <View style={[styles.sectionHeader, { marginTop: 32 }]}>
                            <Text style={styles.sectionTitle}>Today's Schedule</Text>
                        </View>

                        {displayToday.length === 0 ? (
                            <Card style={styles.emptyCard}>
                                <Card.Content style={{ alignItems: 'center', padding: 24 }}>
                                    <MaterialCommunityIcons name="calendar-blank" size={48} color="#cbd5e1" />
                                    <Text style={{ marginTop: 12, color: '#64748b' }}>No scheduled jobs for today.</Text>
                                </Card.Content>
                            </Card>
                        ) : (
                            <Card style={styles.scheduleCard}>
                                <Card.Content>
                                    {displayToday.map((booking: any, index: number) => (
                                        <View key={booking.id}>
                                            <View style={styles.scheduleItem}>
                                                <View style={styles.timeColumn}>
                                                    <Text style={styles.scheduleTime}>{booking.scheduledTime || booking.time}</Text>
                                                    <View style={styles.timelineLine} />
                                                </View>
                                                <View style={styles.scheduleContent}>
                                                    <View style={[styles.statusIndicator, { backgroundColor: '#f59e0b' }]} />
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={styles.scheduleTitle}>{booking.serviceName}</Text>
                                                        <Text style={styles.scheduleCustomer}>for {booking.customerName}</Text>
                                                        <Text style={styles.scheduleAddress}>{booking.customerLocation?.address || booking.address}</Text>
                                                    </View>
                                                    <IconButton icon="chevron-right" onPress={() => navigation.navigate('BookingDetail', { bookingId: booking.id })} />
                                                </View>
                                            </View>
                                            {index < displayToday.length - 1 && <View style={{ height: 16 }} />}
                                        </View>
                                    ))}
                                </Card.Content>
                            </Card>
                        )}
                    </View>

                    {/* Right Column: Quick Actions & Updates */}
                    <View style={styles.rightColumn}>
                        <Card style={styles.actionCard}>
                            <Card.Content>
                                <Text style={styles.sectionTitle}>Quick Actions</Text>
                                <View style={styles.actionList}>
                                    <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Services')}>
                                        <View style={[styles.actionIcon, { backgroundColor: '#ecfdf5' }]}>
                                            <MaterialCommunityIcons name="plus-circle" size={24} color="#10b981" />
                                        </View>
                                        <Text style={styles.actionText}>Add Service</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Earnings')}>
                                        <View style={[styles.actionIcon, { backgroundColor: '#eff6ff' }]}>
                                            <MaterialCommunityIcons name="wallet" size={24} color="#3b82f6" />
                                        </View>
                                        <Text style={styles.actionText}>Withdraw</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Profile')}>
                                        <View style={[styles.actionIcon, { backgroundColor: '#fff7ed' }]}>
                                            <MaterialCommunityIcons name="account-edit" size={24} color="#f59e0b" />
                                        </View>
                                        <Text style={styles.actionText}>Edit Profile</Text>
                                    </TouchableOpacity>
                                </View>
                            </Card.Content>
                        </Card>

                        {/* Premium Status or Upgrade Card */}
                        {isPremium ? (
                            <LinearGradient colors={['#0f172a', '#1e293b']} style={[styles.promoCard, { borderWidth: 1, borderColor: '#fbbf24' }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 12 }}>
                                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(251, 191, 36, 0.1)', justifyContent: 'center', alignItems: 'center' }}>
                                        <MaterialCommunityIcons name="crown" size={28} color="#fbbf24" />
                                    </View>
                                    <View>
                                        <Text style={[styles.promoTitle, { marginBottom: 0, color: '#fbbf24' }]}>Premium Member</Text>
                                        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Plan Active • Yearly</Text>
                                    </View>
                                </View>
                                <Text style={styles.promoText}>
                                    You are enjoying 0% commission, verified badge, and priority support.
                                </Text>
                            </LinearGradient>
                        ) : (
                            <LinearGradient colors={['#1e293b', '#334155']} style={styles.promoCard}>
                                <MaterialCommunityIcons name="crown" size={32} color="#fbbf24" />
                                <Text style={styles.promoTitle}>Go Premium</Text>
                                <Text style={styles.promoText}>Get more visibility and 0% commission on your first 10 jobs.</Text>
                                <Button
                                    mode="contained"
                                    buttonColor="#fbbf24"
                                    textColor="#1e293b"
                                    style={{ marginTop: 12 }}
                                    onPress={() => setShowPremiumModal(true)}
                                >
                                    Upgrade Now
                                </Button>
                            </LinearGradient>
                        )}
                    </View>
                </View>

            </ScrollView>

            {/* Premium Upgrade Modal - Moved outside ScrollView */}
            <Modal visible={showPremiumModal} transparent animationType="fade" onRequestClose={() => setShowPremiumModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.premiumModalContainer}>
                        <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.premiumHeader}>
                            <MaterialCommunityIcons name="crown" size={48} color="#fbbf24" />
                            <View style={{ flex: 1, marginLeft: 16 }}>
                                <Text style={styles.premiumHeaderTitle}>Upgrade to Premium</Text>
                                <Text style={styles.premiumHeaderSub}>Unlock exclusive benefits & more earnings</Text>
                            </View>
                            <IconButton icon="close" iconColor="white" style={styles.closeButton} onPress={() => setShowPremiumModal(false)} />
                        </LinearGradient>

                        <View style={styles.premiumBody}>
                            <View style={styles.benefitRow}>
                                <MaterialCommunityIcons name="check-circle" size={24} color="#10b981" />
                                <Text style={styles.benefitText}>0% Commission on first 10 jobs</Text>
                            </View>
                            <View style={styles.benefitRow}>
                                <MaterialCommunityIcons name="check-circle" size={24} color="#10b981" />
                                <Text style={styles.benefitText}>Priority Support</Text>
                            </View>
                            <View style={styles.benefitRow}>
                                <MaterialCommunityIcons name="check-circle" size={24} color="#10b981" />
                                <Text style={styles.benefitText}>Verified Badge on Profile</Text>
                            </View>

                            <Text style={styles.planLabel}>Choose Plan</Text>
                            <View style={styles.planContainer}>
                                <TouchableOpacity
                                    style={[styles.planCard, premiumPlanning === 'monthly' && styles.planSelected]}
                                    onPress={() => setPremiumPlanning('monthly')}
                                >
                                    <Text style={styles.planTitle}>Monthly</Text>
                                    <Text style={styles.planPrice}>₹999</Text>
                                    <Text style={styles.planSub}>/month</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.planCard, premiumPlanning === 'yearly' && styles.planSelected]}
                                    onPress={() => setPremiumPlanning('yearly')}
                                >
                                    <View style={styles.savingBadge}><Text style={styles.savingText}>SAVE 20%</Text></View>
                                    <Text style={styles.planTitle}>Yearly</Text>
                                    <Text style={styles.planPrice}>₹9,999</Text>
                                    <Text style={styles.planSub}>/year</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.premiumFooter}>
                            <Button
                                mode="contained"
                                buttonColor="#fbbf24"
                                textColor="#1e293b"
                                style={styles.upgradeBtn}
                                loading={processingUpgrade}
                                onPress={() => {
                                    setProcessingUpgrade(true);
                                    setTimeout(() => {
                                        setProcessingUpgrade(false);
                                        setIsPremium(true); // Activate Premium
                                        setShowPremiumModal(false);
                                        // Update user logic here (mock)
                                        if (Platform.OS === 'web') alert('Welcome to Premium! Your benefits are active.');
                                        else console.log("Premium Active");
                                    }, 2000);
                                }}
                            >
                                Pay & Upgrade
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>
        </WebLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 32,
    },
    hero: {
        borderRadius: 24,
        padding: 32,
        marginBottom: 32,
        position: 'relative',
        overflow: 'visible', // Allow stats to overlap
    },
    heroContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40,
    },
    heroGreeting: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
    },
    statDivider: {
        width: 1,
        height: '100%',
        backgroundColor: '#e2e8f0',
    },
    mainGrid: {
        flexDirection: 'row',
        gap: 32,
        marginTop: 24, // Space for overlapping stats if needed, but here stats are inside hero container for simplicity in this layout
    },
    leftColumn: {
        flex: 2,
        minWidth: 500,
    },
    rightColumn: {
        flex: 1,
        minWidth: 300,
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
    },
    seeAll: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    cardsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    requestCardWrapper: {
        flex: 1,
        minWidth: 300,
    },
    requestCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    customerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    serviceName: {
        fontSize: 13,
        color: '#64748b',
    },
    priceChip: {
        backgroundColor: '#f0fdf4',
    },
    cardMeta: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    metaText: {
        fontSize: 13,
        color: '#64748b',
    },
    cardActions: {
        flexDirection: 'row',
        gap: 12,
    },
    scheduleCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        elevation: 2,
    },
    scheduleItem: {
        flexDirection: 'row',
    },
    timeColumn: {
        width: 80,
        alignItems: 'flex-end',
        paddingRight: 16,
    },
    scheduleTime: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#e2e8f0',
        marginRight: -1, // Align with right edge
        marginTop: 8,
    },
    scheduleContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    statusIndicator: {
        width: 4,
        height: 40,
        borderRadius: 2,
    },
    scheduleTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    scheduleCustomer: {
        fontSize: 13,
        color: '#64748b',
    },
    scheduleAddress: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 2,
    },
    actionCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        elevation: 2,
        marginBottom: 24,
    },
    actionList: {
        marginTop: 16,
        gap: 12,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    actionText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#334155',
    },
    // Premium Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999, // Ensure it sits on top
    },
    premiumModalContainer: {
        width: 500,
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        maxHeight: '90%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    premiumHeader: {
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
    },
    premiumHeaderTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fbbf24',
    },
    premiumHeaderSub: {
        color: 'rgba(255,255,255,0.8)',
    },
    closeButton: {
        margin: 0,
    },
    premiumBody: {
        padding: 24,
    },
    benefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    benefitText: {
        fontSize: 16,
        color: '#334155',
    },
    planLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginTop: 16,
        marginBottom: 16,
    },
    planContainer: {
        flexDirection: 'row',
        gap: 16,
    },
    planCard: {
        flex: 1,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        position: 'relative',
    },
    planSelected: {
        borderColor: '#fbbf24',
        backgroundColor: '#fffbeb',
    },
    planTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#64748b',
        marginBottom: 4,
    },
    planPrice: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    planSub: {
        fontSize: 12,
        color: '#94a3b8',
    },
    savingBadge: {
        position: 'absolute',
        top: -10,
        backgroundColor: '#10b981',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    savingText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    premiumFooter: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    upgradeBtn: {
        paddingVertical: 6,
    },
    promoCard: {
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    promoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        marginTop: 12,
        marginBottom: 8,
    },
    promoText: {
        fontSize: 13,
        color: '#cbd5e1',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 20,
    },
    emptyCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        elevation: 2,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#cbd5e1',
    },
});
