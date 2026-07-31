import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Platform, Alert, RefreshControl } from 'react-native';
import { Card, Title, Text, Chip, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppDispatch as useReduxDispatch, useAppSelector } from '@/store';
import { fetchActiveBookings, fetchCompletedBookings, updateBookingStatus, acceptBooking, rejectBooking } from '@/store/slices/bookingSlice';

export default function BookingList({ navigation }: any) {
  const { width: windowWidth } = useWindowDimensions();
  const isLargeScreen = Platform.OS === 'web' && windowWidth >= 900;
  const [selectedFilter, setSelectedFilter] = useState<'active' | 'completed' | 'cancelled'>('active');
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useReduxDispatch();
  const { activeBookings, completedBookings, isLoading } = useAppSelector((state) => state.booking);

  const loadData = useCallback(async () => {
    await Promise.all([
      dispatch(fetchActiveBookings()),
      dispatch(fetchCompletedBookings(1))
    ]);
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert(
      'Cancel Service',
      'Are you sure you want to cancel this service?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            dispatch(updateBookingStatus({ bookingId, status: 'cancelled' }));
          },
        },
      ]
    );
  };

  // Demo data to preview UI when there are no real bookings yet
  const demoActiveBookings = [
    {
      id: 'demo-1',
      serviceName: 'AC Service',
      customerName: 'Rahul Verma',
      time: 'Today • 4:30 PM',
      address: 'Andheri West, Mumbai',
      status: 'pending',
      amount: 750,
    },
    {
      id: 'demo-2',
      serviceName: 'Deep Cleaning',
      customerName: 'Sneha Kapoor',
      time: 'Today • 6:00 PM',
      address: 'Bandra East, Mumbai',
      status: 'on_the_way',
      amount: 1200,
    },
  ];

  const demoCompletedBookings = [
    {
      id: 'demo-3',
      serviceName: 'Full Home Cleaning',
      customerName: 'Karan Singh',
      time: 'Yesterday • 2:00 PM',
      address: 'Powai, Mumbai',
      status: 'work_completed',
      amount: 1500,
    },
  ];

  const demoCancelledBookings = [
    {
      id: 'demo-4',
      serviceName: 'Plumbing Fix',
      customerName: 'Rohan Mehta',
      time: '2 days ago • 5:00 PM',
      address: 'Thane, Mumbai',
      status: 'cancelled',
      amount: 650,
    },
    {
      id: 'demo-5',
      serviceName: 'AC Repair',
      customerName: 'Priya Sharma',
      time: 'Last week • 11:00 AM',
      address: 'Goregaon East, Mumbai',
      status: 'rejected',
      amount: 800,
    },
  ];

  const { user } = useAppSelector((state) => state.auth);

  const completedList = completedBookings.filter((b: any) =>
    b.status === 'work_completed' || b.status === 'completed'
  );
  const cancelledList = completedBookings.filter(
    (b: any) =>
      ['cancelled', 'rejected', 'rejected_by_vendor', 'cancelled_by_user', 'no_vendor_available'].includes(b.status) ||
      (b.rejectedVendors && b.rejectedVendors.includes((user as any)?._id || user?.id))
  );

  const hasRealActive = activeBookings.length > 0;
  const hasRealCompleted = completedBookings.length > 0;

  const activeSource = hasRealActive ? activeBookings : demoActiveBookings;
  const completedSource = hasRealCompleted ? completedList : demoCompletedBookings;
  const cancelledSource = hasRealCompleted ? cancelledList : demoCancelledBookings;

  const activeCount = hasRealActive ? activeBookings.length : demoActiveBookings.length;
  const completedCount = hasRealCompleted ? completedList.length : demoCompletedBookings.length;
  const cancelledCount = hasRealCompleted ? cancelledList.length : demoCancelledBookings.length;
  const totalCount = activeCount + completedCount + cancelledCount;

  const filteredBookings =
    selectedFilter === 'active'
      ? activeSource
      : selectedFilter === 'completed'
        ? completedSource
        : cancelledSource;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return '#3b82f6';
      case 'on_the_way':
        return '#f59e0b';
      case 'arrived':
        return '#8b5cf6';
      case 'work_started':
        return '#10b981';
      case 'work_completed':
      case 'completed':
        return '#059669';
      case 'cancelled':
      case 'rejected':
      case 'rejected_by_vendor':
      case 'cancelled_by_user':
      case 'no_vendor_available':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const getCardBackground = () => {
    // Keep booking service cards neutral; only the 4 summary stats use strong colors
    return '#ffffff';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={[styles.innerContent, isLargeScreen && styles.innerContentLarge]}>
        {/* Header */}
        <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerTextBlock}>
              <Text style={styles.headerTitle}>Bookings</Text>
              <Text style={styles.headerSubtitle}>
                See your active and recent bookings in one place.
              </Text>
            </View>
            <View style={styles.headerIconBlock}>
              <View style={styles.headerIconCircle}>
                <MaterialCommunityIcons name="clipboard-list" size={28} color="#ffffff" />
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <Card style={[styles.summaryCard, styles.summaryCardActive]}>
            <Card.Content>
              <Text style={styles.summaryLabel}>Active</Text>
              <Text style={styles.summaryValue}>{activeCount}</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.summaryCard, styles.summaryCardCompleted]}>
            <Card.Content>
              <Text style={styles.summaryLabel}>Completed</Text>
              <Text style={styles.summaryValue}>{completedCount}</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.summaryRow}>
          <Card style={[styles.summaryCard, styles.summaryCardCancelled]}>
            <Card.Content>
              <Text style={styles.summaryLabel}>Cancelled</Text>
              <Text style={styles.summaryValue}>{cancelledCount}</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.summaryCard, styles.summaryCardTotal]}>
            <Card.Content>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={styles.summaryValue}>{totalCount}</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          <Chip
            style={selectedFilter === 'active' ? styles.filterChip : styles.filterChipMuted}
            textStyle={selectedFilter === 'active' ? undefined : styles.filterChipTextMuted}
            selected={selectedFilter === 'active'}
            onPress={() => setSelectedFilter('active')}
          >
            Active
          </Chip>
          <Chip
            style={selectedFilter === 'completed' ? styles.filterChip : styles.filterChipMuted}
            textStyle={selectedFilter === 'completed' ? undefined : styles.filterChipTextMuted}
            selected={selectedFilter === 'completed'}
            onPress={() => setSelectedFilter('completed')}
          >
            Completed
          </Chip>
          <Chip
            style={selectedFilter === 'cancelled' ? styles.filterChip : styles.filterChipMuted}
            textStyle={selectedFilter === 'cancelled' ? undefined : styles.filterChipTextMuted}
            selected={selectedFilter === 'cancelled'}
            onPress={() => setSelectedFilter('cancelled')}
          >
            Cancelled
          </Chip>
        </View>

        {/* Booking list */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            {filteredBookings.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="clipboard-list-outline"
                  size={60}
                  color="#94a3b8"
                />
                <Text style={styles.emptyTitle}>
                  {selectedFilter === 'active'
                    ? 'No active bookings'
                    : selectedFilter === 'completed'
                      ? 'No completed bookings'
                      : 'No cancelled bookings'}
                </Text>
                <Text style={styles.emptyText}>
                  {selectedFilter === 'active'
                    ? 'When customers book you, they will appear here.'
                    : 'There are no bookings in this category yet.'}
                </Text>
              </View>
            ) : (
              <View style={styles.bookingList}>
                {filteredBookings.map((booking: any) => {
                  const statusColor = getStatusColor(booking.status);
                  const cardBg = getCardBackground();
                  const timeLabel = booking.time || booking.scheduledTime;
                  const addressLabel = booking.address || booking.customerLocation?.address;
                  const amount = booking.totalAmount ?? booking.amount;

                  return (
                    <TouchableOpacity
                      key={booking.id}
                      style={[styles.bookingItem, { backgroundColor: cardBg, borderLeftColor: statusColor }]}
                      activeOpacity={0.85}
                      onPress={() => navigation.navigate('BookingDetail', { bookingId: booking.id })}
                    >
                      <View style={styles.bookingLeft}>
                        <Text style={styles.bookingService}>{booking.serviceName || booking.items?.[0]?.name || booking.items?.[0]?.title || 'Service'}</Text>
                        <Text style={styles.bookingCustomer}>{booking.customerName}</Text>
                        <View style={styles.bookingMetaRow}>
                          <MaterialCommunityIcons
                            name="clock-outline"
                            size={14}
                            color="#9ca3af"
                          />
                          <Text style={styles.bookingMetaText}>{timeLabel}</Text>
                        </View>
                        <View style={styles.bookingMetaRow}>
                          <MaterialCommunityIcons
                            name="map-marker"
                            size={14}
                            color="#9ca3af"
                          />
                          <Text style={styles.bookingMetaText}>{addressLabel}</Text>
                        </View>
                      </View>
                      <View style={styles.bookingRight}>
                        <Chip
                          style={[
                            styles.statusChip,
                            { backgroundColor: statusColor + '20' },
                          ]}
                          textStyle={{ color: statusColor, fontSize: 11 }}
                        >
                          {booking.status.replace('_', ' ')}
                        </Chip>
                        <Text style={styles.bookingAmount}>₹{amount}</Text>
                        {selectedFilter === 'active' && (booking.status === 'pending' || booking.status === 'waiting_vendor_response') ? (
                          <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
                            <Button
                              mode="contained"
                              compact
                              buttonColor="#3b82f6"
                              onPress={() => dispatch(acceptBooking(booking.id) as any)}
                            >
                              Accept
                            </Button>
                            <Button
                              mode="outlined"
                              compact
                              textColor="#ef4444"
                              style={{ borderColor: '#ef4444' }}
                              onPress={() => dispatch(rejectBooking({ bookingId: booking.id }) as any)}
                            >
                              Reject
                            </Button>
                          </View>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 16,
  },
  innerContent: {
    width: '100%',
  },
  innerContentLarge: {
    maxWidth: 960,
    alignSelf: 'center',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextBlock: {
    flex: 1,
    paddingRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e5e7eb',
    lineHeight: 20,
  },
  headerIconBlock: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#a5b4fc',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#818cf8',
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#ffffff',
  },
  summaryCardActive: {
    backgroundColor: '#dbeafe', // blue tint
  },
  summaryCardCompleted: {
    backgroundColor: '#dcfce7', // green tint
  },
  summaryCardCancelled: {
    backgroundColor: '#fee2e2', // red tint
  },
  summaryCardTotal: {
    backgroundColor: '#fef3c7', // amber tint
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  filterChip: {
    backgroundColor: '#6366f1',
  },
  filterChipMuted: {
    backgroundColor: '#e5e7eb',
  },
  filterChipTextMuted: {
    color: '#4b5563',
  },
  sectionCard: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    elevation: 2,
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
  bookingList: {
    gap: 10,
  },
  bookingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
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
  bookingMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  bookingMetaText: {
    fontSize: 12,
    color: '#9ca3af',
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
});
