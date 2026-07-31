import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { WebLayout } from './WebLayout';
import { colors, spacing, typography, shadows, borderRadius } from '../../theme/tokens';
import { api } from '../../services/api';

export const WebCategory = ({ onNavigate, params }: { onNavigate: (route: string, params?: any) => void, params?: any }) => {
    const categoryId = params?.categoryId;
    const categoryName = params?.categoryName || 'Services';
    const searchQuery = params?.searchQuery;

    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [addons, setAddons] = useState<any[]>([]);
    const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [isLeafCategory, setIsLeafCategory] = useState(false);

    useEffect(() => {
        loadData();
    }, [categoryId, categoryName, searchQuery]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Always load addons for the category
            loadAddons();

            let effectiveCategoryId = categoryId;
            const nameToSearch = searchQuery || categoryName;

            // If no categoryId but we have name, look up the category by name
            if (!effectiveCategoryId && nameToSearch && nameToSearch !== 'Services') {
                try {
                    // Fetch ALL categories levels to match children like 'Hair Cut'
                    const [mainCats, subCats, childCats] = await Promise.all([
                        api.getCategories('main'),
                        api.getCategories('sub'),
                        api.getCategories('child')
                    ]);

                    const allCats = [
                        ...(mainCats.data || []),
                        ...(subCats.data || []),
                        ...(childCats.data || [])
                    ];

                    if (allCats.length > 0) {
                        const foundCat = allCats.find(
                            (cat: any) => cat.name.toLowerCase() === nameToSearch.toLowerCase() ||
                                cat.name.toLowerCase().includes(nameToSearch.toLowerCase()) ||
                                nameToSearch.toLowerCase().includes(cat.name.toLowerCase())
                        );
                        if (foundCat) {
                            effectiveCategoryId = foundCat._id || foundCat.id;
                        }
                    }
                } catch (e) {
                    console.error('Failed to find category by name:', e);
                }
            }

            if (effectiveCategoryId) {
                const catResponse = await api.getCategories(undefined, effectiveCategoryId);

                if (catResponse.success && catResponse.data && catResponse.data.length > 0) {
                    setSubCategories(catResponse.data);
                    setIsLeafCategory(false);
                } else {
                    setIsLeafCategory(true);
                    await loadVendors();
                }
            } else {
                setIsLeafCategory(true);
            }
        } catch (error) {
            console.error('Failed to load category data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadVendors = async () => {
        try {
            const response = await api.getAvailableVendors({
                time: new Date().toISOString(),
                serviceId: categoryId,
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

    const loadAddons = async () => {
        try {
            if (!categoryId) return;

            const currentCat = await api.getCategoryById(categoryId);
            let mainCategoryId = categoryId;

            if (currentCat.success && currentCat.data) {
                if (currentCat.data.parentCategory) {
                    const parentId = typeof currentCat.data.parentCategory === 'string'
                        ? currentCat.data.parentCategory
                        : currentCat.data.parentCategory._id || currentCat.data.parentCategory.id;

                    const parentCat = await api.getCategoryById(parentId);
                    if (parentCat.success && parentCat.data) {
                        if (!parentCat.data.parentCategory) {
                            mainCategoryId = parentCat.data._id || parentCat.data.id;
                        } else {
                            mainCategoryId = typeof parentCat.data.parentCategory === 'string'
                                ? parentCat.data.parentCategory
                                : parentCat.data.parentCategory._id || parentCat.data.parentCategory.id;
                        }
                    }
                }
            }

            const response = await api.getAddons(mainCategoryId);
            if (response.success) {
                setAddons(response.data);
            }
        } catch (error) {
            console.error('Failed to load addons:', error);
        }
    };

    const toggleServiceSelection = (serviceId: string) => {
        const newSelected = new Set(selectedServices);
        if (newSelected.has(serviceId)) {
            newSelected.delete(serviceId);
        } else {
            newSelected.add(serviceId);
        }
        setSelectedServices(newSelected);
    };

    const handleProceed = () => {
        if (selectedServices.size === 0) return;

        const selectedItems = subCategories.filter(cat => selectedServices.has(cat._id || cat.id));

        onNavigate('multi-service-booking', {
            services: selectedItems,
            addons: addons
        });
    };

    const handleSubCategoryClick = (subCat: any) => {
        if (subCat.level === 'child') {
            toggleServiceSelection(subCat._id || subCat.id);
        } else {
            onNavigate('category', {
                categoryId: subCat._id || subCat.id,
                categoryName: subCat.name
            });
        }
    };

    const getAvailabilityText = (dateStr: string) => {
        if (!dateStr) return 'Available Now';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = date.getTime() - now.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 0) return 'Available Now';
        if (diffMins < 60) return `Available in ${diffMins} mins`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `Available in ${diffHours} hours`;
        const diffDays = Math.floor(diffHours / 24);
        return `Available in ${diffDays} days`;
    };

    const hasChildCategories = subCategories.some(cat => cat.level === 'child');

    const [sortBy, setSortBy] = useState('recommended');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [appliedMinPrice, setAppliedMinPrice] = useState(0);
    const [appliedMaxPrice, setAppliedMaxPrice] = useState(Infinity);

    const getSortedVendors = () => {
        let sorted = [...vendors];
        switch (sortBy) {
            case 'price_low':
                sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;
            case 'price_high':
                sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            case 'rating':
                sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            default:
                break;
        }
        return sorted;
    };

    const getSortedCategories = () => {
        let sorted = [...subCategories];

        // Apply price filter
        sorted = sorted.filter(cat => {
            const price = cat.price || cat.basePrice || 0;
            return price >= appliedMinPrice && price <= appliedMaxPrice;
        });

        switch (sortBy) {
            case 'price_low':
                sorted.sort((a, b) => (a.price || a.basePrice || 0) - (b.price || b.basePrice || 0));
                break;
            case 'price_high':
                sorted.sort((a, b) => (b.price || b.basePrice || 0) - (a.price || a.basePrice || 0));
                break;
            case 'rating':
                sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            default:
                break;
        }
        return sorted;
    };

    const handleApplyFilters = () => {
        setAppliedMinPrice(minPrice ? parseInt(minPrice) : 0);
        setAppliedMaxPrice(maxPrice ? parseInt(maxPrice) : Infinity);
    };

    const handleClearFilters = () => {
        setMinPrice('');
        setMaxPrice('');
        setAppliedMinPrice(0);
        setAppliedMaxPrice(Infinity);
        setSortBy('recommended');
    };

    const sortedVendors = getSortedVendors();
    const sortedCategories = getSortedCategories();

    return (
        <WebLayout onNavigate={onNavigate}>
            <View style={styles.container}>
                {(isLeafCategory || hasChildCategories) && (
                    <View style={styles.sidebar}>
                        <Text style={styles.filterTitle}>Filters</Text>
                        <View style={styles.filterSection}>
                            <Text style={styles.filterLabel}>Sort By</Text>
                            <TouchableOpacity
                                style={styles.filterOption}
                                onPress={() => setSortBy('recommended')}
                            >
                                <Text style={[styles.filterText, sortBy === 'recommended' && styles.activeFilterText]}>Recommended</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.filterOption}
                                onPress={() => setSortBy('price_low')}
                            >
                                <Text style={[styles.filterText, sortBy === 'price_low' && styles.activeFilterText]}>Price: Low to High</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.filterOption}
                                onPress={() => setSortBy('price_high')}
                            >
                                <Text style={[styles.filterText, sortBy === 'price_high' && styles.activeFilterText]}>Price: High to Low</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.filterOption}
                                onPress={() => setSortBy('rating')}
                            >
                                <Text style={[styles.filterText, sortBy === 'rating' && styles.activeFilterText]}>Rating: High to Low</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.filterSection}>
                            <Text style={styles.filterLabel}>Price Range</Text>
                            <View style={styles.priceDisplayRow}>
                                <Text style={styles.priceDisplayText}>₹{minPrice || 0}</Text>
                                <Text style={styles.priceDisplayText}>₹{maxPrice || 5000}</Text>
                            </View>
                            <View style={styles.sliderContainer}>
                                <input
                                    type="range"
                                    min="0"
                                    max="5000"
                                    step="50"
                                    value={minPrice || 0}
                                    onChange={(e: any) => {
                                        const val = parseInt(e.target.value);
                                        if (val < (parseInt(maxPrice) || 5000)) {
                                            setMinPrice(e.target.value);
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        height: '6px',
                                        position: 'absolute',
                                        background: 'transparent',
                                        pointerEvents: 'auto',
                                        zIndex: 2,
                                        appearance: 'none',
                                        WebkitAppearance: 'none',
                                        cursor: 'pointer'
                                    } as any}
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="5000"
                                    step="50"
                                    value={maxPrice || 5000}
                                    onChange={(e: any) => {
                                        const val = parseInt(e.target.value);
                                        if (val > (parseInt(minPrice) || 0)) {
                                            setMaxPrice(e.target.value);
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        height: '6px',
                                        position: 'absolute',
                                        background: 'transparent',
                                        pointerEvents: 'auto',
                                        zIndex: 2,
                                        appearance: 'none',
                                        WebkitAppearance: 'none',
                                        cursor: 'pointer'
                                    } as any}
                                />
                                <View style={styles.sliderTrack} />
                                <View style={[
                                    styles.sliderRange,
                                    {
                                        left: `${((parseInt(minPrice) || 0) / 5000) * 100}%`,
                                        right: `${100 - ((parseInt(maxPrice) || 5000) / 5000) * 100}%`
                                    } as any
                                ]} />
                            </View>
                            <View style={styles.priceLabelsRow}>
                                <Text style={styles.priceLabelText}>₹0</Text>
                                <Text style={styles.priceLabelText}>₹2500</Text>
                                <Text style={styles.priceLabelText}>₹5000</Text>
                            </View>
                        </View>

                        <View style={styles.filterButtonsContainer}>
                            <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
                                <Text style={styles.applyButtonText}>Apply Filters</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.clearButton} onPress={handleClearFilters}>
                                <Text style={styles.clearButtonText}>Clear All</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.headerRow}>
                        <Text style={styles.pageTitle}>
                            {categoryName === 'Search Results' && searchQuery ? `Results for "${searchQuery}"` : categoryName}
                        </Text>

                        {hasChildCategories && selectedServices.size > 0 && (
                            <TouchableOpacity style={styles.proceedButton} onPress={handleProceed}>
                                <Text style={styles.proceedButtonText}>
                                    Proceed ({selectedServices.size} selected) →
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
                    ) : isLeafCategory ? (
                        <View style={styles.grid}>
                            {sortedVendors.length === 0 ? (
                                <Text style={{ color: colors.textSecondary }}>No professionals available.</Text>
                            ) : (
                                sortedVendors.map((vendor) => (
                                    <TouchableOpacity
                                        key={vendor.id}
                                        style={styles.vendorCard}
                                        onPress={() => onNavigate('vendor-profile', { vendor })}
                                    >
                                        <Image source={{ uri: vendor.image }} style={styles.vendorImage} />
                                        <View style={styles.vendorInfo}>
                                            <Text style={styles.vendorName}>{vendor.name}</Text>
                                            <View style={styles.ratingRow}>
                                                <Text style={styles.ratingText}>⭐ {vendor.rating} ({vendor.reviewCount})</Text>
                                            </View>
                                            <Text style={styles.vendorAddress} numberOfLines={1}>{vendor.address}</Text>
                                            <Text style={styles.availabilityText}>
                                                {getAvailabilityText(vendor.nextAvailableAt)}
                                            </Text>
                                            <View style={styles.tagsContainer}>
                                                {vendor.subCategories.slice(0, 3).map((tag: string, index: number) => (
                                                    <View key={index} style={styles.tag}>
                                                        <Text style={styles.tagText}>{tag}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>
                    ) : (
                        <View style={styles.subCategoriesGrid}>
                            {sortedCategories.map((subCat) => {
                                const isSelected = selectedServices.has(subCat._id || subCat.id);
                                const isChild = subCat.level === 'child';

                                return (
                                    <TouchableOpacity
                                        key={subCat._id || subCat.id}
                                        style={[
                                            styles.subCategoryCard,
                                            isChild && isSelected && { borderColor: colors.primary, borderWidth: 2 }
                                        ]}
                                        onPress={() => handleSubCategoryClick(subCat)}
                                    >
                                        <View style={styles.subCategoryImageContainer}>
                                            <img
                                                src={(subCat.name === 'Deep Cleaning' || subCat.title === 'Deep Cleaning') ? 'https://images.unsplash.com/photo-1581578731117-104f8a746950?w=800' : (subCat.image || 'https://via.placeholder.com/150')}
                                                alt={subCat.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' } as any}
                                            />
                                        </View>
                                        <View style={styles.subCategoryInfo}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Text style={styles.subCategoryName}>{subCat.name}</Text>
                                                {isChild && (
                                                    <View style={{ marginLeft: 8 }}>
                                                        <Text style={{ fontSize: 20 }}>
                                                            {isSelected ? '☑️' : '⬜'}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                            {subCat.description && (
                                                <Text style={styles.subCategoryDesc} numberOfLines={2}>
                                                    {subCat.description}
                                                </Text>
                                            )}
                                            <View style={{ flexDirection: 'row', marginTop: 8, alignItems: 'center' }}>
                                                {subCat.level === 'child' && (
                                                    <>
                                                        {(subCat.basePrice !== undefined || subCat.price !== undefined) && (
                                                            <Text style={{ fontSize: 14, color: colors.primary, fontWeight: 'bold', marginRight: 12 }}>
                                                                ₹{subCat.basePrice || subCat.price}
                                                            </Text>
                                                        )}
                                                        {subCat.duration > 0 && (
                                                            <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                                                                {subCat.duration} min
                                                            </Text>
                                                        )}
                                                    </>
                                                )}
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </ScrollView>
            </View>
        </WebLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
        paddingTop: spacing.xl,
    },
    sidebar: {
        width: 250,
        paddingRight: spacing.xl,
        borderRightWidth: 1,
        borderRightColor: colors.border,
    },
    filterTitle: {
        ...typography.h3,
        marginBottom: spacing.m,
    },
    filterSection: {
        marginBottom: spacing.l,
    },
    filterLabel: {
        ...typography.bodyBold,
        marginBottom: spacing.s,
        color: colors.textSecondary,
    },
    filterOption: {
        paddingVertical: spacing.xs,
    },
    filterText: {
        ...typography.body,
        color: colors.text,
    },
    activeFilterText: {
        fontWeight: 'bold',
        color: colors.primary,
    },
    content: {
        flex: 1,
        paddingLeft: spacing.xl,
        paddingBottom: spacing.xl,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.l,
    },
    pageTitle: {
        ...typography.h1,
        marginBottom: 0,
    },
    proceedButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.l,
        paddingVertical: spacing.m,
        borderRadius: borderRadius.m,
        ...shadows.small,
    },
    proceedButtonText: {
        ...typography.bodyBold,
        color: colors.white,
        fontSize: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.m,
    },
    subCategoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.m,
    },
    subCategoryCard: {
        width: '48%',
        backgroundColor: colors.white,
        borderRadius: borderRadius.m,
        overflow: 'hidden',
        ...shadows.small,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.m,
    },
    subCategoryImageContainer: {
        width: '100%',
        height: 150,
        backgroundColor: colors.surface,
    },
    subCategoryInfo: {
        padding: spacing.m,
    },
    subCategoryName: {
        ...typography.h3,
        fontSize: 18,
        marginBottom: spacing.xs,
    },
    subCategoryDesc: {
        ...typography.body,
        color: colors.textSecondary,
        fontSize: 14,
    },
    vendorCard: {
        width: '48%',
        backgroundColor: colors.white,
        borderRadius: borderRadius.m,
        padding: spacing.m,
        marginBottom: spacing.m,
        flexDirection: 'row',
        ...shadows.small,
        borderWidth: 1,
        borderColor: colors.border,
    },
    vendorImage: {
        width: 80,
        height: 80,
        borderRadius: borderRadius.s,
        marginRight: spacing.m,
    },
    vendorInfo: {
        flex: 1,
    },
    vendorName: {
        ...typography.h3,
        fontSize: 16,
        marginBottom: spacing.xs,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    ratingText: {
        ...typography.body,
        fontSize: 14,
        color: colors.textSecondary,
    },
    vendorAddress: {
        ...typography.body,
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    availabilityText: {
        ...typography.bodyBold,
        fontSize: 13,
        color: colors.primary,
        marginBottom: spacing.xs,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    tag: {
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.xs,
        paddingVertical: 2,
        borderRadius: borderRadius.s,
    },
    tagText: {
        ...typography.body,
        fontSize: 11,
        color: colors.textSecondary,
    },
    priceRangeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.s,
        marginTop: spacing.s,
    },
    priceInputWrapper: {
        flex: 1,
    },
    priceInputLabel: {
        ...typography.body,
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    priceSeparator: {
        ...typography.body,
        color: colors.textSecondary,
        marginTop: spacing.m,
    },
    filterButtonsContainer: {
        marginTop: spacing.l,
        gap: spacing.s,
    },
    applyButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.m,
        paddingHorizontal: spacing.l,
        borderRadius: borderRadius.m,
        alignItems: 'center',
    },
    applyButtonText: {
        ...typography.bodyBold,
        color: colors.white,
        fontSize: 14,
    },
    clearButton: {
        backgroundColor: 'transparent',
        paddingVertical: spacing.s,
        paddingHorizontal: spacing.l,
        borderRadius: borderRadius.m,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    clearButtonText: {
        ...typography.body,
        color: colors.textSecondary,
        fontSize: 14,
    },
    priceDisplayRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.s,
    },
    priceDisplayText: {
        ...typography.bodyBold,
        fontSize: 14,
        color: colors.primary,
    },
    sliderContainer: {
        height: 30,
        position: 'relative',
        justifyContent: 'center',
    },
    sliderTrack: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 6,
        backgroundColor: colors.border,
        borderRadius: 3,
    },
    sliderRange: {
        position: 'absolute',
        height: 6,
        backgroundColor: colors.primary,
        borderRadius: 3,
    },
    priceLabelsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.xs,
    },
    priceLabelText: {
        ...typography.body,
        fontSize: 11,
        color: colors.textSecondary,
    },
});
