import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography, shadows, borderRadius } from '../../theme/tokens';
import { AppButton } from '../../components/ui/AppButton';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';

export const PaymentScreen = ({ navigation, route }: any) => {
    const { colors } = useTheme();
    const { clearCart } = useCart();
    const { bookingData } = route.params;
    const [selectedMethod, setSelectedMethod] = useState('card');
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            console.log('Processing booking...', bookingData);
            const response = await api.createBooking({
                ...bookingData,
                paymentMethod: selectedMethod,
                paymentStatus: 'paid'
            });

            if (response.success) {
                Alert.alert('Success', 'Booking confirmed successfully!', [
                    {
                        text: 'OK',
                        onPress: () => {
                            clearCart();
                            navigation.navigate('MainTabs', { screen: 'Bookings' });
                        }
                    }
                ]);
            } else {
                Alert.alert('Error', 'Failed to create booking: ' + response.message);
            }
        } catch (error: any) {
            console.error('Payment error:', error);
            Alert.alert('Error', 'Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderPaymentMethod = (id: string, icon: string, title: string, subtitle?: string) => (
        <TouchableOpacity
            style={[
                styles.methodCard,
                {
                    backgroundColor: colors.surface,
                    borderColor: selectedMethod === id ? colors.primary : colors.border,
                    borderWidth: selectedMethod === id ? 2 : 1
                }
            ]}
            onPress={() => setSelectedMethod(id)}
        >
            <View style={styles.methodIconContainer}>
                <Ionicons name={icon as any} size={24} color={selectedMethod === id ? colors.primary : colors.textSecondary} />
            </View>
            <View style={styles.methodInfo}>
                <Text style={[styles.methodTitle, { color: colors.text }]}>{title}</Text>
                {subtitle && <Text style={[styles.methodSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
            </View>
            <View style={styles.radioButton}>
                {selectedMethod === id && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Payment</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.summaryTitle, { color: colors.textSecondary }]}>Total Amount</Text>
                    <Text style={[styles.summaryAmount, { color: colors.primary }]}>${bookingData.totalAmount.toFixed(2)}</Text>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Payment Method</Text>

                {renderPaymentMethod('card', 'card-outline', 'Credit/Debit Card', '**** **** **** 4242')}
                {renderPaymentMethod('upi', 'qr-code-outline', 'UPI', 'Google Pay, PhonePe, Paytm')}
                {renderPaymentMethod('cod', 'cash-outline', 'Cash on Delivery', 'Pay after service')}

            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                <AppButton
                    title={loading ? "Processing..." : `Pay $${bookingData.totalAmount.toFixed(2)}`}
                    onPress={handlePayment}
                    style={styles.payButton}
                    disabled={loading}
                />
            </View>
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
    content: {
        padding: spacing.m,
    },
    summaryCard: {
        padding: spacing.l,
        borderRadius: borderRadius.m,
        alignItems: 'center',
        marginBottom: spacing.xl,
        ...shadows.small,
    },
    summaryTitle: {
        ...typography.body,
        marginBottom: spacing.xs,
    },
    summaryAmount: {
        ...typography.h1,
        fontSize: 32,
    },
    sectionTitle: {
        ...typography.h3,
        marginBottom: spacing.m,
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.m,
        borderRadius: borderRadius.m,
        marginBottom: spacing.m,
    },
    methodIconContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        marginRight: spacing.m,
    },
    methodInfo: {
        flex: 1,
    },
    methodTitle: {
        ...typography.bodyBold,
    },
    methodSubtitle: {
        ...typography.caption,
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    footer: {
        padding: spacing.m,
        borderTopWidth: 1,
        ...shadows.medium,
    },
    payButton: {
        width: '100%',
    }
});
