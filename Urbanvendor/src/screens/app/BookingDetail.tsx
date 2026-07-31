import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Title, Text, Button, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@/store';
import { RootStackParamList, Booking } from '@/types';
import type { RouteProp } from '@react-navigation/native';
import { acceptBooking, rejectBooking, updateBookingStatus } from '@/store/slices/bookingSlice';

type BookingDetailRouteProp = RouteProp<RootStackParamList, 'BookingDetail'>;

export default function BookingDetail() {
  const route = useRoute<BookingDetailRouteProp>();
  const { bookingId } = route.params;
  const dispatch = useAppDispatch();
  const { activeBookings, completedBookings, isLoading } = useAppSelector((state) => state.booking);
  const [submitting, setSubmitting] = useState(false);

  const allBookings: Booking[] = [...activeBookings, ...completedBookings];
  const bookingFromStore = allBookings.find((b) => b.id === bookingId);
  const isSampleBooking = !bookingFromStore;
  const booking: Booking = bookingFromStore ?? {
    id: bookingId,
    customerId: 'demo-customer',
    customerName: 'Jane Doe',
    customerPhone: '+1 555-123-4567',
    customerLocation: {
      latitude: 0,
      longitude: 0,
      address: '4517 Washington Ave.',
      city: 'Manchester',
      state: 'Kentucky',
      pincode: '12345',
    },
    serviceId: 'demo-service',
    serviceName: 'Deep Home Cleaning',
    serviceVariants: [],
    scheduledDate: new Date().toISOString(),
    scheduledTime: '10:00 AM - 12:00 PM',
    status: 'pending',
    totalAmount: 162.5,
    additionalCharges: [],
    workImages: [],
    customerSignature: undefined,
    rating: 4.8,
    review: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    estimatedDuration: 120,
    actualStartTime: undefined,
    actualEndTime: undefined,
    cancellationReason: undefined,
    paymentStatus: 'paid',
    commission: 0,
    vendorEarning: 162.5,
  } as Booking;

  const serviceFee = booking.totalAmount * 0.92;
  const taxesAndFees = booking.totalAmount - serviceFee;

  const formatStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'UPCOMING';
      case 'accepted':
      case 'on_the_way':
      case 'arrived':
      case 'work_started':
        return 'IN PROGRESS';
      case 'work_completed':
      case 'completed':
        return 'COMPLETED';
      case 'cancelled':
      case 'rejected':
      case 'rejected_by_vendor':
      case 'cancelled_by_user':
      case 'no_vendor_available':
        return 'CANCELLED';
      default:
        return status.toUpperCase().replace(/_/g, ' ');
    }
  };

  const statusLabel = formatStatusLabel(booking.status);
  const statusColor =
    (booking.status as string) === 'work_completed' || (booking.status as string) === 'completed'
      ? '#22c55e'
      : ['cancelled', 'rejected', 'rejected_by_vendor', 'cancelled_by_user', 'no_vendor_available'].includes(booking.status)
        ? '#ef4444'
        : '#fbbf24';

  const formattedDate = new Date(booking.scheduledDate).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  const nextStatus = useMemo(() => {
    switch (booking.status) {
      case 'accepted':
        return { key: 'on_the_way', label: 'On the way' } as const;
      case 'on_the_way':
        return { key: 'arrived', label: 'Mark Arrived' } as const;
      case 'arrived':
        return { key: 'work_started', label: 'Start Work' } as const;
      case 'work_started':
        return { key: 'work_completed', label: 'Setup Complete' } as const;
      default:
        return null;
    }
  }, [booking.status]);

  const canAcceptReject = !isSampleBooking && booking.status === 'pending';
  const canProgress = !isSampleBooking && !!nextStatus;

  const handleAccept = async () => {
    try {
      setSubmitting(true);
      await dispatch(acceptBooking(booking.id) as any);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    try {
      setSubmitting(true);
      await dispatch(rejectBooking({ bookingId: booking.id }) as any);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProgress = async () => {
    if (!nextStatus) return;
    try {
      setSubmitting(true);
      await dispatch(updateBookingStatus({ bookingId: booking.id, status: nextStatus.key as any }) as any);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerRow}>
        <Chip style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}
          textStyle={[styles.statusChipText, { color: statusColor }]}
        >
          {statusLabel}
        </Chip>
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.serviceTitle}>{booking.serviceName}</Text>
        <Text style={styles.bookingId}>Booking ID #{booking.id}</Text>
      </View>

      <Card style={styles.sectionCard}>
        <Card.Content style={styles.rowAligned}>
          <View style={styles.iconCircleLarge}>
            <MaterialCommunityIcons name="calendar-month-outline" size={24} color="#2563eb" />
          </View>
          <View style={styles.sectionTextBlock}>
            <Text style={styles.sectionLabel}>Schedule</Text>
            <Text style={styles.sectionPrimary}>{formattedDate}</Text>
            <Text style={styles.sectionSecondary}>{booking.scheduledTime}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionHeader}>Customer Details</Text>
          <View style={styles.customerRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>{booking.customerName.charAt(0)}</Text>
            </View>
            <View style={styles.customerTextBlock}>
              <Text style={styles.customerName}>{booking.customerName}</Text>
              <Text style={styles.customerPhone}>{booking.customerPhone}</Text>
            </View>
            {booking.rating && (
              <View style={styles.ratingRow}>
                <MaterialCommunityIcons name="star" size={16} color="#facc15" />
                <Text style={styles.ratingValue}>{booking.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionHeader}>Location</Text>
          <View style={styles.locationRow}>
            <View style={styles.iconCircleSmall}>
              <MaterialCommunityIcons name="map-marker" size={20} color="#2563eb" />
            </View>
            <View style={styles.locationTextBlock}>
              <Text style={styles.locationAddress}>{booking.customerLocation?.address || 'No address provided'}</Text>
              <Text style={styles.locationCity}>{booking.customerLocation?.city ? `${booking.customerLocation.city}, ${booking.customerLocation.state}` : 'City not available'}</Text>
            </View>
          </View>
          <View style={styles.mapPlaceholder}>
            <MaterialCommunityIcons name="map" size={40} color="#93c5fd" />
          </View>
          <View style={styles.locationActionsRow}>
            <Button
              mode="contained"
              icon="navigation-variant"
              style={styles.locationButtonPrimary}
              onPress={() => { }}
            >
              Navigate to Address
            </Button>
            <Button
              mode="outlined"
              icon="phone"
              style={styles.locationButtonSecondary}
              textColor="#0f172a"
              onPress={() => { }}
            >
              Call Customer
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionHeader}>Payment Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Fee</Text>
            <Text style={styles.summaryValue}>₹{serviceFee.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Taxes & Fees</Text>
            <Text style={styles.summaryValue}>₹{taxesAndFees.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total Amount</Text>
            <Text style={styles.summaryTotalValue}>₹{booking.totalAmount.toFixed(2)}</Text>
          </View>
          {booking.paymentStatus === 'paid' && (
            <View style={styles.paymentStatusChip}>
              <MaterialCommunityIcons name="check-circle" size={16} color="#16a34a" />
              <Text style={styles.paymentStatusText}>Online Payment Received</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Action buttons */}
      {canAcceptReject ? (
        <View style={styles.primaryActionsRow}>
          <Button
            mode="contained"
            icon="check"
            style={styles.primaryAction}
            onPress={handleAccept}
            loading={submitting || isLoading}
            disabled={submitting || isLoading}
          >
            Accept
          </Button>
          <Button
            mode="outlined"
            icon="close"
            style={styles.secondaryAction}
            textColor="#ef4444"
            onPress={handleReject}
            disabled={submitting || isLoading}
          >
            Reject
          </Button>
        </View>
      ) : canProgress ? (
        <View style={styles.primaryActionsRow}>
          <Button
            mode="contained"
            icon="progress-check"
            style={styles.primaryAction}
            onPress={handleProgress}
            loading={submitting || isLoading}
            disabled={submitting || isLoading}
          >
            {nextStatus?.label}
          </Button>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  statusChip: {
    borderRadius: 999,
    paddingHorizontal: 8,
    height: 28,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  titleBlock: {
    marginBottom: 16,
  },
  serviceTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  bookingId: {
    fontSize: 13,
    color: '#6b7280',
  },
  sectionCard: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
    marginBottom: 12,
    elevation: 2,
  },
  rowAligned: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircleLarge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTextBlock: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  sectionPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  sectionSecondary: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#bfdbfe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  customerTextBlock: {
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  customerPhone: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircleSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  locationTextBlock: {
    flex: 1,
  },
  locationAddress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  locationCity: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  mapPlaceholder: {
    height: 140,
    borderRadius: 12,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  locationActionsRow: {
    flexDirection: 'column',
    gap: 8,
  },
  locationButtonPrimary: {
    borderRadius: 999,
  },
  locationButtonSecondary: {
    borderRadius: 999,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginTop: 10,
    marginBottom: 4,
  },
  summaryTotalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  paymentStatusChip: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#dcfce7',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  paymentStatusText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
  },
  actionsRow: {
    marginTop: 16,
    alignItems: 'center',
    gap: 8,
  },
  linkButton: {
    paddingVertical: 4,
  },
  linkPrimary: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  linkDanger: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  },
  primaryActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  primaryAction: {
    flex: 1,
    borderRadius: 8,
  },
  secondaryAction: {
    flex: 1,
    borderRadius: 8,
    borderColor: '#ef4444',
  },
});
