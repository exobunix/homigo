import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../auth/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';
import { confirmAction, showAlert } from '../../utils/alert';

import { useRefresh } from '../../hooks/useRefresh';

export const VendorManagement = ({ onNavigate }: { onNavigate?: (page: string) => void }) => {
    const { admin, logout } = useAuth();
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const fetchVendors = async () => {
        if (!refreshing) setLoading(true);
        const response = await api.getVendors();
        if (response.success) {
            setVendors(response.data);
        }
        setLoading(false);
        setRefreshing(false);
    };

    useRefresh(
        React.useCallback(() => {
            fetchVendors();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchVendors();
    };

    const handleVerify = async (vendor: any) => {
        confirmAction(
            "Verify Vendor",
            `Are you sure you want to verify ${vendor.name || vendor.businessName}?`,
            async () => {
                const response = await api.verifyVendor(vendor._id);
                if (response.success) {
                    fetchVendors();
                } else {
                    showAlert("Error", "Failed to verify vendor");
                }
            },
            undefined,
            "Verify",
            "Cancel"
        );
    };

    const handleToggleBlock = async (vendor: any) => {
        confirmAction(
            vendor.isBlocked ? "Unblock Vendor" : "Block Vendor",
            `Are you sure you want to ${vendor.isBlocked ? "unblock" : "block"} this vendor?`,
            async () => {
                const response = await api.toggleVendorBlock(vendor._id);
                if (response.success) {
                    fetchVendors();
                } else {
                    showAlert("Error", "Failed to update vendor status");
                }
            },
            undefined,
            "Confirm",
            "Cancel",
            !vendor.isBlocked
        );
    };

    const filteredVendors = vendors.filter(vendor =>
        (vendor.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (vendor.businessName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (vendor.phone?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    const stats = [
        { label: 'Total Vendors', value: vendors.length.toString(), icon: 'briefcase', gradient: ['#f093fb', '#f5576c'] },
        { label: 'Verified', value: vendors.filter(v => v.isVerified).length.toString(), icon: 'checkmark-circle', gradient: ['#43e97b', '#38f9d7'] },
        { label: 'Pending', value: vendors.filter(v => !v.isVerified).length.toString(), icon: 'time', gradient: ['#fa709a', '#fee140'] },
    ];

    const renderVendorCard = ({ item }: { item: any }) => {
        const isVerified = item.isVerified;
        const isBlocked = item.isBlocked;
        const joinedDate = new Date(item.createdAt).toLocaleDateString();
        const avatarLetter = (item.name || item.businessName || 'V').charAt(0).toUpperCase();

        return (
            <TouchableOpacity style={styles.vendorCard} activeOpacity={0.7}>
                <View style={styles.vendorCardContent}>
                    <LinearGradient
                        colors={['#f093fb', '#f5576c']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.avatar}
                    >
                        <Text style={styles.avatarText}>{avatarLetter}</Text>
                    </LinearGradient>

                    <View style={styles.vendorInfo}>
                        <Text style={styles.vendorName}>{item.name || item.businessName || 'No Name'}</Text>
                        <View style={styles.vendorMeta}>
                            <Ionicons name="call" size={12} color="#64748b" />
                            <Text style={styles.vendorText}>{item.phone}</Text>
                        </View>
                        <View style={styles.vendorMeta}>
                            <Ionicons name="location" size={12} color="#64748b" />
                            <Text style={styles.vendorText}>{item.city || 'No Location'}</Text>
                        </View>
                        <View style={styles.vendorFooter}>
                            <View style={[
                                styles.statusBadge,
                                { backgroundColor: isVerified ? '#d1fae5' : '#fef3c7' }
                            ]}>
                                <View style={[
                                    styles.statusDot,
                                    { backgroundColor: isVerified ? '#10b981' : '#f59e0b' }
                                ]} />
                                <Text style={[
                                    styles.statusText,
                                    { color: isVerified ? '#10b981' : '#f59e0b' }
                                ]}>
                                    {isVerified ? 'Verified' : 'Pending'}
                                </Text>
                            </View>
                            {isBlocked && (
                                <View style={[styles.statusBadge, { backgroundColor: '#fee2e2', marginLeft: 8 }]}>
                                    <Text style={[styles.statusText, { color: '#ef4444' }]}>Blocked</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                <View style={styles.actionButtons}>
                    {!isVerified && (
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#d1fae5' }]}
                            onPress={() => handleVerify(item)}
                        >
                            <Ionicons name="checkmark" size={18} color="#10b981" />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: isBlocked ? '#d1fae5' : '#fef2f2' }]}
                        onPress={() => handleToggleBlock(item)}
                    >
                        <Ionicons
                            name={isBlocked ? "checkmark-circle" : "ban"}
                            size={18}
                            color={isBlocked ? "#10b981" : "#ef4444"}
                        />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ScreenWrapper
            title="Vendor Management"
            onLogout={logout}
            adminName={admin?.name || 'Admin'}
            currentPage="vendors"
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
                        placeholder="Search vendors..."
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
            </View>

            {/* Vendors List */}
            <View style={styles.listHeader}>
                <Text style={styles.listTitle}>
                    All Vendors ({filteredVendors.length})
                </Text>
            </View>

            <FlatList
                data={filteredVendors}
                keyExtractor={item => item._id}
                renderItem={renderVendorCard}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="briefcase-outline" size={64} color="#cbd5e1" />
                        <Text style={styles.emptyText}>No vendors found</Text>
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
    vendorCard: {
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
    vendorCardContent: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    vendorInfo: {
        flex: 1,
    },
    vendorName: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 6,
    },
    vendorMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    vendorText: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
    },
    vendorFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'flex-end',
    },
    actionBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
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
