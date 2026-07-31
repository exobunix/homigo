import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Modal, TextInput } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../auth/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';
import { confirmAction, showAlert } from '../../utils/alert';

export const PayoutManagement = ({ onNavigate }: { onNavigate?: (page: string) => void }) => {
    const { admin, logout } = useAuth();
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, paid, rejected

    useEffect(() => {
        fetchPayouts();
    }, [filterStatus]);

    const fetchPayouts = async () => {
        setLoading(true);
        const status = filterStatus === 'all' ? undefined : filterStatus;
        const response = await api.getPayouts(status);
        if (response.success) {
            setPayouts(response.data);
        }
        setLoading(false);
        setRefreshing(false);
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchPayouts();
    };

    const handleUpdateStatus = async (payout: any, newStatus: string) => {
        confirmAction(
            "Update Status",
            `Are you sure you want to mark this payout as ${newStatus}?`,
            async () => {
                const response = await api.updatePayout(payout._id, { status: newStatus });
                if (response.success) {
                    fetchPayouts();
                    showAlert("Success", "Payout status updated");
                } else {
                    showAlert("Error", "Failed to update status");
                }
            }
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return '#10b981';
            case 'approved': return '#3b82f6';
            case 'pending': return '#f59e0b';
            case 'rejected': return '#ef4444';
            default: return '#64748b';
        }
    };

    const renderPayoutCard = ({ item }: { item: any }) => {
        const statusColor = getStatusColor(item.status);

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.vendorName}>{item.vendor?.businessName || 'Unknown Vendor'}</Text>
                        <Text style={styles.vendorEmail}>{item.vendor?.email}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>{item.status.toUpperCase()}</Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.amountContainer}>
                        <Text style={styles.amountLabel}>Amount</Text>
                        <Text style={styles.amountValue}>₹{item.amount}</Text>
                    </View>
                    <View style={styles.dateContainer}>
                        <Text style={styles.dateLabel}>Requested On</Text>
                        <Text style={styles.dateValue}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                </View>

                {item.status === 'pending' && (
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.approveBtn]}
                            onPress={() => handleUpdateStatus(item, 'approved')}
                        >
                            <Text style={styles.actionBtnText}>Approve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.rejectBtn]}
                            onPress={() => handleUpdateStatus(item, 'rejected')}
                        >
                            <Text style={styles.actionBtnText}>Reject</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {item.status === 'approved' && (
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.payBtn]}
                            onPress={() => handleUpdateStatus(item, 'paid')}
                        >
                            <Text style={styles.actionBtnText}>Mark as Paid</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <ScreenWrapper
            title="Payout Management"
            onLogout={logout}
            adminName={admin?.name || 'Admin'}
            currentPage="payouts"
            onNavigate={onNavigate}
        >
            <View style={styles.filterContainer}>
                {['all', 'pending', 'approved', 'paid', 'rejected'].map(status => (
                    <TouchableOpacity
                        key={status}
                        style={[
                            styles.filterBtn,
                            filterStatus === status && styles.filterBtnActive
                        ]}
                        onPress={() => setFilterStatus(status)}
                    >
                        <Text style={[
                            styles.filterBtnText,
                            filterStatus === status && styles.filterBtnTextActive
                        ]}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={payouts}
                keyExtractor={item => item._id}
                renderItem={renderPayoutCard}
                contentContainerStyle={styles.listContent}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="cash-outline" size={64} color="#cbd5e1" />
                        <Text style={styles.emptyText}>No payouts found</Text>
                    </View>
                }
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    filterContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 8,
        flexWrap: 'wrap',
    },
    filterBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    filterBtnActive: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    filterBtnText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    filterBtnTextActive: {
        color: '#fff',
    },
    listContent: {
        paddingBottom: 24,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    vendorName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    vendorEmail: {
        fontSize: 13,
        color: '#64748b',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    cardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    amountContainer: {
        alignItems: 'flex-start',
    },
    amountLabel: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 4,
    },
    amountValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    dateContainer: {
        alignItems: 'flex-end',
    },
    dateLabel: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 4,
    },
    dateValue: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '500',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'flex-end',
    },
    actionBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    approveBtn: {
        backgroundColor: '#10b981',
    },
    rejectBtn: {
        backgroundColor: '#ef4444',
    },
    payBtn: {
        backgroundColor: '#3b82f6',
    },
    actionBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyText: {
        fontSize: 16,
        color: '#94a3b8',
        marginTop: 12,
    },
});
