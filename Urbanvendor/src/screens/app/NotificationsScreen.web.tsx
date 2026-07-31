import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import WebLayout from '@/components/WebLayout';
import { useAppSelector } from '@/store';

export default function NotificationsScreen() {
    const { notifications } = useAppSelector((state) => state.notification);

    // Mock notifications if empty
    const displayNotifications = notifications.length > 0 ? notifications : [
        { id: '1', title: 'New Booking Request', body: 'You have received a new booking request from Rahul Verma.', time: '2 mins ago', type: 'booking' },
        { id: '2', title: 'Payment Received', body: '₹1,250 has been credited to your wallet.', time: '1 hour ago', type: 'payment' },
        { id: '3', title: 'System Update', body: 'UrbanVendor app has been updated with new features.', time: 'Yesterday', type: 'system' },
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'booking': return 'calendar-check';
            case 'payment': return 'cash-multiple';
            default: return 'bell-ring';
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'booking': return '#3b82f6';
            case 'payment': return '#10b981';
            default: return '#f59e0b';
        }
    };

    return (
        <WebLayout
            title="Notifications"
            subtitle="Stay updated with your latest activities."
            actions={<IconButton icon="check-all" onPress={() => { }} />}
        >
            <ScrollView style={styles.container}>
                <View style={styles.list}>
                    {displayNotifications.map((item: any) => (
                        <Card key={item.id} style={styles.card}>
                            <Card.Content style={styles.content}>
                                <View style={[styles.iconBox, { backgroundColor: getColor(item.type) + '20' }]}>
                                    <MaterialCommunityIcons name={getIcon(item.type)} size={24} color={getColor(item.type)} />
                                </View>
                                <View style={styles.textBlock}>
                                    <View style={styles.headerRow}>
                                        <Text style={styles.title}>{item.title}</Text>
                                        <Text style={styles.time}>{item.time}</Text>
                                    </View>
                                    <Text style={styles.body}>{item.body}</Text>
                                </View>
                            </Card.Content>
                        </Card>
                    ))}
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
    list: {
        maxWidth: 800,
        gap: 16,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        elevation: 1,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textBlock: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    time: {
        fontSize: 12,
        color: '#94a3b8',
    },
    body: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
    },
});
