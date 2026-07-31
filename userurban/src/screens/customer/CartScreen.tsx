import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart, CartItem } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography, shadows, borderRadius } from '../../theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../../components/ui/AppButton';

export const CartScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const { items, removeFromCart, updateQuantity, cartTotal, clearCart, scheduleAutoClear, cancelAutoClear } = useCart();

    React.useEffect(() => {
        const unsubscribeFocus = navigation.addListener('focus', () => {
            cancelAutoClear();
        });

        const unsubscribeBlur = navigation.addListener('blur', () => {
            if (items.length > 0) {
                scheduleAutoClear();
            }
        });

        return () => {
            unsubscribeFocus();
            unsubscribeBlur();
        };
    }, [navigation, items.length, scheduleAutoClear, cancelAutoClear]);

    const handleCheckout = () => {
        navigation.navigate('CheckoutScreen');
    };

    const renderItem = ({ item }: { item: CartItem }) => (
        <View style={[styles.cartItem, { backgroundColor: colors.surface }]}>
            <Image source={item.image} style={styles.itemImage} />
            <View style={styles.itemDetails}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.itemPrice, { color: colors.primary }]}>₹{item.price}</Text>

                {/* Display addons if present */}
                {item.addons && item.addons.length > 0 && (
                    <View style={{ marginTop: 4 }}>
                        <Text style={[styles.addonsLabel, { color: colors.textSecondary }]}>Add-ons:</Text>
                        {item.addons.map((addon: any, index: number) => (
                            <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                <Ionicons name="add-circle-outline" size={12} color={colors.textSecondary} />
                                <Text style={[styles.addonText, { color: colors.textSecondary, marginLeft: 4 }]}>
                                    {addon.name} (+₹{addon.price})
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                <View style={styles.quantityContainer}>
                    <TouchableOpacity
                        style={[styles.quantityButton, { borderColor: colors.border }]}
                        onPress={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                    >
                        <Ionicons name="remove" size={16} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.quantityText, { color: colors.text }]}>{item.quantity}</Text>
                    <TouchableOpacity
                        style={[styles.quantityButton, { borderColor: colors.border }]}
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                        <Ionicons name="add" size={16} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeButton}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
        </View>
    );

    if (items.length === 0) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>My Cart</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.emptyContainer}>
                    <Ionicons name="cart-outline" size={64} color={colors.textSecondary} />
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Your cart is empty</Text>
                    <AppButton
                        title="Start Shopping"
                        onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
                        style={styles.shopButton}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>My Cart</Text>
                <TouchableOpacity onPress={clearCart}>
                    <Text style={{ color: colors.error }}>Clear</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
            />

            <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                <View style={styles.totalRow}>
                    <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total</Text>
                    <Text style={[styles.totalAmount, { color: colors.primary }]}>₹{cartTotal.toFixed(2)}</Text>
                </View>
                <AppButton
                    title="Proceed to Checkout"
                    onPress={handleCheckout}
                    style={styles.checkoutButton}
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
    listContent: {
        padding: spacing.m,
    },
    cartItem: {
        flexDirection: 'row',
        borderRadius: borderRadius.m,
        padding: spacing.s,
        marginBottom: spacing.m,
        alignItems: 'center',
        ...shadows.small,
    },
    itemImage: {
        width: 70,
        height: 70,
        borderRadius: borderRadius.s,
        marginRight: spacing.m,
    },
    itemDetails: {
        flex: 1,
    },
    itemTitle: {
        ...typography.bodyBold,
        marginBottom: spacing.xs,
    },
    itemPrice: {
        ...typography.body,
        fontWeight: '600',
        marginBottom: spacing.s,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    quantityText: {
        marginHorizontal: spacing.m,
        ...typography.bodyBold,
    },
    removeButton: {
        padding: spacing.s,
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
    checkoutButton: {
        width: '100%',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    emptyText: {
        ...typography.h3,
        marginTop: spacing.m,
        marginBottom: spacing.l,
    },
    shopButton: {
        minWidth: 200,
    },
    addonsLabel: {
        ...typography.caption,
        fontWeight: '600',
        marginTop: 2,
    },
    addonText: {
        ...typography.caption,
        fontSize: 11,
    }
});
