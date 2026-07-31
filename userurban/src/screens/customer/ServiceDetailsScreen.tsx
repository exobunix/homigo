import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import { AppButton } from '../../components/ui/AppButton';
import { RatingStars } from '../../components/ui/RatingStars';
import { LinearGradient } from 'expo-linear-gradient';
import { useCart, CartItem } from '../../context/CartContext';
import { ServiceCard } from '../../components/ui/ServiceCard';

export const ServiceDetailsScreen = ({ route, navigation }: any) => {
    const { addToCart, items, updateQuantity } = useCart();
    const { colors, isDark } = useTheme();

    // Get service from params or fallback
    const { service: paramService, categoryId } = route.params || {};
    const service = paramService || {
        id: '1',
        // vendorId should come from the backend service object
        title: 'AC Service & Repair',
        rating: 4.8,
        price: 40, // Ensure number for fallback
        image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80',
        description: 'Expert AC service including filter cleaning, coil check, and gas top-up if required. Get your AC ready for summer with our premium service.'
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
                vendorId: service.vendorId, // Use service vendorId for add-ons too if applicable, or item.vendorId
                title: item.title,
                price: item.price,
                image: { uri: item.image },
                quantity: 1,
                categoryId: categoryId
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

    const handleBookNow = () => {
        // Handle price if it's a string like "$40"
        let price = service.price;
        if (typeof price === 'string') {
            price = parseFloat(price.replace('$', ''));
        }

        addToCart({
            id: service.id,
            vendorId: service.vendorId,
            title: service.title,
            price: price,
            image: { uri: service.image },
            quantity: 1,
            categoryId: categoryId
        });
        navigation.navigate('CartScreen');
    };

    // Dummy data for add-ons
    const ADD_ONS = [
        { id: 'add1', title: 'Gas Refill', price: 25, rating: 4.9, image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a782?w=500&q=80' },
        { id: 'add2', title: 'Filter Clean', price: 15, rating: 4.7, image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500&q=80' },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Hero Image */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: service.image }} style={styles.image} resizeMode="cover" />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.6)']}
                        style={styles.gradient}
                    />
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.shareButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                        <Ionicons name="share-outline" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={[styles.contentContainer, { backgroundColor: colors.background }]}>
                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            <Text style={[styles.title, { color: colors.text }]}>{service.title}</Text>
                            <Text style={[styles.price, { color: colors.primary }]}>
                                {typeof service.price === 'number' ? `$${service.price}` : service.price}
                            </Text>
                        </View>

                        <View style={styles.ratingRow}>
                            <View style={[styles.ratingBadge, { backgroundColor: colors.success + '20' }]}>
                                <Ionicons name="star" size={14} color={colors.success} />
                                <Text style={[styles.ratingText, { color: colors.success }]}>{service.rating}</Text>
                            </View>
                            <Text style={[styles.ratingCount, { color: colors.textSecondary }]}> (1.2k reviews)</Text>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>About this service</Text>
                        <Text style={[styles.description, { color: colors.textSecondary }]}>
                            {service.description || 'Professional service delivered by verified experts. We ensure high-quality standards and safety protocols.'}
                        </Text>
                    </View>

                    {/* Info Cards */}
                    <View style={styles.infoGrid}>
                        <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
                            <Ionicons name="time-outline" size={24} color={colors.primary} />
                            <Text style={[styles.infoTitle, { color: colors.text }]}>45 mins</Text>
                            <Text style={[styles.infoSub, { color: colors.textSecondary }]}>Duration</Text>
                        </View>
                        <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
                            <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
                            <Text style={[styles.infoTitle, { color: colors.text }]}>Warranty</Text>
                            <Text style={[styles.infoSub, { color: colors.textSecondary }]}>30 Days</Text>
                        </View>
                        <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
                            <Ionicons name="people-outline" size={24} color={colors.primary} />
                            <Text style={[styles.infoTitle, { color: colors.text }]}>Expert</Text>
                            <Text style={[styles.infoSub, { color: colors.textSecondary }]}>Verified</Text>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    {/* What's Included */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>What's Included</Text>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                            <Text style={[styles.featureText, { color: colors.text }]}>Professional Equipment</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                            <Text style={[styles.featureText, { color: colors.text }]}>Post-service cleanup</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                            <Text style={[styles.featureText, { color: colors.text }]}>7-day warranty on parts</Text>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    {/* Frequent Add-ons */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Added Together</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.addOnList}>
                            {ADD_ONS.map((addon, index) => (
                                <ServiceCard
                                    key={`${addon.id}-${index}`}
                                    title={addon.title}
                                    image={addon.image}
                                    rating={addon.rating}
                                    price={`$${addon.price}`}
                                    variant="backgroundImage"
                                    style={styles.addOnCard}
                                    onBook={() => handleIncrement(addon)}
                                    onIncrement={() => handleIncrement(addon)}
                                    onDecrement={() => handleDecrement(addon)}
                                    quantity={getItemQuantity(addon.id)}
                                />
                            ))}
                        </ScrollView>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    {/* Reviews Preview */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Reviews</Text>
                            <TouchableOpacity>
                                <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.reviewCard, { backgroundColor: colors.surface }]}>
                            <View style={styles.reviewHeader}>
                                <View style={styles.reviewerInfo}>
                                    <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                                        <Text style={[styles.avatarText, { color: colors.white }]}>JD</Text>
                                    </View>
                                    <Text style={[styles.reviewerName, { color: colors.text }]}>John Doe</Text>
                                </View>
                                <RatingStars rating={5} size={14} />
                            </View>
                            <Text style={[styles.reviewText, { color: colors.text }]}>Excellent service! The professional was on time and did a great job.</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <SafeAreaView edges={['bottom']} style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <View style={styles.priceContainer}>
                    <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total Price</Text>
                    <Text style={[styles.totalPrice, { color: colors.primary }]}>${service.price}</Text>
                </View>
                <AppButton
                    title="Book Now"
                    style={styles.bookButton}
                    onPress={handleBookNow}
                    textStyle={{ fontSize: 18, fontWeight: 'bold' }}
                />
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    imageContainer: {
        height: 350,
        width: '100%',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 40,
        left: spacing.m,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shareButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 40,
        right: spacing.m,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        padding: spacing.m,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -40,
        paddingTop: spacing.xl,
    },
    header: {
        marginBottom: spacing.m,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.s,
    },
    title: {
        ...typography.h1,
        fontSize: 28,
        flex: 1,
        marginRight: spacing.m,
    },
    price: {
        ...typography.h1,
        fontSize: 28,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.s,
        paddingVertical: 4,
        borderRadius: borderRadius.s,
    },
    ratingText: {
        ...typography.bodyBold,
        marginLeft: 4,
    },
    ratingCount: {
        ...typography.caption,
        marginLeft: spacing.s,
    },
    divider: {
        height: 1,
        marginVertical: spacing.l,
        opacity: 0.5,
    },
    section: {
        marginBottom: spacing.s,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.m,
    },
    sectionTitle: {
        ...typography.h2,
        marginBottom: spacing.s,
    },
    description: {
        ...typography.body,
        lineHeight: 24,
        fontSize: 16,
    },
    infoGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.m,
    },
    infoCard: {
        flex: 1,
        alignItems: 'center',
        padding: spacing.m,
        borderRadius: borderRadius.m,
        marginHorizontal: 4,
        ...shadows.small,
    },
    infoTitle: {
        ...typography.bodyBold,
        marginTop: spacing.s,
    },
    infoSub: {
        ...typography.caption,
        marginTop: 2,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.m,
    },
    featureText: {
        ...typography.body,
        marginLeft: spacing.m,
        fontSize: 16,
    },
    seeAll: {
        ...typography.bodyBold,
    },
    reviewCard: {
        padding: spacing.m,
        borderRadius: borderRadius.m,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.s,
    },
    reviewerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.s,
    },
    avatarText: {
        fontWeight: 'bold',
        fontSize: 12,
    },
    reviewerName: {
        ...typography.bodyBold,
    },
    reviewText: {
        ...typography.body,
        lineHeight: 22,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing.m,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        ...shadows.large,
    },
    priceContainer: {
        flex: 1,
    },
    totalLabel: {
        ...typography.caption,
        marginBottom: 2,
    },
    totalPrice: {
        ...typography.h1,
        fontSize: 24,
    },
    bookButton: {
        flex: 1.5,
        height: 56,
    },
    addOnList: {
        marginTop: spacing.s,
    },
    addOnCard: {
        width: 200,
        marginRight: spacing.m,
    }
});
