import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { WebLayout } from './WebLayout';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import { useCart } from '../../context/CartContext';

export const WebCart = ({ onNavigate, params }: { onNavigate: (route: string, params?: any) => void, params?: any }) => {
    const { items, removeFromCart, cartTotal, scheduleAutoClear, cancelAutoClear } = useCart();
    const { width } = useWindowDimensions();
    const isMobile = width < 768;

    React.useEffect(() => {
        // Cancel any pending clear when user enters cart
        cancelAutoClear();

        // Schedule clear when user leaves cart
        // (If they go to checkout, checkout page will cancel this)
        return () => {
            // Only schedule if we have items
            if (items.length > 0) {
                scheduleAutoClear();
            }
        };
    }, [items.length]); // Re-run if items change (to capture fresh length on unmount)

    const calculateItemTotal = (item: any) => {
        const servicePrice = item.price || 0;
        const addonsTotal = item.addons ? item.addons.reduce((sum: number, addon: any) => sum + (addon.price || 0), 0) : 0;
        return (servicePrice + addonsTotal) * (item.quantity || 1);
    };

    const getImageSource = (item: any) => {
        if (item.image) {
            // If image is an object with uri property
            if (typeof item.image === 'object' && item.image.uri) {
                return item.image.uri;
            }
            // If image is a string URL
            if (typeof item.image === 'string') {
                return item.image;
            }
        }
        // Fallback placeholder
        return 'https://via.placeholder.com/80';
    };

    return (
        <WebLayout onNavigate={onNavigate}>
            <View style={styles.container}>
                <Text style={styles.pageTitle}>Your Cart</Text>

                <View style={[styles.content, isMobile && { flexDirection: 'column' }]}>
                    <View style={[styles.itemsList, isMobile && { width: '100%', flex: 0 }]}>
                        {items.length === 0 ? (
                            <Text style={styles.emptyText}>Your cart is empty.</Text>
                        ) : (
                            items.map((item: any, index: number) => {
                                const hasAddons = item.addons && item.addons.length > 0;
                                const imageSource = getImageSource(item);

                                return (
                                    <View key={item.id || index} style={styles.cartItem}>
                                        <img
                                            src={imageSource}
                                            alt={item.title || 'Service'}
                                            style={styles.itemImage as any}
                                        />
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.itemName}>{item.title || 'Service'}</Text>
                                            <Text style={styles.itemPrice}>₹{item.price} x {item.quantity || 1}</Text>

                                            {hasAddons && (
                                                <View style={styles.addonsContainer}>
                                                    <Text style={styles.addonsTitle}>Add-ons:</Text>
                                                    {item.addons.map((addon: any, addonIndex: number) => (
                                                        <Text key={addonIndex} style={styles.addonText}>
                                                            • {addon.name} (+₹{addon.price})
                                                        </Text>
                                                    ))}
                                                </View>
                                            )}
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => {
                                                console.log('Removing item:', item.id);
                                                removeFromCart(item.id);
                                            }}
                                            style={styles.removeButton}
                                        >
                                            <Text style={styles.removeText}>✕ Remove</Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            })
                        )}
                    </View>

                    <View style={[styles.summary, isMobile && { width: '100%', flex: 0 }]}>
                        <Text style={styles.summaryTitle}>Summary</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>₹{cartTotal.toFixed(2)}</Text>
                        </View>
                        {/* Tax Removed as per request */}
                        <View style={styles.divider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>₹{cartTotal.toFixed(2)}</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.checkoutButton, items.length === 0 && styles.disabledButton]}
                            disabled={items.length === 0}
                            onPress={() => onNavigate('checkout', { total: cartTotal })}
                        >
                            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </WebLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.xl,
        maxWidth: 1000,
        alignSelf: 'center',
        width: '100%',
    },
    pageTitle: {
        ...typography.h2,
        marginBottom: spacing.l,
    },
    content: {
        flexDirection: 'row',
        gap: spacing.xl,
    },
    itemsList: {
        flex: 2,
        backgroundColor: colors.white,
        borderRadius: borderRadius.m,
        padding: spacing.l,
        ...shadows.small,
    },
    emptyText: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.l,
    },
    cartItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        gap: spacing.m,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: borderRadius.s,
        objectFit: 'cover',
    },
    itemName: {
        ...typography.h3,
        marginBottom: 4,
    },
    itemPrice: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    addonsContainer: {
        marginTop: 4,
        paddingLeft: 8,
        borderLeftWidth: 2,
        borderLeftColor: colors.border,
    },
    addonsTitle: {
        ...typography.caption,
        fontWeight: 'bold',
        color: colors.textSecondary,
        marginBottom: 2,
    },
    addonText: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    removeButton: {
        padding: spacing.xs,
    },
    removeText: {
        color: colors.error,
        fontWeight: '600',
        fontSize: 14,
    },
    summary: {
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: borderRadius.m,
        padding: spacing.l,
        ...shadows.small,
        height: 'fit-content' as any,
    },
    summaryTitle: {
        ...typography.h3,
        marginBottom: spacing.m,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.s,
    },
    summaryLabel: {
        color: colors.textSecondary,
    },
    summaryValue: {
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: spacing.m,
    },
    totalLabel: {
        ...typography.h3,
    },
    totalValue: {
        ...typography.h2,
        color: colors.primary,
    },
    checkoutButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.m,
        borderRadius: borderRadius.m,
        alignItems: 'center',
        marginTop: spacing.l,
    },
    disabledButton: {
        backgroundColor: colors.textSecondary,
    },
    checkoutButtonText: {
        ...typography.bodyBold,
        color: colors.white,
    }
});
