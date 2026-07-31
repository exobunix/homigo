import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { spacing, typography, borderRadius, shadows } from '../../theme/tokens';

export const NotificationsScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const { notifications, markAsRead, clearAll } = useNotifications();
    const [activeTab, setActiveTab] = useState<'All' | 'Settings'>('All');

    const [settings, setSettings] = useState({
        push: true,
        email: true,
        sms: false,
        promo: true,
        updates: true,
    });

    const toggleSwitch = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const renderSettingItem = (label: string, description: string, key: keyof typeof settings) => (
        <View style={[styles.item, { borderBottomColor: colors.border }]}>
            <View style={styles.itemInfo}>
                <Text style={[styles.itemLabel, { color: colors.text }]}>{label}</Text>
                <Text style={[styles.itemDescription, { color: colors.textSecondary }]}>{description}</Text>
            </View>
            <Switch
                value={settings[key]}
                onValueChange={() => toggleSwitch(key)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
            />
        </View>
    );

    const renderNotification = ({ item }: any) => (
        <TouchableOpacity
            style={[
                styles.notificationItem,
                { backgroundColor: item.read ? colors.background : colors.surfaceHighlight }
            ]}
            onPress={() => markAsRead(item.id)}
        >
            <View style={[styles.iconContainer, { backgroundColor: item.type === 'success' ? colors.success + '20' : colors.primary + '20' }]}>
                <Ionicons
                    name={item.type === 'success' ? 'checkmark-circle' : 'information-circle'}
                    size={24}
                    color={item.type === 'success' ? colors.success : colors.primary}
                />
            </View>
            <View style={styles.notificationContent}>
                <Text style={[styles.notificationTitle, { color: colors.text, fontWeight: item.read ? 'normal' : 'bold' }]}>
                    {item.title}
                </Text>
                <Text style={[styles.notificationMessage, { color: colors.textSecondary }]} numberOfLines={2}>
                    {item.message}
                </Text>
                <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                    {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
            {!item.read && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
                {activeTab === 'All' && notifications.length > 0 && (
                    <TouchableOpacity onPress={clearAll}>
                        <Text style={[styles.clearText, { color: colors.primary }]}>Clear All</Text>
                    </TouchableOpacity>
                )}
                {activeTab !== 'All' && <View style={{ width: 24 }} />}
            </View>

            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'All' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
                    onPress={() => setActiveTab('All')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'All' ? colors.primary : colors.textSecondary }]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Settings' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
                    onPress={() => setActiveTab('Settings')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'Settings' ? colors.primary : colors.textSecondary }]}>Settings</Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'All' ? (
                <FlatList
                    data={notifications}
                    renderItem={renderNotification}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="notifications-off-outline" size={64} color={colors.textSecondary} />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No notifications yet</Text>
                        </View>
                    }
                />
            ) : (
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={[styles.sectionHeader, { color: colors.text }]}>Alerts</Text>
                    {renderSettingItem('Push Notifications', 'Receive updates on your booking status', 'push')}
                    {renderSettingItem('Email Notifications', 'Receive booking receipts and newsletters', 'email')}
                    {renderSettingItem('SMS Notifications', 'Get text messages for important updates', 'sms')}

                    <View style={styles.divider} />

                    <Text style={[styles.sectionHeader, { color: colors.text }]}>Marketing</Text>
                    {renderSettingItem('Promotional Offers', 'Get notified about sales and discounts', 'promo')}
                    {renderSettingItem('App Updates', 'Get notified about new features', 'updates')}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.m,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: spacing.xs,
    },
    headerTitle: {
        ...typography.h2,
    },
    clearText: {
        ...typography.bodyBold,
    },
    tabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: spacing.m,
    },
    tabText: {
        ...typography.bodyBold,
    },
    content: {
        padding: spacing.m,
    },
    listContent: {
        padding: 0,
    },
    sectionHeader: {
        ...typography.h3,
        marginTop: spacing.m,
        marginBottom: spacing.s,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.m,
        borderBottomWidth: 1,
    },
    itemInfo: {
        flex: 1,
        paddingRight: spacing.m,
    },
    itemLabel: {
        ...typography.bodyBold,
        marginBottom: 4,
    },
    itemDescription: {
        ...typography.caption,
    },
    divider: {
        height: spacing.l,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.m,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        ...typography.body,
        marginBottom: 4,
    },
    notificationMessage: {
        ...typography.caption,
        marginBottom: 4,
    },
    timeText: {
        fontSize: 10,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: spacing.s,
        marginTop: spacing.s,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
        marginTop: spacing.xl * 2,
    },
    emptyText: {
        ...typography.h3,
        marginTop: spacing.m,
    },
});
