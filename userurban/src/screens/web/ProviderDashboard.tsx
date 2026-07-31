import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../components/ui/Card';
import { colors, spacing, typography } from '../../theme/tokens';

const JOBS = [
    { id: '1', time: '10:00 AM', customer: 'Alice Cooper', address: '123 Main St', status: 'Scheduled' },
    { id: '2', time: '02:00 PM', customer: 'Bob Marley', address: '456 High St', status: 'Scheduled' },
];

export const ProviderDashboard = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Today's Jobs</Text>
            <View style={styles.jobsGrid}>
                {JOBS.map((job) => (
                    <Card key={job.id} style={styles.jobCard}>
                        <View style={styles.jobHeader}>
                            <Text style={styles.jobTime}>{job.time}</Text>
                            <Text style={styles.jobStatus}>{job.status}</Text>
                        </View>
                        <Text style={styles.customerName}>{job.customer}</Text>
                        <Text style={styles.address}>{job.address}</Text>
                    </Card>
                ))}
            </View>

            <Text style={styles.sectionTitle}>Earnings Summary</Text>
            <Card style={styles.earningsCard}>
                <Text style={styles.earningsLabel}>Total Earnings (Today)</Text>
                <Text style={styles.earningsValue}>$120.00</Text>
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    sectionTitle: {
        ...typography.h3,
        marginBottom: spacing.m,
        marginTop: spacing.l,
    },
    jobsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.m,
    },
    jobCard: {
        width: 300,
        padding: spacing.m,
    },
    jobHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.s
    },
    jobTime: {
        fontWeight: 'bold',
        color: colors.primary
    },
    jobStatus: {
        color: colors.success,
        fontSize: 12
    },
    customerName: {
        ...typography.h3,
        marginBottom: spacing.xs
    },
    address: {
        ...typography.caption,
        color: colors.textSecondary
    },
    earningsCard: {
        padding: spacing.l,
        alignItems: 'center'
    },
    earningsLabel: {
        ...typography.body,
        color: colors.textSecondary
    },
    earningsValue: {
        ...typography.h1,
        color: colors.success,
        marginTop: spacing.s
    }
});
