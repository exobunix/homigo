import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function PendingApprovalScreen() {
    return (
        <LinearGradient
            colors={['#6366f1', '#8b5cf6']}
            style={styles.container}
        >
            <View style={styles.content}>
                {/* Icon */}
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="clock-outline" size={80} color="#fff" />
                </View>

                {/* Title */}
                <Text style={styles.title}>Pending Admin Approval</Text>

                {/* Message */}
                <Text style={styles.message}>
                    Your vendor account is currently under review by our admin team.
                </Text>

                <Text style={styles.submessage}>
                    You'll be notified once your account is approved and you can start accepting bookings.
                </Text>

                {/* Info Cards */}
                <View style={styles.infoCard}>
                    <MaterialCommunityIcons name="check-circle-outline" size={24} color="#6366f1" />
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoTitle}>What's Next?</Text>
                        <Text style={styles.infoText}>
                            Our team will review your profile, KYC documents, and service details within 24-48 hours.
                        </Text>
                    </View>
                </View>

                <View style={styles.infoCard}>
                    <MaterialCommunityIcons name="bell-outline" size={24} color="#6366f1" />
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoTitle}>Stay Tuned</Text>
                        <Text style={styles.infoText}>
                            You'll receive a notification once your account is approved.
                        </Text>
                    </View>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    Thank you for your patience! 🙏
                </Text>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 24,
        maxWidth: 500,
    },
    iconContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
        textAlign: 'center',
    },
    message: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 26,
    },
    submessage: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    infoTextContainer: {
        flex: 1,
        marginLeft: 16,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 6,
    },
    infoText: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
    },
    footer: {
        fontSize: 16,
        color: '#fff',
        marginTop: 24,
        textAlign: 'center',
    },
});
