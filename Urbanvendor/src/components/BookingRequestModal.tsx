import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Modal, Dimensions, Vibration } from 'react-native';
import { Card, Title, Text, Button, Avatar, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppDispatch, useAppSelector } from '@/store';
import { acceptBooking, rejectBooking, hideBookingRequest, decrementTimer } from '@/store/slices/bookingSlice';

const { width, height } = Dimensions.get('window');

export default function BookingRequestModal() {
  const dispatch = useAppDispatch();
  const { currentRequest, requestTimer } = useAppSelector((state) => state.booking);
  const [countdown, setCountdown] = useState(requestTimer);

  useEffect(() => {
    if (requestTimer > 0) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            dispatch(hideBookingRequest());
            return 0;
          }
          dispatch(decrementTimer());
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [requestTimer, dispatch]);

  useEffect(() => {
    // Vibrate when new request comes
    if (currentRequest) {
      Vibration.vibrate([0, 500, 200, 500]);
    }
  }, [currentRequest]);

  const handleAccept = () => {
    if (currentRequest) {
      dispatch(acceptBooking(currentRequest.id));
    }
  };

  const handleReject = () => {
    if (currentRequest) {
      dispatch(rejectBooking({ bookingId: currentRequest.id }));
    }
  };

  if (!currentRequest) return null;

  const getServiceIcon = (serviceName: string) => {
    const service = serviceName.toLowerCase();
    if (service.includes('plumber')) return 'pipe-wrench';
    if (service.includes('electrician')) return 'lightning-bolt';
    if (service.includes('cleaning')) return 'broom';
    if (service.includes('repair')) return 'tools';
    return 'account-hard-hat';
  };

  return (
    <Modal
      visible={true}
      transparent
      animationType="slide"
      onRequestClose={() => dispatch(hideBookingRequest())}
    >
      <View style={styles.overlay}>
        <LinearGradient colors={['#1e293b', '#334155']} style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>{countdown}s</Text>
              <Text style={styles.timerLabel}>to respond</Text>
            </View>
            <MaterialCommunityIcons name="bell-ring" size={24} color="#f59e0b" />
          </View>

          {/* Service Info */}
          <Card style={styles.serviceCard}>
            <Card.Content>
              <View style={styles.serviceHeader}>
                <Avatar.Icon
                  size={50}
                  icon={getServiceIcon(currentRequest.serviceName || (currentRequest as any).items?.[0]?.name || (currentRequest as any).items?.[0]?.title || '')}
                  style={{ backgroundColor: '#6366f1' }}
                />
                <View style={styles.serviceInfo}>
                  <Title style={styles.serviceName}>{currentRequest.serviceName || (currentRequest as any).items?.[0]?.name || (currentRequest as any).items?.[0]?.title || 'Service'}</Title>
                  <Text style={styles.serviceAmount}>₹{currentRequest.totalAmount}</Text>
                </View>
                <Chip
                  mode="flat"
                  style={[styles.priorityChip, {
                    backgroundColor: currentRequest.priority === 'urgent' ? '#ef4444' : '#10b981'
                  }]}
                  textStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                >
                  {currentRequest.priority.toUpperCase()}
                </Chip>
              </View>
            </Card.Content>
          </Card>

          {/* Customer Info */}
          <Card style={styles.customerCard}>
            <Card.Content>
              <View style={styles.customerHeader}>
                <MaterialCommunityIcons name="account" size={24} color="#6366f1" />
                <Text style={styles.sectionTitle}>Customer Details</Text>
              </View>

              <View style={styles.customerInfo}>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="account-circle" size={20} color="#64748b" />
                  <Text style={styles.infoText}>{currentRequest.customerName}</Text>
                </View>

                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="phone" size={20} color="#64748b" />
                  <Text style={styles.infoText}>{currentRequest.customerPhone}</Text>
                </View>

                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="map-marker" size={20} color="#64748b" />
                  <Text style={styles.infoText} numberOfLines={2}>
                    {currentRequest.customerLocation.address}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="map-marker-distance" size={20} color="#64748b" />
                  <Text style={styles.infoText}>{currentRequest.distance.toFixed(1)} km away</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Service Details */}
          <Card style={styles.detailsCard}>
            <Card.Content>
              <View style={styles.detailsHeader}>
                <MaterialCommunityIcons name="clipboard-list" size={24} color="#6366f1" />
                <Text style={styles.sectionTitle}>Service Details</Text>
              </View>

              <View style={styles.detailsInfo}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date & Time:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(currentRequest.scheduledDate).toLocaleDateString()} at {currentRequest.scheduledTime}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Duration:</Text>
                  <Text style={styles.detailValue}>{currentRequest.estimatedDuration} mins</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Customer Rating:</Text>
                  <View style={styles.ratingContainer}>
                    <MaterialCommunityIcons name="star" size={16} color="#f59e0b" />
                    <Text style={styles.detailValue}>{currentRequest.customerRating}/5</Text>
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <Button
              mode="contained"
              onPress={handleReject}
              style={[styles.actionButton, styles.rejectButton]}
              buttonColor="#ef4444"
              textColor="#ffffff"
              icon="close"
            >
              Reject
            </Button>

            <Button
              mode="contained"
              onPress={handleAccept}
              style={[styles.actionButton, styles.acceptButton]}
              buttonColor="#10b981"
              textColor="#ffffff"
              icon="check"
            >
              Accept
            </Button>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.9,
    maxHeight: height * 0.85,
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  timerLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  serviceCard: {
    marginBottom: 15,
    elevation: 4,
    borderRadius: 12,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
    marginLeft: 15,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  serviceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
  },
  priorityChip: {
    alignSelf: 'flex-start',
  },
  customerCard: {
    marginBottom: 15,
    elevation: 4,
    borderRadius: 12,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 8,
  },
  customerInfo: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
  },
  detailsCard: {
    marginBottom: 20,
    elevation: 4,
    borderRadius: 12,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailsInfo: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
  },
  rejectButton: {
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  acceptButton: {
    elevation: 4,
  },
});
