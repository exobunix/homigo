import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useCart, CartItem } from '../../context/CartContext';
import { spacing, typography, shadows, borderRadius } from '../../theme/tokens';
import { ServiceCard } from '../../components/ui/ServiceCard';

import { api } from '../../services/api';

// ... imports

export const VendorProfileScreen = ({ navigation, route }: any) => {
    const { colors, isDark } = useTheme();
    const { items, addToCart, updateQuantity, cartTotal, cartCount } = useCart();
    const { vendor: initialVendor } = route.params || {};

    const [vendor, setVendor] = useState<any>(initialVendor);
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'services' | 'about' | 'reviews'>('services');

    useEffect(() => {
        loadVendorDetails();
    }, [initialVendor?.id]);

    const loadVendorDetails = async () => {
        if (!initialVendor?.id) return;

        try {
            setLoading(true);
            const response = await api.getVendorById(initialVendor.id);
            if (response.success) {
                setVendor(response.data);
                // Map services
                const mappedServices = response.data.services.map((s: any) => ({
                    id: s.id,
                    title: s.title || s.name,
                    price: s.price,
                    image: s.image || 'https://via.placeholder.com/150',
                    rating: s.rating || 4.8,
                    description: s.description
                }));
                setServices(mappedServices);
            }
        } catch (error) {
            console.error('Failed to load vendor details:', error);
        } finally {
            setLoading(false);
        }
    };

    const getItemQuantity = (id: string) => {
        const item = items.find((i: CartItem) => i.id === id);
        return item ? item.quantity : 0;
    };

    const handleIncrement = (item: any) => {
        const qty = getItemQuantity(item.id);
        if (qty === 0) {
            addToCart({
                id: item.id,
                vendorId: vendor?.id || initialVendor?.id,
                title: item.title,
                price: item.price,
                image: { uri: item.image },
                quantity: 1
            });
        } else {
            updateQuantity(item.id, qty + 1);
        }
    };

    const handleDecrement = (item: any) => {
        const qty = getItemQuantity(item.id);
        if (qty > 0) {
            updateQuantity(item.id, qty - 1);
        }
    };

    const renderTabs = () => (
        <View style={[styles.tabContainer, { borderBottomColor: colors.border }]}>
            {['Services', 'About', 'Reviews'].map((tab) => {
                const isActive = activeTab === tab.toLowerCase();
                return (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tabItem, isActive && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
                        onPress={() => setActiveTab(tab.toLowerCase() as any)}
                    >
                        <Text style={[styles.tabText, { color: isActive ? colors.primary : colors.textSecondary }]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    const renderAbout = () => (
        <View style={styles.sectionContent}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About {vendor?.name}</Text>
            <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
                We are a team of certified professionals dedicated to providing high-quality services. With over 5 years of experience in the industry, we ensure customer satisfaction and safety. All our professionals are background verified and trained.
            </Text>

            <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={20} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.text }]}>Mon - Sun: 9:00 AM - 8:00 PM</Text>
            </View>
            <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={20} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.text }]}>{vendor?.address || '123 Main Street, City'}</Text>
            </View>
            <View style={styles.infoRow}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.text }]}>Verified & Insured Professionals</Text>
            </View>
        </View>
    );

    const renderReviews = () => (
        <View style={styles.sectionContent}>
            <View style={styles.ratingSummary}>
                <Text style={[styles.bigRating, { color: colors.text }]}>{vendor?.rating || 4.8}</Text>
                <View>
                    <View style={{ flexDirection: 'row' }}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <Ionicons key={i} name="star" size={16} color="#FFD700" />
                        ))}
                    </View>
                    <Text style={{ color: colors.textSecondary }}>{vendor?.reviewCount || 100} Reviews</Text>
                </View>
            </View>

            {[1, 2, 3].map((i) => (
                <View key={i} style={[styles.reviewItem, { borderBottomColor: colors.border }]}>
                    <View style={styles.reviewHeader}>
                        <View style={[styles.reviewerAvatar, { backgroundColor: colors.surfaceHighlight }]}>
                            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>U{i}</Text>
                        </View>
                        <View>
                            <Text style={[styles.reviewerName, { color: colors.text }]}>User {i}</Text>
                            <View style={{ flexDirection: 'row' }}>
                                <Ionicons name="star" size={12} color="#FFD700" />
                                <Ionicons name="star" size={12} color="#FFD700" />
                                <Ionicons name="star" size={12} color="#FFD700" />
                                <Ionicons name="star" size={12} color="#FFD700" />
                                <Ionicons name="star" size={12} color="#FFD700" />
                            </View>
                        </View>
                        <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>2 days ago</Text>
                    </View>
                    <Text style={[styles.reviewText, { color: colors.textSecondary }]}>
                        Great service! The professional was on time and did a fantastic job. Highly recommended.
                    </Text>
                </View>
            ))}
        </View>
    );

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.vendorInfo}>
                <Image source={{ uri: vendor?.image }} style={styles.vendorImage} />
                <View style={styles.vendorDetails}>
                    <Text style={[styles.vendorName, { color: colors.text }]}>{vendor?.name}</Text>
                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={16} color="#FFD700" />
                        <Text style={[styles.ratingText, { color: colors.textSecondary }]}>{vendor?.rating} ({vendor?.reviewCount} reviews)</Text>
                    </View>
                    <Text style={[styles.vendorAddress, { color: colors.textSecondary }]}>{vendor?.address}</Text>
                </View>
            </View>

            {renderTabs()}

            {activeTab === 'services' && (
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                    Select a service to proceed
                </Text>
            )}
        </View>
    );

    const renderItem = ({ item }: { item: any }) => (
        <ServiceCard
            title={item.title}
            image={item.image}
            rating={item.rating}
            price={`$${item.price}`}
            variant="backgroundImage"
            onPress={() => navigation.navigate('ServiceDetailsScreen', { service: item })}
            onBook={() => handleIncrement(item)}
            onIncrement={() => handleIncrement(item)}
            onDecrement={() => handleDecrement(item)}
            quantity={getItemQuantity(item.id)}
            style={styles.card}
        />
    );

    // Determine data based on active tab
    // If 'services', use services array. If others, use empty array (content in ListFooter or Header)
    // Better: Use ListHeaderComponent for everything except the service list itself.
    // If activeTab !== 'services', the list is empty, and we render content in ListEmptyComponent or Footer.
    // Let's use ListFooterComponent for About/Reviews to allow scrolling if content is long.

    const listData = activeTab === 'services' ? services : [];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.navTitle, { color: colors.text }]}>{vendor?.name}</Text>
            </View>

            <FlatList
                data={listData}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={
                    activeTab === 'about' ? renderAbout() :
                        activeTab === 'reviews' ? renderReviews() : null
                }
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    activeTab === 'services' ? (
                        <View style={styles.emptyContainer}>
                            <Text style={{ color: colors.textSecondary }}>No services found in this category.</Text>
                        </View>
                    ) : null
                }
            />

            {cartCount > 0 && (
                <View style={[styles.cartFooter, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                    <View>
                        <Text style={[styles.cartFooterCount, { color: colors.text }]}>{cartCount} items | ${cartTotal}</Text>
                        <Text style={[styles.cartFooterText, { color: colors.textSecondary }]}>Extra charges may apply</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.viewCartButton, { backgroundColor: colors.primary }]}
                        onPress={() => navigation.navigate('CartScreen')}
                    >
                        <Text style={styles.viewCartText}>View Cart</Text>
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
    headerContainer: {
        marginBottom: spacing.m,
    },
    vendorInfo: {
        flexDirection: 'row',
        padding: spacing.m,
        alignItems: 'center',
    },
    vendorImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: spacing.m,
    },
    vendorDetails: {
        flex: 1,
    },
    vendorName: {
        ...typography.h2,
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
    headerSubtitle: {
        ...typography.body,
        marginBottom: spacing.m,
        paddingHorizontal: spacing.m,
    },
    subCatList: {
        marginHorizontal: -spacing.m,
    },
    subCatContent: {
        paddingHorizontal: spacing.m,
    },
    subCatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: spacing.s,
        borderWidth: 1,
    },
    subCatIcon: {
        width: 20,
        height: 20,
        marginRight: 8,
    },
    subCatText: {
        ...typography.bodyBold,
        fontSize: 14,
    },
    listContent: {
        padding: spacing.m,
        paddingBottom: 100, // Space for footer
    },
    card: {
        marginBottom: spacing.l,
    },
    emptyContainer: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    cartFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.m,
        borderTopWidth: 1,
        ...shadows.large,
    },
    cartFooterCount: {
        ...typography.bodyBold,
        fontSize: 16,
    },
    cartFooterText: {
        ...typography.caption,
    },
    viewCartButton: {
        paddingVertical: spacing.s,
        paddingHorizontal: spacing.l,
        borderRadius: borderRadius.m,
    },
    viewCartText: {
        ...typography.bodyBold,
        color: 'white',
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        marginBottom: spacing.m,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: spacing.m,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabText: {
        ...typography.bodyBold,
        fontSize: 14,
    },
    sectionContent: {
        paddingHorizontal: spacing.m,
    },
    sectionTitle: {
        ...typography.h2,
        marginBottom: spacing.m,
    },
    aboutText: {
        ...typography.body,
        lineHeight: 22,
        marginBottom: spacing.l,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.m,
    },
    infoText: {
        ...typography.body,
        marginLeft: spacing.m,
    },
    ratingSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.l,
        backgroundColor: '#F5F5F5',
        padding: spacing.m,
        borderRadius: borderRadius.m,
    },
    bigRating: {
        fontSize: 32,
        fontWeight: 'bold',
        marginRight: spacing.m,
    },
    reviewItem: {
        borderBottomWidth: 1,
        paddingBottom: spacing.m,
        marginBottom: spacing.m,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.s,
    },
    reviewerAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.s,
    },
    reviewerName: {
        ...typography.bodyBold,
        flex: 1,
    },
    reviewDate: {
        ...typography.caption,
    },
    reviewText: {
        ...typography.body,
        fontStyle: 'italic',
    }
});
