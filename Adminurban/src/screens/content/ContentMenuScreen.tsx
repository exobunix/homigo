import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export const ContentMenuScreen = ({ navigation }: any) => {
    const menuItems = [
        { title: 'Categories', icon: 'albums-outline', route: 'CategoryManagement', color: ['#3b82f6', '#2563eb'] },
        { title: 'Banners', icon: 'images-outline', route: 'BannerManagement', color: ['#8b5cf6', '#7c3aed'] },
        { title: 'Cities', icon: 'location-outline', route: 'CityManagement', color: ['#10b981', '#059669'] },
        { title: 'Add-ons', icon: 'cube-outline', route: 'AddonManagement', color: ['#f59e0b', '#d97706'] },
        { title: 'Time Slots', icon: 'time-outline', route: 'TimeSlotManagement', color: ['#6366f1', '#4f46e5'] },
        { title: 'Payouts', icon: 'cash-outline', route: 'PayoutManagement', color: ['#ec4899', '#db2777'] },
        { title: 'Notifications', icon: 'notifications-outline', route: 'NotificationManagement', color: ['#8b5cf6', '#7c3aed'] },
        { title: 'Testimonials', icon: 'chatbubbles-outline', route: 'TestimonialManagement', color: ['#ec4899', '#db2777'] },
        { title: 'Country Codes', icon: 'globe-outline', route: 'CountryCodeManagement', color: ['#64748b', '#475569'] },
        // Add more as they are implemented
    ];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.header}>Content Management</Text>
            <View style={styles.grid}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.card}
                        onPress={() => navigation.navigate(item.route)}
                    >
                        <LinearGradient
                            colors={item.color as any}
                            style={styles.iconContainer}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Ionicons name={item.icon as any} size={24} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Ionicons name="chevron-forward" size={20} color="#cbd5e1" style={styles.arrow} />
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    content: {
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 20,
    },
    grid: {
        gap: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    arrow: {
        opacity: 0.5,
    },
});
