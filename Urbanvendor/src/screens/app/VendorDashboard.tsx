import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Modal, useWindowDimensions, Platform } from 'react-native';
import { Card, Title, Text, Button, Switch, Avatar, Chip, FAB } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppDispatch, useAppSelector } from '@/store';
import { toggleOnlineStatus } from '@/store/slices/authSlice';
import { fetchActiveBookings, rejectBooking } from '@/store/slices/bookingSlice';
import { markAllNotificationsAsRead, addNotification } from '@/store/slices/notificationSlice';
import NotificationService from '@/services/NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function VendorDashboard({ navigation }: any) {
  const { width: windowWidth } = useWindowDimensions();
  const isLargeScreen = Platform.OS === 'web' && windowWidth >= 900;
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { activeBookings } = useAppSelector((state) => state.booking);
  const { notifications, unreadCount } = useAppSelector((state) => state.notification);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRange, setSelectedRange] = useState<'today' | 'week' | 'month'>('today');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Mock data for demonstration
  const todayStats = {
    earnings: 1250,
    completedJobs: 8,
    rating: 4.8,
    totalJobs: 156
  };

  // Sample upcoming bookings to show when there is no real data
  // These mirror the demo bookings shown on the main Bookings page
  const mockUpcomingBookings = [
    {
      id: 'demo-1',
      customerName: 'Rahul Verma',
      serviceName: 'AC Service',
      scheduledDate: 'Today',
      scheduledTime: '4:30 PM',
      address: 'Andheri West, Mumbai',
      status: 'pending',
      totalAmount: 750,
    },
    {
      id: 'demo-2',
      customerName: 'Sneha Kapoor',
      serviceName: 'Deep Cleaning',
      scheduledDate: 'Today',
      scheduledTime: '6:00 PM',
      address: 'Bandra East, Mumbai',
      status: 'on_the_way',
      totalAmount: 1200,
    },
    {
      id: 'demo-3',
      customerName: 'Karan Singh',
      serviceName: 'Full Home Cleaning',
      scheduledDate: 'Yesterday',
      scheduledTime: '2:00 PM',
      address: 'Powai, Mumbai',
      status: 'work_completed',
      totalAmount: 1500,
    },
  ];



  useEffect(() => {
    // Load active bookings when screen mounts
    dispatch(fetchActiveBookings());
  }, [dispatch]);

  // Auto-reject timer logic for Mobile
  const autoRejectedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      activeBookings.forEach((b: any) => {
        if (b.status === 'waiting_vendor_response' && b.vendorOfferExpiresAt) {
          const expiresAt = new Date(b.vendorOfferExpiresAt).getTime();
          const diff = Math.max(0, Math.floor((expiresAt - now) / 1000));

          if (diff === 0 && !autoRejectedRef.current.has(b.id)) {
            console.log('⏰ Mobile Timeout: Auto-rejecting booking', b.id);
            autoRejectedRef.current.add(b.id);
            dispatch(rejectBooking({ bookingId: b.id, reason: 'Auto-rejected due to timeout' }));
          }
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeBookings, dispatch]);

  useEffect(() => {
    if (notifications.length === 0) {
      const now = Date.now();

      dispatch(addNotification({
        id: (now - 10000).toString(),
        title: 'New booking request',
        body: 'Plumbing service from Rahul Verma • Today 4:30 PM',
        type: 'booking_request',
        data: { bookingId: 'demo-1' },
        isRead: false,
        createdAt: new Date(now - 10000).toISOString(),
      }));

      dispatch(addNotification({
        id: (now - 5000).toString(),
        title: 'New message',
        body: 'Customer: "Hi, are you on the way?"',
        type: 'chat_message',
        data: { bookingId: 'demo-2' },
        isRead: false,
        createdAt: new Date(now - 5000).toISOString(),
      }));

      dispatch(addNotification({
        id: now.toString(),
        title: 'Payout processed',
        body: '₹1,250 credited to your bank account.',
        type: 'info',
        data: {},
        isRead: false,
        createdAt: new Date(now).toISOString(),
      }));
    }
  }, [dispatch, notifications.length]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchActiveBookings());
    setRefreshing(false);
  };

  const handleOpenNotifications = () => {
    setShowNotifications(true);
    if (unreadCount > 0) {
      dispatch(markAllNotificationsAsRead());
    }
  };

  const handleCloseNotifications = () => {
    setShowNotifications(false);
  };

  const handleSendTestNotification = () => {
    NotificationService.sendTestNotification();
  };

  const handleOnlineToggle = () => {
    if (user) {
      dispatch(toggleOnlineStatus(!user.isOnline));
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <Card style={styles.statCard}>
      <Card.Content style={styles.statContent}>
        <View style={styles.statTextBlock}>
          <Text style={styles.statLabel}>{title}</Text>
          <Text style={[styles.statValue, { color }]}>{value}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
        <View style={[styles.statIconWrapper, { backgroundColor: color + '15' }]}>
          <MaterialCommunityIcons name={icon} size={22} color={color} />
        </View>
      </Card.Content>
    </Card>
  );

  const QuickActionCard = ({ title, icon, color, onPress }: any) => (
    <TouchableOpacity onPress={onPress} style={styles.quickActionCard}>
      <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.actionTitle}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={[styles.innerContent, isLargeScreen && styles.innerContentLarge]}>

        {/* Header */}
        <View style={styles.headerWrapper}>
          <Card style={styles.summaryCard}>
            <Card.Content>
              <View style={styles.summaryTopRow}>
                <View style={styles.summaryTextBlock}>
                  <Text style={styles.summaryGreeting}>{getGreeting()}! 👋</Text>
                  <Text style={styles.summaryName}>{user?.name || 'Yogesh Thakur'}</Text>
                  <Text style={styles.summarySubtitle}>
                    Here's a quick snapshot of your day on UrbanVendor.
                  </Text>
                </View>
                <View style={styles.summaryRightIcons}>
                  <View style={{ alignItems: 'center', marginRight: 8 }}>
                    <Switch
                      value={user?.isOnline}
                      onValueChange={handleOnlineToggle}
                      color="#10b981"
                    />
                    <Text style={{ fontSize: 10, color: user?.isOnline ? '#10b981' : '#64748b' }}>
                      {user?.isOnline ? 'Online' : 'Offline'}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.iconCircle} onPress={handleOpenNotifications}>
                    <MaterialCommunityIcons name="bell-outline" size={20} color="#0f172a" />
                    {unreadCount > 0 && (
                      <View style={styles.notificationBadge}>
                        <Text style={styles.notificationBadgeText}>
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconCircle} onPress={() => setShowMenu(true)}>
                    <MaterialCommunityIcons name="menu" size={20} color="#0f172a" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.summaryStatsRow}>
                <View style={styles.summaryStatCard}>
                  <Text style={styles.summaryStatLabel}>Active jobs</Text>
                  <Text style={styles.summaryStatValue}>{activeBookings.length}</Text>
                </View>
                <View style={styles.summaryStatCard}>
                  <Text style={styles.summaryStatLabel}>Today's earnings</Text>
                  <Text style={styles.summaryStatValue}>₹{todayStats.earnings}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Stats grid */}
        <View style={styles.metricsGrid}>
          <TouchableOpacity
            style={[styles.metricCard, styles.metricCardJobs]}
            activeOpacity={0.85}
            onPress={() => { }}
          >
            <View style={[styles.metricIconCircle, { backgroundColor: '#e0edff' }]}>
              <MaterialCommunityIcons name="calendar-blank-outline" size={20} color="#4f46e5" />
            </View>
            <Text style={styles.metricLabel}>Today's Jobs</Text>
            <Text style={styles.metricValue}>{todayStats.completedJobs}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.metricCard, styles.metricCardEarnings]}
            activeOpacity={0.85}
            onPress={() => { }}
          >
            <View style={[styles.metricIconCircle, { backgroundColor: '#ffedd5' }]}>
              <MaterialCommunityIcons name="currency-inr" size={20} color="#c2410c" />
            </View>
            <Text style={styles.metricLabel}>Earnings</Text>
            <Text style={styles.metricValue}>₹{todayStats.earnings}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.metricCard, styles.metricCardMonth]}
            activeOpacity={0.85}
            onPress={() => { }}
          >
            <View style={[styles.metricIconCircle, { backgroundColor: '#dcfce7' }]}>
              <MaterialCommunityIcons name="calendar-range-outline" size={20} color="#16a34a" />
            </View>
            <Text style={styles.metricLabel}>This Month</Text>
            <Text style={styles.metricValue}>{todayStats.totalJobs}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.metricCard, styles.metricCardTime]}
            activeOpacity={0.85}
            onPress={() => { }}
          >
            <View style={[styles.metricIconCircle, { backgroundColor: '#e0f2fe' }]}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#0284c7" />
            </View>
            <Text style={styles.metricLabel}>Avg. Time</Text>
            <Text style={styles.metricValue}>2.5h</Text>
          </TouchableOpacity>
        </View>

        {/* Online Status Banner */}
        {user?.isOnline && (
          <Card style={styles.onlineBanner}>
            <Card.Content style={styles.onlineBannerContent}>
              <MaterialCommunityIcons name="wifi" size={24} color="#10b981" />
              <Text style={styles.onlineBannerText}>
                You're online and ready to receive bookings!
              </Text>
              <View style={styles.pulseIndicator} />
            </Card.Content>
          </Card>
        )}

        {/* Your bookings section (with samples when empty) */}
        <View style={styles.bookingsHeaderRow}>
          <Text style={styles.bookingsHeaderLabel}>TODAY</Text>
        </View>

        <Card style={styles.sectionCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>Your bookings</Title>
              <TouchableOpacity onPress={() => navigation.navigate('Bookings')}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            {(() => {
              const hasRealBookings = activeBookings.length > 0;
              const bookingsToShow = hasRealBookings
                ? activeBookings.slice(0, 3)
                : mockUpcomingBookings;

              return (
                <>
                  <View style={styles.bookingsSubHeaderRow}>
                    <Text style={styles.bookingsSubtitle}>
                      Upcoming ({bookingsToShow.length})
                    </Text>
                    <Text style={styles.bookingsHint}>Tap a booking to view details</Text>
                  </View>

                  <View style={styles.bookingsList}>
                    {bookingsToShow.map((booking: any) => {
                      const isSample = !hasRealBookings;
                      const dateLabel = booking.scheduledDate;
                      const timeLabel = booking.scheduledTime;
                      const addressLabel = isSample
                        ? booking.address
                        : booking.customerLocation?.address;

                      const status = booking.status || 'pending';
                      const statusColor = getStatusColor(status);
                      const statusLabel = getStatusLabel(status);

                      return (
                        <TouchableOpacity
                          key={booking.id}
                          style={styles.bookingItem}
                          onPress={() => navigation.navigate('BookingDetail', { bookingId: booking.id })}
                          activeOpacity={0.85}
                        >
                          <View style={styles.bookingLeft}>
                            <Text style={styles.bookingCustomer}>{booking.customerName}</Text>
                            <Text style={styles.bookingService}>{booking.serviceName || booking.items?.[0]?.name || booking.items?.[0]?.title || 'Service'}</Text>
                            <View style={styles.bookingMetaRow}>
                              <MaterialCommunityIcons
                                name="calendar-blank-outline"
                                size={14}
                                color="#94a3b8"
                              />
                              <Text style={styles.bookingTimeText}>{dateLabel}</Text>
                            </View>
                            <View style={styles.bookingMetaRow}>
                              <MaterialCommunityIcons
                                name="clock-time-four-outline"
                                size={14}
                                color="#94a3b8"
                              />
                              <Text style={styles.bookingTimeText}>{timeLabel}</Text>
                            </View>
                            {addressLabel ? (
                              <View style={styles.bookingMetaRow}>
                                <MaterialCommunityIcons
                                  name="map-marker-outline"
                                  size={14}
                                  color="#94a3b8"
                                />
                                <Text style={styles.bookingAddressText}>{addressLabel}</Text>
                              </View>
                            ) : null}
                          </View>
                          <View style={styles.bookingRight}>
                            <Chip
                              mode="flat"
                              style={[
                                styles.statusChip,
                                { backgroundColor: statusColor + '30' },
                              ]}
                              textStyle={{ color: statusColor, fontSize: 11, fontWeight: '600' }}
                            >
                              {statusLabel}
                            </Chip>
                            <Text style={styles.bookingAmount}>₹{booking.totalAmount}</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              );
            })()}
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Quick Actions</Title>
            <View style={styles.quickActionsGrid}>
              <QuickActionCard
                title="View Bookings"
                icon="clipboard-list"
                color="#3b82f6"
                onPress={() => navigation.navigate('Bookings')}
              />
              <QuickActionCard
                title="Earnings"
                icon="wallet"
                color="#10b981"
                onPress={() => navigation.navigate('Earnings')}
              />
              <QuickActionCard
                title="Services"
                icon="briefcase"
                color="#8b5cf6"
                onPress={() => navigation.navigate('Services')}
              />
              <QuickActionCard
                title="Profile"
                icon="account-cog"
                color="#f59e0b"
                onPress={() => navigation.navigate('Profile')}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Recent Activity</Title>
            <View style={styles.activityList}>
              <ActivityItem
                icon="check-circle"
                color="#10b981"
                title="Job Completed"
                subtitle="Plumbing service for John Doe"
                time="2 hours ago"
              />
              <ActivityItem
                icon="currency-inr"
                color="#3b82f6"
                title="Payment Received"
                subtitle="₹450 credited to your wallet"
                time="3 hours ago"
              />
              <ActivityItem
                icon="star"
                color="#f59e0b"
                title="New Rating"
                subtitle="5 stars from Sarah Wilson"
                time="5 hours ago"
              />
            </View>
          </Card.Content>
        </Card>

        <Modal
          visible={showNotifications}
          transparent
          animationType="slide"
          onRequestClose={handleCloseNotifications}
        >
          <View style={styles.notificationOverlay}>
            <View style={styles.notificationContainer}>
              <View style={styles.notificationHeaderRow}>
                <Text style={styles.notificationTitle}>Notifications</Text>
                <TouchableOpacity onPress={handleSendTestNotification} style={styles.notificationTestButton}>
                  <Text style={styles.notificationTestButtonText}>Test</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCloseNotifications} style={styles.notificationCloseButton}>
                  <MaterialCommunityIcons name="close" size={20} color="#64748b" />
                </TouchableOpacity>
              </View>

              {notifications.length === 0 ? (
                <View style={styles.notificationEmptyState}>
                  <MaterialCommunityIcons name="bell-off-outline" size={40} color="#94a3b8" />
                  <Text style={styles.notificationEmptyTitle}>No notifications yet</Text>
                  <Text style={styles.notificationEmptyText}>
                    You will see booking updates and messages here.
                  </Text>
                </View>
              ) : (
                <ScrollView style={styles.notificationList}>
                  {notifications.map((n) => (
                    <View key={n.id} style={styles.notificationItem}>
                      <View style={styles.notificationIconWrapper}>
                        <MaterialCommunityIcons
                          name={
                            n.type === 'booking_request'
                              ? 'clipboard-list'
                              : n.type === 'chat_message'
                                ? 'message-text-outline'
                                : 'bell-outline'
                          }
                          size={20}
                          color="#6366f1"
                        />
                      </View>
                      <View style={styles.notificationTextBlock}>
                        <Text style={styles.notificationItemTitle}>{n.title}</Text>
                        <Text style={styles.notificationItemBody} numberOfLines={2}>
                          {n.body}
                        </Text>
                        <Text style={styles.notificationItemTime}>
                          {new Date(n.createdAt).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        <Modal
          visible={showMenu}
          transparent
          animationType="fade"
          onRequestClose={() => setShowMenu(false)}
        >
          <View style={styles.menuOverlay}>
            <View style={styles.menuContainer}>
              <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); navigation.navigate('Profile'); }}>
                <MaterialCommunityIcons name="account-cog" size={18} color="#0f172a" />
                <Text style={styles.menuItemText}>Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); navigation.navigate('Notifications'); }}>
                <MaterialCommunityIcons name="bell-ring" size={18} color="#0f172a" />
                <Text style={styles.menuItemText}>Notifications</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); navigation.navigate('ServiceArea'); }}>
                <MaterialCommunityIcons name="map-marker-radius" size={18} color="#0f172a" />
                <Text style={styles.menuItemText}>Service area</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); navigation.navigate('BankDetails'); }}>
                <MaterialCommunityIcons name="credit-card" size={18} color="#0f172a" />
                <Text style={styles.menuItemText}>Bank details</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); navigation.navigate('KYCUpload'); }}>
                <MaterialCommunityIcons name="id-card" size={18} color="#0f172a" />
                <Text style={styles.menuItemText}>KYC & documents</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.menuItem, { justifyContent: 'center' }]} onPress={() => setShowMenu(false)}>
                <Text style={[styles.menuItemText, { color: '#6366f1' }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

const ActivityItem = ({ icon, color, title, subtitle, time }: any) => (
  <View style={styles.activityItem}>
    <View style={[styles.activityIcon, { backgroundColor: color + '20' }]}>
      <MaterialCommunityIcons name={icon} size={20} color={color} />
    </View>
    <View style={styles.activityContent}>
      <Text style={styles.activityTitle}>{title}</Text>
      <Text style={styles.activitySubtitle}>{subtitle}</Text>
    </View>
    <Text style={styles.activityTime}>{time}</Text>
  </View>
);

const getStatusColor = (status: string) => {
  switch (status) {
    case 'accepted': return '#3b82f6';
    case 'on_the_way': return '#f59e0b';
    case 'arrived': return '#8b5cf6';
    case 'work_started': return '#10b981';
    case 'work_completed': return '#059669';
    default: return '#64748b';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'accepted':
      return 'Confirmed';
    case 'pending':
      return 'Pending';
    case 'on_the_way':
      return 'On the way';
    case 'arrived':
      return 'Arrived';
    case 'work_started':
      return 'In progress';
    case 'work_completed':
      return 'Completed';
    default:
      return 'Pending';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  innerContent: {
    width: '100%',
  },
  innerContentLarge: {
    maxWidth: 960,
    alignSelf: 'center',
  },
  headerWrapper: {
    marginHorizontal: 16,
    marginTop: 50,
    marginBottom: 8,
  },
  summaryCard: {
    borderRadius: 18,
    backgroundColor: '#ffffff',
    elevation: 3,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryTextBlock: {
    flex: 1,
    paddingRight: 12,
  },
  summaryGreeting: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  summaryName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  summaryRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notificationBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  summaryStatsRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  summaryStatCard: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#8b5cf6',
  },
  summaryStatLabel: {
    fontSize: 13,
    color: '#ffffffff',
    marginBottom: 4,
  },
  summaryStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 116,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  vendorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  onlineToggle: {
    alignItems: 'center',
  },
  onlineLabel: {
    fontSize: 12,
    color: '#ffffff',
    marginBottom: 4,
    fontWeight: '600',
  },
  profileButton: {
    // Additional styling if needed
  },
  onlineBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 10,
    elevation: 4,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  onlineBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  onlineBannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  pulseIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
  },
  statsScroll: {
    marginTop: 18,
  },
  statsScrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  statCard: {
    width: 260,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    elevation: 4,
    marginRight: 16,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  statTextBlock: {
    flex: 1,
    paddingRight: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  statIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeTabsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
    marginTop: 16,
  },
  rangeChipActive: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    height: 32,
  },
  rangeChipInactive: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#c4b5fd',
    height: 32,
  },
  rangeChipTextActive: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  rangeChipTextInactive: {
    color: '#e5e7eb',
    fontWeight: '500',
  },
  metricsGrid: {
    marginTop: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#eef2ff',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#c7d2fe',
    elevation: 2,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  metricCardJobs: {
    backgroundColor: '#dbeafe',
    borderColor: '#93c5fd',
  },
  metricCardEarnings: {
    backgroundColor: '#fed7aa',
    borderColor: '#fb923c',
  },
  metricCardMonth: {
    backgroundColor: '#bbf7d0',
    borderColor: '#4ade80',
  },
  metricCardTime: {
    backgroundColor: '#bae6fd',
    borderColor: '#38bdf8',
  },
  metricIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#0f172a',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#020617',
  },
  sectionCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  countChip: {
    backgroundColor: '#6366f1',
  },
  bookingsHeaderRow: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 4,
  },
  bookingsHeaderLabel: {
    fontSize: 11,
    letterSpacing: 1.2,
    fontWeight: '600',
    color: '#9ca3af',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3b82f6',
  },
  bookingsSubHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingsSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  bookingsHint: {
    fontSize: 11,
    color: '#94a3b8',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 15,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },
  bookingsList: {
    gap: 10,
  },
  bookingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  bookingLeft: {
    flex: 1,
    paddingRight: 8,
  },
  bookingService: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  bookingCustomer: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  bookingTime: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  bookingMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  bookingTimeText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  bookingAddressText: {
    fontSize: 12,
    color: '#9ca3af',
    flexShrink: 1,
  },
  bookingRight: {
    alignItems: 'flex-end',
  },
  statusChip: {
    marginBottom: 4,
  },
  bookingAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  viewAllButton: {
    marginTop: 8,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#eef2ff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#c7d2fe',
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  activityList: {
    gap: 10,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  notificationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.6)',
    justifyContent: 'flex-end',
  },
  notificationContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    maxHeight: '70%',
  },
  notificationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  notificationTestButton: {
    marginRight: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#e0e7ff',
  },
  notificationTestButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4f46e5',
  },
  notificationCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },
  notificationEmptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  notificationEmptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginTop: 12,
    marginBottom: 4,
  },
  notificationEmptyText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
  },
  notificationList: {
    marginTop: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  notificationIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  notificationTextBlock: {
    flex: 1,
  },
  notificationItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  notificationItemBody: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  notificationItemTime: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    marginTop: 70,
    marginRight: 12,
    width: 220,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 8,
    elevation: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  menuItemText: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
  },
});
