import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { WebLayout } from './WebLayout';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import { useCart } from '../../context/CartContext';

export const WebMultiServiceBooking = ({ onNavigate, params }: { onNavigate: (route: string, params?: any) => void, params?: any }) => {
    const { addToCart } = useCart();
    const { services = [], addons = [] } = params || {};

    const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());

    const toggleAddon = (addonId: string) => {
        const newSelected = new Set(selectedAddons);
        if (newSelected.has(addonId)) {
            newSelected.delete(addonId);
        } else {
            newSelected.add(addonId);
        }
        setSelectedAddons(newSelected);
    };

    const calculateTotal = () => {
        let total = services.reduce((sum: number, s: any) => sum + (s.basePrice || s.price || 0), 0);
        addons.forEach((addon: any) => {
            if (selectedAddons.has(addon._id || addon.id)) {
                total += addon.price;
            }
        });
        return total;
    };

    const calculateTotalTime = () => {
        let totalTime = services.reduce((sum: number, s: any) => sum + (s.duration || 0), 0);
        addons.forEach((addon: any) => {
            if (selectedAddons.has(addon._id || addon.id)) {
                totalTime += addon.duration || 0;
            }
        });
        return totalTime;
    };

    const handleProceed = () => {
        const selectedAddonItems = addons.filter((a: any) => selectedAddons.has(a._id || a.id));

        services.forEach((service: any, index: number) => {
            addToCart({
                id: service._id || service.id,
                title: service.name,
                price: service.basePrice || service.price || 0,
                image: service.image ? { uri: service.image } : require('../../../assets/icon.png'),
                quantity: 1,
                addons: index === 0 ? selectedAddonItems : [],
                vendorId: undefined
            });
        });

        onNavigate('cart');
    };

    return (
        <WebLayout onNavigate={onNavigate}>
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.pageTitle}>Review Selection</Text>

                    <Text style={styles.sectionTitle}>Selected Services</Text>
                    {services.map((service: any) => (
                        <View key={service._id || service.id} style={styles.serviceCard}>
                            <img
                                src={service.image || 'https://via.placeholder.com/60'}
                                alt={service.name}
                                style={{ width: 60, height: 60, borderRadius: 8, marginRight: 16, objectFit: 'cover' } as any}
                            />
                            <View style={styles.serviceInfo}>
                                <Text style={styles.serviceName}>{service.name}</Text>
                                <Text style={styles.servicePrice}>₹{service.basePrice || service.price}</Text>
                                {service.duration > 0 && (
                                    <Text style={styles.serviceDuration}>{service.duration} min</Text>
                                )}
                            </View>
                        </View>
                    ))}

                    {addons.length > 0 && (
                        <>
                            <Text style={[styles.sectionTitle, { marginTop: spacing.l }]}>Add-ons</Text>
                            {addons.map((addon: any) => {
                                const isSelected = selectedAddons.has(addon._id || addon.id);
                                return (
                                    <TouchableOpacity
                                        key={addon._id || addon.id}
                                        style={[
                                            styles.addonCard,
                                            isSelected && { borderColor: colors.primary, borderWidth: 2 }
                                        ]}
                                        onPress={() => toggleAddon(addon._id || addon.id)}
                                    >
                                        <img
                                            src={addon.image || 'https://via.placeholder.com/60'}
                                            alt={addon.name}
                                            style={{ width: 60, height: 60, borderRadius: 8, marginRight: 16, objectFit: 'cover' } as any}
                                        />
                                        <View style={styles.addonInfo}>
                                            <Text style={styles.addonName}>{addon.name}</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                                <Text style={[styles.addonPrice, { marginRight: 12 }]}>+₹{addon.price}</Text>
                                                {addon.duration > 0 && (
                                                    <Text style={styles.addonDuration}>{addon.duration} min</Text>
                                                )}
                                            </View>
                                        </View>
                                        {isSelected && (
                                            <View style={{ marginLeft: 'auto' }}>
                                                <Text style={{ fontSize: 24, color: colors.primary }}>✓</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </>
                    )}

                    {/* Total and Proceed Button - After Addons */}
                    <View style={styles.summarySection}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalAmount}>₹{calculateTotal()}</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total Time</Text>
                            <Text style={styles.totalAmount}>{calculateTotalTime()} min</Text>
                        </View>
                        <TouchableOpacity style={styles.proceedButton} onPress={handleProceed}>
                            <Text style={styles.proceedButtonText}>Proceed to Cart</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </WebLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
        paddingTop: spacing.xl,
    },
    content: {
        padding: spacing.xl,
        paddingBottom: spacing.xl,
    },
    pageTitle: {
        ...typography.h1,
        marginBottom: spacing.l,
    },
    sectionTitle: {
        ...typography.h2,
        marginBottom: spacing.m,
    },
    serviceCard: {
        flexDirection: 'row',
        padding: spacing.m,
        backgroundColor: colors.white,
        borderRadius: borderRadius.m,
        marginBottom: spacing.m,
        ...shadows.small,
        borderWidth: 1,
        borderColor: colors.border,
    },
    serviceInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    serviceName: {
        ...typography.h3,
        marginBottom: 4,
    },
    servicePrice: {
        ...typography.body,
        color: colors.primary,
        fontWeight: 'bold',
    },
    serviceDuration: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 2,
    },
    addonCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.m,
        backgroundColor: colors.white,
        borderRadius: borderRadius.m,
        marginBottom: spacing.m,
        ...shadows.small,
        borderWidth: 1,
        borderColor: colors.border,
    },
    addonInfo: {
        flex: 1,
    },
    addonName: {
        ...typography.body,
        fontWeight: 'bold',
    },
    addonPrice: {
        ...typography.body,
        color: colors.primary,
        fontWeight: 'bold',
    },
    addonDuration: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    summarySection: {
        marginTop: spacing.xl,
        padding: spacing.l,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.m,
        ...shadows.small,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.m,
        alignItems: 'center',
    },
    totalLabel: {
        ...typography.h3,
    },
    totalAmount: {
        ...typography.h2,
        color: colors.primary,
    },
    proceedButton: {
        backgroundColor: colors.primary,
        padding: spacing.m,
        borderRadius: borderRadius.m,
        alignItems: 'center',
    },
    proceedButtonText: {
        ...typography.bodyBold,
        color: colors.white,
        fontSize: 16,
    },
});
