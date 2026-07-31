import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import { AppButton } from '../../components/ui/AppButton';
import { useCart } from '../../context/CartContext';

export const MultiServiceBookingScreen = ({ route, navigation }: any) => {
    const { colors } = useTheme();
    const { addToCart } = useCart();
    const { services, addons, categoryId } = route.params || { services: [], addons: [], categoryId: undefined };

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
                addons: index === 0 ? selectedAddonItems : [], // Attach addons to first service
                vendorId: undefined,
                categoryId: categoryId
            });
        });

        navigation.navigate('CartScreen');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Review Selection</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Selected Services</Text>
                {services.map((service: any) => (
                    <View key={service._id || service.id} style={[styles.serviceCard, { backgroundColor: colors.surface }]}>
                        <Image source={{ uri: service.image || 'https://via.placeholder.com/60' }} style={styles.serviceImage} />
                        <View style={styles.serviceInfo}>
                            <Text style={[styles.serviceName, { color: colors.text }]}>{service.name}</Text>
                            <Text style={[styles.servicePrice, { color: colors.primary }]}>₹{service.basePrice || service.price}</Text>
                            {service.duration > 0 && (
                                <Text style={[styles.serviceDuration, { color: colors.textSecondary }]}>{service.duration} min</Text>
                            )}
                        </View>
                    </View>
                ))}

                {addons.length > 0 && (
                    <>
                        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: spacing.l }]}>Add-ons</Text>
                        {addons.map((addon: any) => {
                            const isSelected = selectedAddons.has(addon._id || addon.id);
                            return (
                                <TouchableOpacity
                                    key={addon._id || addon.id}
                                    style={[
                                        styles.addonCard,
                                        {
                                            backgroundColor: colors.surface,
                                            borderColor: isSelected ? colors.primary : colors.border,
                                            borderWidth: isSelected ? 2 : 1
                                        }
                                    ]}
                                    onPress={() => toggleAddon(addon._id || addon.id)}
                                >
                                    <Image source={{ uri: addon.image || 'https://via.placeholder.com/60' }} style={styles.addonImage} />
                                    <View style={styles.addonInfo}>
                                        <Text style={[styles.addonName, { color: colors.text }]} numberOfLines={1}>{addon.name}</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                            <Text style={[styles.addonPrice, { color: colors.primary, marginRight: 12 }]}>+₹{addon.price}</Text>
                                            {addon.duration > 0 && (
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                                                    <Text style={[styles.addonDuration, { color: colors.textSecondary, marginLeft: 4 }]}>{addon.duration} min</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                    {isSelected && (
                                        <View style={styles.checkmark}>
                                            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </>
                )}
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                <View style={styles.totalRow}>
                    <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total</Text>
                    <Text style={[styles.totalAmount, { color: colors.primary }]}>₹{calculateTotal()}</Text>
                </View>
                <View style={styles.totalRow}>
                    <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total Time</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                        <Text style={[styles.totalAmount, { color: colors.text, marginLeft: 4 }]}>{calculateTotalTime()} min</Text>
                    </View>
                </View>
                <AppButton
                    title="Proceed to Cart"
                    onPress={handleProceed}
                    style={styles.proceedButton}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: spacing.m, borderBottomWidth: 1 },
    backButton: { marginRight: spacing.m },
    headerTitle: { ...typography.h2 },
    content: { padding: spacing.m },
    sectionTitle: { ...typography.h3, marginBottom: spacing.m },
    serviceCard: { flexDirection: 'row', padding: spacing.m, borderRadius: borderRadius.m, marginBottom: spacing.m, ...shadows.small },
    serviceImage: { width: 60, height: 60, borderRadius: borderRadius.s, marginRight: spacing.m },
    serviceInfo: { flex: 1, justifyContent: 'center' },
    serviceName: { ...typography.bodyBold, marginBottom: 4 },
    servicePrice: { ...typography.body, fontWeight: 'bold' },
    serviceDuration: { ...typography.caption, marginTop: 2 },
    addonCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.m, borderRadius: borderRadius.m, marginBottom: spacing.m, ...shadows.small },
    addonImage: { width: 60, height: 60, borderRadius: borderRadius.s, marginRight: spacing.m },
    addonInfo: { flex: 1 },
    addonName: { ...typography.caption, fontWeight: 'bold', marginBottom: 2 },
    addonPrice: { ...typography.caption, fontWeight: 'bold' },
    addonDuration: { ...typography.caption },
    checkmark: { marginLeft: spacing.s },
    footer: { padding: spacing.m, borderTopWidth: 1, ...shadows.medium },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.m, alignItems: 'center' },
    totalLabel: { ...typography.h3 },
    totalAmount: { ...typography.h2 },
    proceedButton: { width: '100%' }
});
