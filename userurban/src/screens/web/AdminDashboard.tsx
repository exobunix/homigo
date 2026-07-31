import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Card } from '../../components/ui/Card';
import { colors, spacing, typography } from '../../theme/tokens';

const METRICS = [
    { label: 'Total Bookings', value: '1,240', change: '+12%' },
    { label: 'Active Providers', value: '45', change: '+5%' },
    { label: 'Revenue', value: '$12,450', change: '+18%' },
];

const RECENT_BOOKINGS = [
    { id: '1', customer: 'John Doe', service: 'Home Cleaning', status: 'Pending', amount: '$50' },
    { id: '2', customer: 'Jane Smith', service: 'AC Repair', status: 'Completed', amount: '$80' },
    { id: '3', customer: 'Mike Ross', service: 'Plumbing', status: 'In Progress', amount: '$45' },
];

export const AdminDashboard = () => {
    return (
        <View style={styles.container}>
            {/* Metrics */}
            <View style={styles.metricsRow}>
                {METRICS.map((metric, index) => (
                    <Card key={index} style={styles.metricCard}>
                        <Text style={styles.metricLabel}>{metric.label}</Text>
                        <Text style={styles.metricValue}>{metric.value}</Text>
                        <Text style={styles.metricChange}>{metric.change} from last month</Text>
                    </Card>
                ))}
            </View>

            {/* Recent Bookings Table (Simplified as List for now) */}
            <Card style={styles.tableCard}>
                <Text style={styles.tableTitle}>Recent Bookings</Text>
                <View style={styles.tableHeader}>
                    <Text style={[styles.col, { flex: 2 }]}>Customer</Text>
                    <Text style={[styles.col, { flex: 2 }]}>Service</Text>
                    <Text style={[styles.col, { flex: 1 }]}>Status</Text>
                    <Text style={[styles.col, { flex: 1, textAlign: 'right' }]}>Amount</Text>
                </View>
                {RECENT_BOOKINGS.map((booking) => (
                    <View key={booking.id} style={styles.tableRow}>
                        <Text style={[styles.col, { flex: 2 }]}>{booking.customer}</Text>
                        <Text style={[styles.col, { flex: 2 }]}>{booking.service}</Text>
                        <Text style={[styles.col, { flex: 1, color: booking.status === 'Completed' ? colors.success : colors.warning }]}>{booking.status}</Text>
                        <Text style={[styles.col, { flex: 1, textAlign: 'right', fontWeight: 'bold' }]}>{booking.amount}</Text>
                    </View>
                ))}
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    metricsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.l,
        gap: spacing.m, // Web friendly
    },
    metricCard: {
        flex: 1,
        padding: spacing.l,
    },
    metricLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        marginBottom: spacing.s,
    },
    metricValue: {
        ...typography.h1,
        color: colors.primary,
        marginBottom: spacing.xs,
    },
    metricChange: {
        ...typography.caption,
        color: colors.success,
    },
    tableCard: {
        padding: spacing.l
    },
    tableTitle: {
        ...typography.h3,
        marginBottom: spacing.m
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingBottom: spacing.s,
        marginBottom: spacing.s
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: spacing.s,
        borderBottomWidth: 1,
        borderBottomColor: colors.surface
    },
    col: {
        ...typography.body
    }
});
