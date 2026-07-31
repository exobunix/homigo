import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography, shadows, borderRadius } from '../../theme/tokens';
import { useCart } from '../../context/CartContext';
import { ServiceCard } from '../../components/ui/ServiceCard';

import { api } from '../../services/api';

export const CategoryScreen = ({ navigation, route }: any) => {
    const { colors, isDark } = useTheme();
    const { categoryId, categoryName } = route.params || {};

    const { addToCart } = useCart();
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [addons, setAddons] = useState<any[]>([]);
    const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
    const [categoryDetails, setCategoryDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isLeafCategory, setIsLeafCategory] = useState(false);
    const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
    const [mainCategoryId, setMainCategoryId] = useState<string>('');

    const toggleService = (serviceId: string) => {
        const newSelected = new Set(selectedServices);
        if (newSelected.has(serviceId)) {
            newSelected.delete(serviceId);
        } else {
            newSelected.add(serviceId);
        }
        setSelectedServices(newSelected);
    };

    useEffect(() => {
        loadData();
    }, [categoryId]);

    const loadData = async () => {
        try {
            setLoading(true);

            // 1. Try to fetch sub-categories first
            const catResponse = await api.getCategories(undefined, categoryId);

            // Always load addons (they are usually global to the main category)
            loadAddons();

            if (catResponse.success && catResponse.data && catResponse.data.length > 0) {
                // Has sub-categories -> Show them
                setSubCategories(catResponse.data);
                setIsLeafCategory(false);
            } else {
                // No sub-categories -> It's a leaf -> Show service details, addons, and vendors
                setIsLeafCategory(true);
                await loadCategoryDetails();
            }
        } catch (error) {
            console.error('Failed to load category data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadServices = async () => {
        try {
            // Fetch services for this category
            // We pass categoryName as the 'category' filter
            const response = await api.getServices(categoryName);

            if (response.success && response.data) {
                setServices(response.data);
            }
        } catch (error) {
            console.error('Failed to load services:', error);
        }
    };

    const loadVendors = async () => {
        try {
            // Fetch available vendors for this specific category
            const response = await api.getAvailableVendors({
                time: new Date().toISOString(),
                serviceId: categoryId, // Filter by current category/service
            });

            if (response.success) {
                const mappedVendors = response.data.map((v: any) => ({
                    id: v.id || v._id,
                    name: v.name,
                    image: v.image || v.profileImage || 'https://via.placeholder.com/150',
                    rating: v.avgRating || v.rating || 4.8,
                    reviewCount: v.ratingCount || v.totalJobs || 0,
                    address: v.location?.address || 'Serving your area',
                    nextAvailableAt: v.nextAvailableAt,
                    subCategories: (v.services || []).map((s: any) => s.name)
                }));
                setVendors(mappedVendors);
            }
        } catch (error) {
            console.error('Failed to load vendors:', error);
        }
    };

    const loadCategoryDetails = async () => {
        try {
            // Fetch category details to show in booking card
            const response = await api.getCategoryById(categoryId);
            if (response.success) {
                setCategoryDetails(response.data);
            } else {
                Alert.alert('Error', 'Category not found', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error) {
            console.error('Failed to load category details:', error);
        }
    };

    const loadAddons = async () => {
        try {
            // Get the main category ID by traversing up the hierarchy
            // First, get current category details to find its parent chain
            const currentCat = await api.getCategoryById(categoryId);
            let mainCategoryIdValue = categoryId;

            if (currentCat.success && currentCat.data) {
                // If this category has a parentCategory, traverse up to find the main category
                if (currentCat.data.parentCategory) {
                    // Extract parent ID (could be string or object with _id)
                    const parentId = typeof currentCat.data.parentCategory === 'string'
                        ? currentCat.data.parentCategory
                        : currentCat.data.parentCategory._id || currentCat.data.parentCategory.id;

                    // Fetch parent to check if it's the main category
                    const parentCat = await api.getCategoryById(parentId);
                    if (parentCat.success && parentCat.data) {
                        // If parent has no parent, it's the main category
                        if (!parentCat.data.parentCategory) {
                            mainCategoryIdValue = parentCat.data._id || parentCat.data.id;
                        } else {
                            // Parent has a parent, so grandparent is main category
                            // Extract grandparent ID
                            mainCategoryIdValue = typeof parentCat.data.parentCategory === 'string'
                                ? parentCat.data.parentCategory
                                : parentCat.data.parentCategory._id || parentCat.data.parentCategory.id;
                        }
                    }
                    setMainCategoryId(mainCategoryIdValue);
                }
            }

            // Fetch addons related to the main category only
            const response = await api.getAddons(mainCategoryIdValue);
            if (response.success) {
                setAddons(response.data);
            }
        } catch (error) {
            console.error('Failed to load addons:', error);
        }
    };

    const handleAddToCart = (item: any) => {
        let price = item.price;
        if (typeof item.price === 'string') {
            price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
        }

        addToCart({
            id: item.id,
            vendorId: item.vendorId,
            title: item.title || item.name,
            price: price,
            image: item.image ? { uri: item.image } : require('../../../assets/icon.png'),
            quantity: 1,
            categoryId: mainCategoryId
        });
    };

    const toggleAddon = (addonId: string) => {
        const newSelected = new Set(selectedAddons);
        if (newSelected.has(addonId)) {
            newSelected.delete(addonId);
        } else {
            newSelected.add(addonId);
        }
        setSelectedAddons(newSelected);
    };

    const handleBookService = () => {
        // If we have selected child services, book them
        if (selectedServices.size > 0) {
            const selectedItems: any[] = [];
            subCategories.forEach(item => {
                const itemId = item._id || item.id;
                if (selectedServices.has(itemId)) {
                    selectedItems.push(item);
                }
            });

            navigation.navigate('MultiServiceBookingScreen', {
                services: selectedItems,
                addons: addons, // Pass available addons
                categoryId: mainCategoryId
            });
            return;
        }

        if (!categoryDetails) return;

        // Calculate total price
        let totalPrice = categoryDetails.basePrice || 0;
        const selectedAddonItems: any[] = [];

        addons.forEach(addon => {
            if (selectedAddons.has(addon._id || addon.id)) {
                totalPrice += addon.price;
                selectedAddonItems.push(addon);
            }
        });

        addToCart({
            id: categoryDetails._id || categoryDetails.id,
            title: categoryDetails.name,
            price: totalPrice,
            image: categoryDetails.image ? { uri: categoryDetails.image } : require('../../../assets/icon.png'),
            quantity: 1,
            addons: selectedAddonItems,
            // Vendor will be selected in Cart
            vendorId: undefined,
            categoryId: mainCategoryId
        });

        navigation.navigate('CartScreen');
    };

    const getAvailabilityText = (dateStr: string) => {
        if (!dateStr) return 'Available Now';
        const date = new Date(dateStr);
        const now = new Date();
        const diff = (date.getTime() - now.getTime()) / 60000; // minutes

        if (diff <= 5) return 'Available Now';

        return `Available from ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    const handleSubCategoryPress = (item: any) => {
        // Push the same screen with new category params to create a drill-down effect
        navigation.push('CategoryScreen', {
            categoryId: item._id || item.id,
            categoryName: item.name
        });
    };

    const renderSubCategory = ({ item }: { item: any }) => {
        const itemId = item._id || item.id;
        const isSelected = selectedServices.has(itemId);
        // Prioritize image URL over icon name
        const imageUrl = item.image || 'https://via.placeholder.com/60';

        return (
            <TouchableOpacity
                style={[
                    styles.subCategoryCard,
                    {
                        backgroundColor: isSelected ? colors.primary + '10' : (isDark ? colors.surface : colors.white),
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderWidth: isSelected ? 2 : 1
                    }
                ]}
                onPress={() => {
                    if (item.level === 'child') {
                        toggleService(itemId);
                    } else {
                        handleSubCategoryPress(item);
                    }
                }}
            >
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.subCategoryIcon}
                />
                <View style={styles.subCategoryInfo}>
                    <Text style={[styles.subCategoryName, { color: colors.text }]}>{item.name}</Text>
                    {item.description && (
                        <Text style={[styles.subCategoryDesc, { color: colors.textSecondary }]} numberOfLines={1}>
                            {item.description}
                        </Text>
                    )}
                    <View style={{ flexDirection: 'row', marginTop: 4, alignItems: 'center' }}>
                        {item.level === 'child' && (
                            <>
                                {(item.basePrice !== undefined || item.price !== undefined) && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                                        <Ionicons name="cash-outline" size={14} color={colors.primary} />
                                        <Text style={{ fontSize: 12, color: colors.primary, marginLeft: 4, fontWeight: '600' }}>
                                            ₹{item.basePrice || item.price}
                                        </Text>
                                    </View>
                                )}
                                {item.duration > 0 && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                                        <Text style={{ fontSize: 12, color: colors.textSecondary, marginLeft: 4 }}>
                                            {item.duration} min
                                        </Text>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                </View>
                {item.level === 'child' ? (
                    <View style={{ padding: 8 }}>
                        <Ionicons
                            name={isSelected ? "checkbox" : "square-outline"}
                            size={24}
                            color={isSelected ? colors.primary : colors.textSecondary}
                        />
                    </View>
                ) : (
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                )}
            </TouchableOpacity>
        );
    };

    const renderService = ({ item }: { item: any }) => (
        <View style={{ marginBottom: spacing.m, paddingHorizontal: spacing.m }}>
            <ServiceCard
                title={item.title || item.name}
                image={item.image ? { uri: item.image } : require('../../../assets/icon.png')}
                rating={item.rating || 4.8}
                price={typeof item.price === 'number' ? `$${item.price}` : item.price}
                onPress={() => navigation.navigate('ServiceDetailsScreen', { service: item, categoryId: mainCategoryId })}
                onBook={() => handleAddToCart(item)}
            />
        </View>
    );

    const renderVendor = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.vendorCard, { backgroundColor: isDark ? colors.surface : colors.white, borderColor: colors.border }]}
            onPress={() => navigation.navigate('VendorProfileScreen', { vendor: item, categoryName })}
        >
            <Image source={{ uri: item.image }} style={styles.vendorImage} />
            <View style={styles.vendorInfo}>
                <Text style={[styles.vendorName, { color: colors.text }]}>{item.name}</Text>
                <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={[styles.ratingText, { color: colors.textSecondary }]}>{item.rating} ({item.reviewCount})</Text>
                </View>
                <Text style={[styles.vendorAddress, { color: colors.textSecondary }]}>{item.address}</Text>
                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: 'bold', marginTop: 4 }}>
                    {getAvailabilityText(item.nextAvailableAt)}
                </Text>
                <View style={styles.tagsContainer}>
                    {(item.subCategories || []).slice(0, 3).map((sub: string, index: number) => (
                        <View key={index} style={[styles.tag, { backgroundColor: isDark ? colors.surfaceHighlight : colors.background }]}>
                            <Text style={[styles.tagText, { color: colors.textSecondary }]}>{sub}</Text>
                        </View>
                    ))}
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.navTitle, { color: colors.text }]}>{categoryName}</Text>
                </View>
            </View>

            <View style={styles.content}>
                {loading ? (
                    <View style={styles.emptyContainer}>
                        <Text style={{ color: colors.textSecondary }}>Loading...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={isLeafCategory ? [] : subCategories}
                        renderItem={renderSubCategory}
                        keyExtractor={(item) => item.id || item._id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListHeaderComponent={
                            isLeafCategory ? (
                                <View>
                                    {/* Service Booking Card */}
                                    {categoryDetails && (
                                        <View style={[styles.serviceCard, { backgroundColor: isDark ? colors.surface : colors.white, borderColor: colors.border }]}>
                                            <View style={styles.serviceCardContent}>
                                                {categoryDetails.image && (
                                                    <Image
                                                        source={{ uri: categoryDetails.image }}
                                                        style={styles.serviceCardImage}
                                                    />
                                                )}
                                                <View style={styles.serviceCardDetails}>
                                                    <Text style={[styles.serviceCardTitle, { color: colors.text }]}>{categoryDetails.name}</Text>
                                                    {categoryDetails.description && (
                                                        <Text style={[styles.serviceCardDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                                                            {categoryDetails.description}
                                                        </Text>
                                                    )}
                                                    <View style={styles.serviceCardMeta}>
                                                        {categoryDetails.basePrice !== undefined && categoryDetails.basePrice !== null && (
                                                            <View style={styles.metaItem}>
                                                                <Ionicons name="cash-outline" size={16} color={colors.primary} />
                                                                <Text style={[styles.metaText, { color: colors.primary }]}>
                                                                    ₹{categoryDetails.basePrice}
                                                                </Text>
                                                            </View>
                                                        )}
                                                        {categoryDetails.duration > 0 && (
                                                            <View style={styles.metaItem}>
                                                                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                                                                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                                                                    {categoryDetails.duration} min
                                                                </Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    )}

                                    {/* Addons Section */}
                                    {addons.length > 0 && (
                                        <View style={styles.addonsSection}>
                                            <Text style={[styles.addonsSectionTitle, { color: colors.text }]}>
                                                Enhance Your Service
                                            </Text>
                                            {addons.map((addon) => {
                                                const isSelected = selectedAddons.has(addon._id || addon.id);
                                                return (
                                                    <TouchableOpacity
                                                        key={addon._id || addon.id}
                                                        style={[
                                                            styles.addonCard,
                                                            {
                                                                backgroundColor: isSelected ? colors.primary + '10' : (isDark ? colors.surface : colors.white),
                                                                borderColor: isSelected ? colors.primary : colors.border,
                                                                ...shadows.small
                                                            }
                                                        ]}
                                                        onPress={() => toggleAddon(addon._id || addon.id)}
                                                    >
                                                        {addon.image && (
                                                            <Image
                                                                source={{ uri: addon.image }}
                                                                style={styles.addonImage}
                                                            />
                                                        )}
                                                        <View style={styles.addonInfo}>
                                                            <Text style={[styles.addonName, { color: colors.text }]}>
                                                                {addon.name}
                                                            </Text>
                                                            {addon.description && (
                                                                <Text
                                                                    style={[styles.addonDescription, { color: colors.textSecondary }]}
                                                                    numberOfLines={2}
                                                                >
                                                                    {addon.description}
                                                                </Text>
                                                            )}
                                                            <View style={styles.addonMeta}>
                                                                <View style={styles.metaItem}>
                                                                    <Ionicons name="cash-outline" size={14} color={colors.primary} />
                                                                    <Text style={[styles.addonMetaText, { color: colors.primary, fontWeight: '700' }]}>
                                                                        +₹{addon.price}
                                                                    </Text>
                                                                </View>
                                                                {addon.duration > 0 && (
                                                                    <View style={styles.metaItem}>
                                                                        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                                                                        <Text style={[styles.addonMetaText, { color: colors.textSecondary }]}>
                                                                            {addon.duration} min
                                                                        </Text>
                                                                    </View>
                                                                )}
                                                            </View>
                                                        </View>
                                                        <View
                                                            style={[
                                                                styles.addonAddButton,
                                                                { backgroundColor: isSelected ? colors.error : colors.primary }
                                                            ]}
                                                        >
                                                            <Ionicons
                                                                name={isSelected ? "remove" : "add"}
                                                                size={20}
                                                                color={colors.white}
                                                            />
                                                        </View>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    )}
                                </View>
                            ) : null
                        }
                        ListFooterComponent={
                            isLeafCategory && categoryDetails ? (
                                <View style={styles.footerContainer}>
                                    <TouchableOpacity
                                        style={[styles.bookButton, { backgroundColor: colors.primary }]}
                                        onPress={handleBookService}
                                    >
                                        <Text style={styles.bookButtonText}>Book Service</Text>
                                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            ) : null
                        }
                        ListEmptyComponent={
                            !isLeafCategory ? (
                                <View style={styles.emptyContainer}>
                                    <Text style={{ color: colors.textSecondary }}>
                                        No sub-categories found.
                                    </Text>
                                </View>
                            ) : null
                        }
                    />
                )}
            </View>
            {/* Floating Book Button for Multi-Select */}
            {selectedServices.size > 0 && !isLeafCategory && (
                <View style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
                    <TouchableOpacity
                        style={[styles.bookButton, { backgroundColor: colors.primary }]}
                        onPress={handleBookService}
                    >
                        <Text style={styles.bookButtonText}>Proceed ({selectedServices.size})</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
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
        padding: spacing.m,
        borderBottomWidth: 1,
    },
    backButton: {
        marginRight: spacing.m,
    },
    navTitle: {
        ...typography.h2,
        fontSize: 18,
    },
    content: {
        flex: 1,
    },
    sectionTitle: {
        ...typography.h2,
        margin: spacing.m,
    },
    listContent: {
        padding: spacing.m,
    },
    vendorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.m,
        marginBottom: spacing.m,
        borderRadius: borderRadius.m,
        borderWidth: 1,
        ...shadows.small,
    },
    vendorImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: spacing.m,
    },
    vendorInfo: {
        flex: 1,
    },
    vendorName: {
        ...typography.bodyBold,
        fontSize: 16,
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    ratingText: {
        ...typography.caption,
        marginLeft: 4,
    },
    vendorAddress: {
        ...typography.caption,
    },
    emptyContainer: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 6,
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 6,
        marginBottom: 4,
    },
    tagText: {
        fontSize: 10,
        fontWeight: '500',
    },
    navSubtitle: {
        ...typography.caption,
        fontSize: 12,
    },
    subCategoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.m,
        marginBottom: spacing.m,
        borderRadius: borderRadius.m,
        borderWidth: 1,
        ...shadows.small,
    },
    subCategoryIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: spacing.m,
    },
    subCategoryInfo: {
        flex: 1,
    },
    subCategoryName: {
        ...typography.bodyBold,
        fontSize: 16,
        marginBottom: 4,
    },
    subCategoryDesc: {
        ...typography.caption,
        fontSize: 12,
    },
    serviceCard: {
        padding: spacing.m,
        marginBottom: spacing.m,
        borderRadius: borderRadius.m,
        borderWidth: 1,
        ...shadows.small,
    },
    serviceCardContent: {
        flexDirection: 'row',
    },
    serviceCardImage: {
        width: 80,
        height: 80,
        borderRadius: borderRadius.s,
        marginRight: spacing.m,
    },
    serviceCardDetails: {
        flex: 1,
    },
    serviceCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    serviceCardTitle: {
        ...typography.h3,
        fontSize: 18,
        marginBottom: spacing.xs,
    },
    serviceCardPrice: {
        ...typography.h3,
        fontSize: 20,
        fontWeight: '700',
    },
    serviceCardDescription: {
        ...typography.body,
        fontSize: 13,
        lineHeight: 18,
        marginBottom: spacing.xs,
    },
    serviceCardMeta: {
        flexDirection: 'row',
        gap: spacing.m,
        marginTop: spacing.xs,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        ...typography.bodyBold,
        fontSize: 14,
    },
    addonsSection: {
        marginBottom: spacing.m,
    },
    addonsSectionTitle: {
        ...typography.h3,
        fontSize: 16,
        marginBottom: spacing.s,
        paddingHorizontal: spacing.m,
    },
    addonCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.m,
        marginHorizontal: spacing.m,
        marginBottom: spacing.s,
        borderRadius: borderRadius.s,
        borderWidth: 1,
    },
    addonImage: {
        width: 60,
        height: 60,
        borderRadius: borderRadius.s,
        marginRight: spacing.m,
    },
    addonInfo: {
        flex: 1,
    },
    addonName: {
        ...typography.bodyBold,
        fontSize: 14,
        marginBottom: 2,
    },
    addonDescription: {
        ...typography.caption,
        fontSize: 12,
        marginBottom: 4,
    },
    addonMeta: {
        flexDirection: 'row',
        gap: spacing.s,
        marginTop: 4,
    },
    addonMetaText: {
        ...typography.body,
        fontSize: 12,
    },
    addonPrice: {
        ...typography.bodyBold,
        fontSize: 16,
    },
    addonAddButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: spacing.s,
    },
    footerContainer: {
        padding: spacing.m,
        paddingBottom: spacing.xl,
    },
    bookButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.m,
        borderRadius: borderRadius.m,
        gap: spacing.s,
        ...shadows.medium,
    },
    bookButtonText: {
        color: '#fff',
        ...typography.h3,
        fontSize: 18,
    },
});
