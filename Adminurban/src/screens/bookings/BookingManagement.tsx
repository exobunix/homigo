import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Platform } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../auth/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';

import { useRefresh } from '../../hooks/useRefresh';

export const BookingManagement = ({ onNavigate }: { onNavigate?: (page: string) => void }) => {
    const { admin, logout } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<string>('all');
    const [selectedDate, setSelectedDate] = useState<string>('all');
    const [showVendorDropdown, setShowVendorDropdown] = useState(false);
    const [showDateDropdown, setShowDateDropdown] = useState(false);

    const fetchBookings = async () => {
        if (!refreshing) setLoading(true);
        const response = await api.getBookings();
        if (response.success) {
            setBookings(response.data);
        }
        setLoading(false);
        setRefreshing(false);
    };

    const fetchVendors = async () => {
        const response = await api.getVendors();
        if (response.success) {
            setVendors(response.data);
        }
    };

    useRefresh(
        React.useCallback(() => {
            fetchBookings();
            fetchVendors();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings();
    };

    // Date filter options
    const dateOptions = [
        { label: 'All Dates', value: 'all' },
        { label: 'Today', value: 'today' },
        { label: 'Yesterday', value: 'yesterday' },
        { label: 'Last 7 Days', value: 'week' },
        { label: 'Last 30 Days', value: 'month' },
    ];

    // Filter bookings by search, vendor, and date
    const filteredBookings = bookings.filter(booking => {
        // Search filter
        const matchesSearch =
            (booking.serviceName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (booking.user?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (booking.vendor?.businessName?.toLowerCase() || '').includes(searchQuery.toLowerCase());

        // Vendor filter
        const matchesVendor = selectedVendor === 'all' || booking.vendor?._id === selectedVendor;

        // Date filter
        let matchesDate = true;
        if (selectedDate !== 'all') {
            const bookingDate = new Date(booking.createdAt);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            switch (selectedDate) {
                case 'today':
                    matchesDate = bookingDate >= today;
                    break;
                case 'yesterday':
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    matchesDate = bookingDate >= yesterday && bookingDate < today;
                    break;
                case 'week':
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    matchesDate = bookingDate >= weekAgo;
                    break;
                case 'month':
                    const monthAgo = new Date(today);
                    monthAgo.setDate(monthAgo.getDate() - 30);
                    matchesDate = bookingDate >= monthAgo;
                    break;
            }
        }

        return matchesSearch && matchesVendor && matchesDate;
    });

    const stats = [
        { label: 'Total Bookings', value: filteredBookings.length.toString(), icon: 'calendar', gradient: ['#4facfe', '#00f2fe'] },
        { label: 'Completed', value: filteredBookings.filter(b => ['completed', 'work_completed'].includes(b.status)).length.toString(), icon: 'checkmark-circle', gradient: ['#43e97b', '#38f9d7'] },
        { label: 'Pending', value: filteredBookings.filter(b => ['pending', 'searching_vendor', 'waiting_vendor_response', 'waiting_user_approval'].includes(b.status)).length.toString(), icon: 'time', gradient: ['#fa709a', '#fee140'] },
    ];

    const getStatusColor = (status: string) => {
        const s = status.toLowerCase();
        if (['completed', 'work_completed'].includes(s)) return '#10b981';
        if (['pending', 'searching_vendor', 'waiting_vendor_response', 'waiting_user_approval'].includes(s)) return '#f59e0b';
        if (['cancelled', 'cancelled_by_user', 'rejected', 'rejected_by_vendor', 'no_vendor_available'].includes(s)) return '#ef4444';
        if (['accepted', 'confirmed', 'on_the_way', 'arrived', 'work_started'].includes(s)) return '#3b82f6';

        switch (s) {
            case 'completed': return '#10b981';
            case 'pending': return '#f59e0b';
            case 'cancelled': return '#ef4444';
            case 'accepted': return '#3b82f6';
            default: return '#64748b';
        }
    };

    const getStatusBg = (status: string) => {
        const s = status.toLowerCase();
        if (['completed', 'work_completed'].includes(s)) return '#d1fae5';
        if (['pending', 'searching_vendor', 'waiting_vendor_response', 'waiting_user_approval'].includes(s)) return '#fef3c7';
        if (['cancelled', 'cancelled_by_user', 'rejected', 'rejected_by_vendor', 'no_vendor_available'].includes(s)) return '#fee2e2';
        if (['accepted', 'confirmed', 'on_the_way', 'arrived', 'work_started'].includes(s)) return '#dbeafe';

        switch (s) {
            case 'completed': return '#d1fae5';
            case 'pending': return '#fef3c7';
            case 'cancelled': return '#fee2e2';
            case 'accepted': return '#dbeafe';
            default: return '#f1f5f9';
        }
    };

    const renderBookingCard = ({ item }: { item: any }) => {
        const date = new Date(item.createdAt).toLocaleDateString();
        const statusColor = getStatusColor(item.status);
        const statusBg = getStatusBg(item.status);

        return (
            <TouchableOpacity style={styles.bookingCard} activeOpacity={0.7}>
                <View style={styles.bookingHeader}>
                    <View style={styles.serviceInfo}>
                        <LinearGradient
                            colors={['#4facfe', '#00f2fe']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.serviceIcon}
                        >
                            <Ionicons name="construct" size={20} color="#fff" />
                        </LinearGradient>
                        <View>
                            <Text style={styles.serviceName}>{item.serviceName || 'Service'}</Text>
                            <Text style={styles.bookingId}>#{item._id.slice(-6)}</Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.bookingDetails}>
                    <View style={styles.detailRow}>
                        <View style={styles.detailItem}>
                            <Ionicons name="person" size={14} color="#64748b" />
                            <Text style={styles.detailLabel}>Customer</Text>
                        </View>
                        <Text style={styles.detailValue}>{item.user?.name || 'Unknown'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <View style={styles.detailItem}>
                            <Ionicons name="briefcase" size={14} color="#64748b" />
                            <Text style={styles.detailLabel}>Vendor</Text>
                        </View>
                        <Text style={styles.detailValue}>{item.vendor?.businessName || item.vendor?.name || 'Unassigned'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <View style={styles.detailItem}>
                            <Ionicons name="calendar" size={14} color="#64748b" />
                            <Text style={styles.detailLabel}>Date</Text>
                        </View>
                        <Text style={styles.detailValue}>{date}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <View style={styles.detailItem}>
                            <Ionicons name="cash" size={14} color="#64748b" />
                            <Text style={styles.detailLabel}>Amount</Text>
                        </View>
                        <Text style={styles.amountValue}>₹{item.totalAmount}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ScreenWrapper
            title="Booking Management"
            onLogout={logout}
            adminName={admin?.name || 'Admin'}
            currentPage="bookings"
            onNavigate={onNavigate}
        >
            {/* Stats Row */}
            <View style={styles.statsRow}>
                {stats.map((stat, index) => (
                    <View key={index} style={styles.statCard}>
                        <LinearGradient
                            colors={stat.gradient as any}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.statIconContainer}
                        >
                            <Ionicons name={stat.icon as any} size={20} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.statValue}>{stat.value}</Text>
                        <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                ))}
            </View>

            {/* Search */}
            <View style={styles.searchSection}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search bookings..."
                        placeholderTextColor="#94a3b8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filters - Inside searchSection for proper z-index */}
                <View style={styles.filtersRow}>
                    {/* Vendor Filter */}
                    <View style={styles.filterContainer}>
                        <TouchableOpacity
                            style={styles.filterButton}
                            onPress={() => {
                                setShowVendorDropdown(!showVendorDropdown);
                                setShowDateDropdown(false);
                            }}
                        >
                            <Ionicons name="briefcase-outline" size={18} color="#64748b" />
                            <Text style={styles.filterButtonText}>
                                {selectedVendor === 'all' ? 'All Vendors' : vendors.find(v => v._id === selectedVendor)?.name || 'Vendor'}
                            </Text>
                            <Ionicons name="chevron-down" size={18} color="#64748b" />
                        </TouchableOpacity>

                        {showVendorDropdown && (
                            <View style={styles.dropdown}>
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setSelectedVendor('all');
                                        setShowVendorDropdown(false);
                                    }}
                                >
                                    <Text style={[styles.dropdownText, selectedVendor === 'all' && styles.dropdownTextActive]}>
                                        All Vendors
                                    </Text>
                                </TouchableOpacity>
                                {vendors.map(vendor => (
                                    <TouchableOpacity
                                        key={vendor._id}
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            setSelectedVendor(vendor._id);
                                            setShowVendorDropdown(false);
                                        }}
                                    >
                                        <Text style={[styles.dropdownText, selectedVendor === vendor._id && styles.dropdownTextActive]}>
                                            {vendor.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Date Filter */}
                    <View style={styles.filterContainer}>
                        <TouchableOpacity
                            style={styles.filterButton}
                            onPress={() => {
                                setShowDateDropdown(!showDateDropdown);
                                setShowVendorDropdown(false);
                            }}
                        >
                            <Ionicons name="calendar-outline" size={18} color="#64748b" />
                            <Text style={styles.filterButtonText}>
                                {dateOptions.find(d => d.value === selectedDate)?.label || 'All Dates'}
                            </Text>
                            <Ionicons name="chevron-down" size={18} color="#64748b" />
                        </TouchableOpacity>

                        {showDateDropdown && (
                            <View style={styles.dropdown}>
                                {dateOptions.map(option => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            setSelectedDate(option.value);
                                            setShowDateDropdown(false);
                                        }}
                                    >
                                        <Text style={[styles.dropdownText, selectedDate === option.value && styles.dropdownTextActive]}>
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* Bookings List */}
            <View style={styles.listHeader}>
                <Text style={styles.listTitle}>
                    All Bookings ({filteredBookings.length})
                </Text>
            </View>

            <FlatList
                data={filteredBookings}
                keyExtractor={item => item._id}
                renderItem={renderBookingCard}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
                        <Text style={styles.emptyText}>No bookings found</Text>
                    </View>
                }
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    statIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 3,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        color: '#64748b',
        fontWeight: '600',
    },
    searchSection: {
        marginBottom: 24,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1e293b',
        fontWeight: '500',
    },
    filtersRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    filterContainer: {
        flex: 1,
        position: 'relative',
        zIndex: Platform.OS === 'web' ? 9999 : 1000,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    filterButtonText: {
        flex: 1,
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '600',
    },
    dropdown: {
        position: Platform.OS === 'web' ? 'relative' : 'absolute',
        top: Platform.OS === 'web' ? 0 : 50,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
        maxHeight: 250,
        marginTop: Platform.OS === 'web' ? 8 : 0,
        zIndex: Platform.OS === 'web' ? 99999 : 2000,
    },
    dropdownItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    dropdownText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    dropdownTextActive: {
        color: '#3b82f6',
        fontWeight: '700',
    },
    listHeader: {
        marginBottom: 16,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    listContent: {
        paddingBottom: 24,
    },
    bookingCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    serviceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    serviceIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    serviceName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    bookingId: {
        fontSize: 12,
        color: '#94a3b8',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginBottom: 16,
    },
    bookingDetails: {
        gap: 12,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailLabel: {
        fontSize: 13,
        color: '#64748b',
    },
    detailValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1e293b',
    },
    amountValue: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#10b981',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#64748b',
        marginTop: 16,
    },
});
