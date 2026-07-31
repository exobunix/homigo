import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, DataTable, Searchbar, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchActiveBookings, fetchCompletedBookings } from '@/store/slices/bookingSlice';
import WebLayout from '@/components/WebLayout';
import { theme } from '@/theme/theme';

export default function BookingList({ navigation }: any) {
    const [selectedFilter, setSelectedFilter] = useState<'active' | 'completed' | 'cancelled'>('active');
    const [searchQuery, setSearchQuery] = useState('');
    const dispatch = useAppDispatch();
    const { activeBookings, completedBookings } = useAppSelector((state) => state.booking);

    useEffect(() => {
        dispatch(fetchActiveBookings());
        dispatch(fetchCompletedBookings(1));
    }, [dispatch]);

    const { user } = useAppSelector((state) => state.auth);

    const completedList = completedBookings.filter((b: any) => b.status === 'work_completed' || b.status === 'completed');
    const cancelledList = completedBookings.filter((b: any) =>
        ['cancelled', 'rejected', 'rejected_by_vendor', 'cancelled_by_user', 'no_vendor_available'].includes(b.status) ||
        (b.rejectedVendors && b.rejectedVendors.includes((user as any)?._id || user?.id))
    );

    const activeSource = activeBookings;
    const completedSource = completedList;
    const cancelledSource = cancelledList;

    const filteredBookings = selectedFilter === 'active' ? activeSource : selectedFilter === 'completed' ? completedSource : cancelledSource;

    // Apply search filter
    const finalBookings = filteredBookings.filter((b: any) =>
        b.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accepted': return '#3b82f6';
            case 'on_the_way': return '#f59e0b';
            case 'arrived': return '#8b5cf6';
            case 'work_started': return '#10b981';
            case 'work_completed': case 'completed': return '#059669';
            case 'cancelled': case 'rejected': case 'rejected_by_vendor': case 'cancelled_by_user': case 'no_vendor_available': return '#ef4444';
            default: return '#64748b';
        }
    };

    return (
        <WebLayout
            title="Bookings"
            subtitle="Manage your service requests and history."
            actions={
                <Button mode="contained" icon="calendar-plus" buttonColor={theme.colors.primary} onPress={() => navigation.navigate('Services')}>
                    New Booking
                </Button>
            }
        >
            <ScrollView style={styles.container}>
                <View style={styles.toolbar}>
                    <View style={styles.filterGroup}>
                        <Chip
                            selected={selectedFilter === 'active'}
                            onPress={() => setSelectedFilter('active')}
                            style={styles.chip}
                            showSelectedOverlay
                        >
                            Active
                        </Chip>
                        <Chip
                            selected={selectedFilter === 'completed'}
                            onPress={() => setSelectedFilter('completed')}
                            style={styles.chip}
                            showSelectedOverlay
                        >
                            Completed
                        </Chip>
                        <Chip
                            selected={selectedFilter === 'cancelled'}
                            onPress={() => setSelectedFilter('cancelled')}
                            style={styles.chip}
                            showSelectedOverlay
                        >
                            Cancelled
                        </Chip>
                    </View>

                    <Searchbar
                        placeholder="Search bookings..."
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        style={styles.searchBar}
                        inputStyle={styles.searchInput}
                    />
                </View>

                <Card style={styles.tableCard}>
                    {finalBookings.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="clipboard-text-off-outline" size={48} color="#cbd5e1" />
                            <Text style={styles.emptyText}>No bookings found.</Text>
                        </View>
                    ) : (
                        <DataTable>
                            <DataTable.Header>
                                <DataTable.Title style={{ flex: 2 }}>Service Details</DataTable.Title>
                                <DataTable.Title style={{ flex: 2 }}>Customer</DataTable.Title>
                                <DataTable.Title style={{ flex: 1.5 }}>Date & Time</DataTable.Title>
                                <DataTable.Title style={{ flex: 2 }}>Location</DataTable.Title>
                                <DataTable.Title style={{ flex: 1.5, justifyContent: 'center' }}>Status</DataTable.Title>
                                <DataTable.Title numeric style={{ flex: 1 }}>Amount</DataTable.Title>
                                <DataTable.Title numeric style={{ flex: 0.5 }}>Action</DataTable.Title>
                            </DataTable.Header>

                            {finalBookings.map((booking: any, index: number) => (
                                <DataTable.Row key={booking.id || index} style={styles.row}>
                                    <DataTable.Cell style={{ flex: 2 }}>
                                        <View>
                                            <Text style={styles.serviceName}>{booking.serviceName || booking.items?.[0]?.name || booking.items?.[0]?.title || 'Service'}</Text>
                                            <Text style={styles.bookingId}>#{booking.id?.substring(0, 8) || '...'}</Text>
                                        </View>
                                    </DataTable.Cell>
                                    <DataTable.Cell style={{ flex: 2 }}>
                                        <View style={styles.customerCell}>
                                            <View style={styles.avatar}>
                                                <Text style={styles.avatarText}>{booking.customerName?.charAt(0) || 'C'}</Text>
                                            </View>
                                            <Text style={styles.customerName}>{booking.customerName || 'Unknown'}</Text>
                                        </View>
                                    </DataTable.Cell>
                                    <DataTable.Cell style={{ flex: 1.5 }}>{booking.scheduledTime || booking.time || 'Time TBD'}</DataTable.Cell>
                                    <DataTable.Cell style={{ flex: 2 }}>
                                        <Text numberOfLines={1} style={styles.addressText}>
                                            {booking.customerLocation?.address || booking.address || 'No Address'}
                                        </Text>
                                    </DataTable.Cell>
                                    <DataTable.Cell style={{ flex: 1.5, justifyContent: 'center' }}>
                                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                            <Chip
                                                style={[styles.statusChip, { backgroundColor: getStatusColor(booking.status) + '20' }]}
                                                textStyle={{ color: getStatusColor(booking.status), fontSize: 12, textAlign: 'center' }}
                                            >
                                                {booking.status?.replace('_', ' ') || 'Pending'}
                                            </Chip>
                                        </View>
                                    </DataTable.Cell>
                                    <DataTable.Cell numeric style={{ flex: 1 }}>
                                        <Text style={styles.amountText}>₹{booking.amount || booking.totalAmount || 0}</Text>
                                    </DataTable.Cell>
                                    <DataTable.Cell numeric style={{ flex: 0.5 }}>
                                        <TouchableOpacity onPress={() => navigation.navigate('BookingDetail', { bookingId: booking.id })}>
                                            <MaterialCommunityIcons name="dots-horizontal" size={24} color="#64748b" />
                                        </TouchableOpacity>
                                    </DataTable.Cell>
                                </DataTable.Row>
                            ))}
                        </DataTable>
                    )}
                </Card>
            </ScrollView>
        </WebLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 32,
    },
    toolbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    filterGroup: {
        flexDirection: 'row',
        gap: 12,
    },
    chip: {
        backgroundColor: '#ffffff',
    },
    searchBar: {
        width: 300,
        height: 40,
        backgroundColor: '#ffffff',
        elevation: 0,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    searchInput: {
        minHeight: 0,
        fontSize: 14,
    },
    tableCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        elevation: 2,
        overflow: 'hidden',
    },
    row: {
        minHeight: 72,
    },
    serviceName: {
        fontWeight: '600',
        color: '#1e293b',
    },
    bookingId: {
        fontSize: 12,
        color: '#94a3b8',
    },
    customerCell: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#e0e7ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#6366f1',
        fontWeight: '600',
        fontSize: 14,
    },
    customerName: {
        color: '#1e293b',
        fontWeight: '500',
    },
    addressText: {
        color: '#64748b',
        maxWidth: 200,
    },
    statusChip: {
        height: 32,
        backgroundColor: 'transparent',
    },
    amountText: {
        fontWeight: '600',
        color: '#1e293b',
    },
    emptyState: {
        padding: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#64748b',
    },
});
