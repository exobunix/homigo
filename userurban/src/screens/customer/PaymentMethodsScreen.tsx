import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { useNotifications } from '../../context/NotificationContext';
import { spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import { AppButton } from '../../components/ui/AppButton';
import { AppInput } from '../../components/ui/AppInput';

const INITIAL_CARDS = [
    { id: '1', type: 'Visa', number: '**** **** **** 4242', expiry: '12/24', icon: 'https://cdn-icons-png.flaticon.com/512/349/349221.png' },
    { id: '2', type: 'Mastercard', number: '**** **** **** 5555', expiry: '10/25', icon: 'https://cdn-icons-png.flaticon.com/512/349/349228.png' },
];

export const PaymentMethodsScreen = ({ navigation, route }: any) => {
    const { colors, isDark } = useTheme();
    const { clearCart } = useCart();
    const { addNotification } = useNotifications();
    const [cards, setCards] = useState(INITIAL_CARDS);
    const [selectedCardId, setSelectedCardId] = useState(INITIAL_CARDS[0].id);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [newCard, setNewCard] = useState({ number: '', expiry: '', cvv: '', name: '' });

    const amount = route.params?.amount || 0;

    const handleAddCard = () => {
        if (!newCard.number || !newCard.expiry || !newCard.cvv || !newCard.name) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        if (newCard.number.length < 16) {
            Alert.alert('Error', 'Invalid card number');
            return;
        }

        const cardType = newCard.number.startsWith('4') ? 'Visa' : 'Mastercard';
        const icon = cardType === 'Visa'
            ? 'https://cdn-icons-png.flaticon.com/512/349/349221.png'
            : 'https://cdn-icons-png.flaticon.com/512/349/349228.png';

        const newCardObj = {
            id: Date.now().toString(),
            type: cardType,
            number: `**** **** **** ${newCard.number.slice(-4)}`,
            expiry: newCard.expiry,
            icon: icon
        };

        setCards([...cards, newCardObj]);
        setIsModalVisible(false);
        setNewCard({ number: '', expiry: '', cvv: '', name: '' });
        Alert.alert('Success', 'Card added successfully');
    };

    const handlePay = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            clearCart();
            addNotification(
                'Booking Confirmed!',
                `Your payment of $${amount.toFixed(2)} was successful. A professional has been assigned.`,
                'success'
            );
            Alert.alert(
                'Payment Successful',
                'Your booking has been confirmed!',
                [
                    {
                        text: 'View Bookings',
                        onPress: () => navigation.navigate('MainTabs', { screen: 'Bookings' })
                    }
                ]
            );
        }, 2000);
    };

    const renderCard = ({ item }: any) => (
        <TouchableOpacity
            style={[
                styles.cardItem,
                {
                    backgroundColor: colors.surface,
                    borderColor: selectedCardId === item.id ? colors.primary : colors.border,
                    borderWidth: selectedCardId === item.id ? 2 : 1
                }
            ]}
            onPress={() => setSelectedCardId(item.id)}
        >
            <View style={styles.cardIconContainer}>
                <Image source={{ uri: item.icon }} style={styles.cardIcon} resizeMode="contain" />
            </View>
            <View style={styles.cardDetails}>
                <Text style={[styles.cardNumber, { color: colors.text }]}>{item.number}</Text>
                <Text style={[styles.cardExpiry, { color: colors.textSecondary }]}>Expires {item.expiry}</Text>
            </View>
            {selectedCardId === item.id && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Payment Methods</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Payment Method</Text>
                <FlatList
                    data={cards}
                    renderItem={renderCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                />

                <AppButton
                    title="Add New Card"
                    variant="outline"
                    icon={<Ionicons name="add" size={20} color={colors.text} />}
                    onPress={() => setIsModalVisible(true)}
                    style={[styles.addButton, { borderColor: colors.border }]}
                    textStyle={{ color: colors.text }}
                />
            </View>

            {amount > 0 && (
                <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                    <View style={styles.totalRow}>
                        <Text style={[styles.totalLabel, { color: colors.text }]}>Total Amount</Text>
                        <Text style={[styles.totalAmount, { color: colors.primary }]}>${amount.toFixed(2)}</Text>
                    </View>
                    <AppButton
                        title={isProcessing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
                        onPress={handlePay}
                        disabled={isProcessing}
                        style={styles.payButton}
                    />
                </View>
            )}

            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? colors.surface : colors.white }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Card</Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <AppInput
                                label="Card Number"
                                placeholder="1234 5678 1234 5678"
                                value={newCard.number}
                                onChangeText={(text) => setNewCard({ ...newCard, number: text })}
                                keyboardType="numeric"
                                maxLength={16}
                            />
                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: spacing.m }}>
                                    <AppInput
                                        label="Expiry Date"
                                        placeholder="MM/YY"
                                        value={newCard.expiry}
                                        onChangeText={(text) => setNewCard({ ...newCard, expiry: text })}
                                        maxLength={5}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <AppInput
                                        label="CVV"
                                        placeholder="123"
                                        value={newCard.cvv}
                                        onChangeText={(text) => setNewCard({ ...newCard, cvv: text })}
                                        keyboardType="numeric"
                                        maxLength={3}
                                        secureTextEntry
                                    />
                                </View>
                            </View>
                            <AppInput
                                label="Cardholder Name"
                                placeholder="John Doe"
                                value={newCard.name}
                                onChangeText={(text) => setNewCard({ ...newCard, name: text })}
                            />

                            <AppButton
                                title="Add Card"
                                onPress={handleAddCard}
                                style={styles.modalButton}
                            />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
        flex: 1,
    },
    sectionTitle: {
        ...typography.h3,
        marginBottom: spacing.m,
    },
    listContent: {
        marginBottom: spacing.l,
    },
    cardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.m,
        borderRadius: borderRadius.m,
        marginBottom: spacing.m,
        borderWidth: 1,
        ...shadows.small,
    },
    cardIconContainer: {
        width: 50,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
        marginRight: spacing.m,
    },
    cardIcon: {
        width: 40,
        height: 24,
    },
    cardDetails: {
        flex: 1,
    },
    cardNumber: {
        ...typography.bodyBold,
    },
    cardExpiry: {
        ...typography.caption,
    },
    moreButton: {
        padding: spacing.s,
    },
    addButton: {
        marginTop: spacing.m,
        borderStyle: 'dashed',
        borderWidth: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        padding: spacing.l,
        height: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.l,
    },
    modalTitle: {
        ...typography.h2,
    },
    modalBody: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
    },
    modalButton: {
        marginTop: spacing.l,
    },
    footer: {
        padding: spacing.m,
        borderTopWidth: 1,
        ...shadows.medium,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.m,
    },
    totalLabel: {
        ...typography.h2,
    },
    totalAmount: {
        ...typography.h2,
    },
    payButton: {
        width: '100%',
    }
});
