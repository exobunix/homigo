import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Card, Text, Button, DataTable, Divider, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import WebLayout from '@/components/WebLayout';
import { theme } from '@/theme/theme';
import { useAppSelector, useAppDispatch } from '@/store';
import api from '@/services/api';
import { loadUserFromStorage } from '@/store/slices/authSlice';

export default function EarningsDashboard() {
    const { user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            // Refresh User Profile to get latest totalEarnings
            await dispatch(loadUserFromStorage());

            // Fetch Completed Bookings for Transactions
            const res = await api.get('/bookings/completed?limit=10');
            if (res.data.success) {
                const allBookings = (res.data.data as any).data || [];
                // Filter only successful earnings (work_completed)
                const earnings = allBookings.filter((t: any) => t.status === 'work_completed');
                setTransactions(earnings);
            }
        } catch (error) {
            console.error('Failed to load earnings data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <WebLayout
            title="Earnings"
            subtitle="Track your revenue and payouts."
            actions={
                <Button mode="outlined" icon="download" style={{ borderColor: '#e2e8f0' }} onPress={loadData}>
                    Refresh
                </Button>
            }
        >
            <ScrollView style={styles.container}>
                {/* Summary Cards */}
                <View style={styles.summaryGrid}>
                    <LinearGradient colors={['#10b981', '#059669']} style={styles.summaryCard}>
                        <View style={styles.summaryIcon}>
                            <MaterialCommunityIcons name="wallet" size={32} color="rgba(255,255,255,0.8)" />
                        </View>
                        <Text style={styles.summaryLabel}>Total Earnings</Text>
                        <Text style={styles.summaryValue}>₹{(user as any)?.totalEarnings || '0'}</Text>
                        <Text style={styles.summaryTrend}>+Updated now</Text>
                    </LinearGradient>

                    <Card style={styles.statCard}>
                        <Card.Content>
                            <Text style={styles.statLabel}>Wallet Balance</Text>
                            <Text style={styles.statValue}>₹{(user as any)?.walletBalance?.toFixed(2) || '0.00'}</Text>
                            <Text style={styles.statSub}>Available to payout</Text>
                        </Card.Content>
                    </Card>

                    <Card style={styles.statCard}>
                        <Card.Content>
                            <Text style={styles.statLabel}>Jobs Completed</Text>
                            <Text style={styles.statValue}>{(user as any)?.totalJobs || '0'}</Text>
                            <Text style={styles.statSub}>Lifetime</Text>
                        </Card.Content>
                    </Card>
                </View>

                {/* Main Content */}
                <View style={styles.contentGrid}>
                    {/* Transaction History */}
                    <Card style={styles.tableCard}>
                        <Card.Content>
                            <Text style={styles.sectionTitle}>Recent Transactions</Text>
                            {loading ? (
                                <ActivityIndicator style={{ padding: 20 }} />
                            ) : (
                                <DataTable>
                                    <DataTable.Header>
                                        <DataTable.Title>Service</DataTable.Title>
                                        <DataTable.Title style={{ flex: 2 }}>Details</DataTable.Title>
                                        <DataTable.Title>Date</DataTable.Title>
                                        <DataTable.Title numeric>Amount</DataTable.Title>
                                    </DataTable.Header>

                                    {transactions.map((t) => (
                                        <DataTable.Row key={t._id}>
                                            <DataTable.Cell>{t.serviceName}</DataTable.Cell>
                                            <DataTable.Cell style={{ flex: 2 }}>
                                                {t.status === 'work_completed' ? 'Completed Job' : t.status}
                                            </DataTable.Cell>
                                            <DataTable.Cell>{new Date(t.completedAt || t.updatedAt).toLocaleDateString()}</DataTable.Cell>
                                            <DataTable.Cell numeric>
                                                <Text style={{ fontWeight: 'bold', color: '#10b981' }}>
                                                    + ₹{t.totalAmount}
                                                </Text>
                                            </DataTable.Cell>
                                        </DataTable.Row>
                                    ))}
                                    {transactions.length === 0 && (
                                        <Text style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>No transactions found</Text>
                                    )}
                                </DataTable>
                            )}
                        </Card.Content>
                    </Card>

                    {/* Payout Info */}
                    <Card style={styles.infoCard}>
                        <Card.Content>
                            <Text style={styles.sectionTitle}>Payout Method</Text>
                            <View style={styles.bankInfo}>
                                <View style={styles.bankIcon}>
                                    <MaterialCommunityIcons name="bank" size={24} color="#6366f1" />
                                </View>
                                <View>
                                    <Text style={styles.bankName}>{(user as any)?.bankDetails?.bankName || 'Bank Account'}</Text>
                                    <Text style={styles.accountNumber}>**** {(user as any)?.bankDetails?.accountNumber?.slice(-4) || '****'}</Text>
                                </View>
                                <Button mode="text" style={{ marginLeft: 'auto' }}>Edit</Button>
                            </View>
                            <Divider style={{ marginVertical: 16 }} />
                            <Text style={styles.infoText}>
                                Payouts are processed every Friday for earnings from the previous week.
                            </Text>
                        </Card.Content>
                    </Card>
                </View>
            </ScrollView>
        </WebLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 32,
    },
    summaryGrid: {
        flexDirection: 'row',
        gap: 24,
        marginBottom: 32,
    },
    summaryCard: {
        flex: 1,
        padding: 24,
        borderRadius: 16,
        minWidth: 250,
    },
    summaryIcon: {
        marginBottom: 16,
    },
    summaryLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginBottom: 4,
    },
    summaryValue: {
        color: '#ffffff',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    summaryTrend: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
        fontWeight: '500',
    },
    statCard: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        justifyContent: 'center',
        minWidth: 250,
    },
    statLabel: {
        color: '#64748b',
        fontSize: 14,
        marginBottom: 8,
    },
    statValue: {
        color: '#1e293b',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statSub: {
        color: '#94a3b8',
        fontSize: 12,
    },
    contentGrid: {
        flexDirection: 'row',
        gap: 24,
        flexWrap: 'wrap',
    },
    tableCard: {
        flex: 2,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        minWidth: 500,
    },
    infoCard: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        minWidth: 300,
        // height: 'fit-content' as any, // 'fit-content' is not a valid DimensionValue in RN types, but works in web. Using 'auto' or removing it is safer.
        alignSelf: 'flex-start', // This often achieves the same "fit content" behavior in flex containers
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 16,
    },
    bankInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        padding: 12,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    bankIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e0e7ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bankName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    accountNumber: {
        fontSize: 14,
        color: '#64748b',
    },
    infoText: {
        fontSize: 13,
        color: '#64748b',
        lineHeight: 20,
    },
});
