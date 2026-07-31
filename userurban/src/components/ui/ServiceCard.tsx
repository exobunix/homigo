import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, TouchableOpacity, StyleProp, Dimensions, ImageBackground, ImageSourcePropType, Platform } from 'react-native';
import { Card } from './Card';
import { AppButton } from './AppButton';
import { RatingStars } from './RatingStars';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface ServiceCardProps {
    title: string;
    image: string | ImageSourcePropType;
    rating: number;
    price: string;
    onPress?: () => void;
    onBook?: () => void;
    onIncrement?: () => void;
    onDecrement?: () => void;
    quantity?: number;
    style?: StyleProp<ViewStyle>;
    variant?: 'horizontal' | 'vertical' | 'backgroundImage';
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
    title,
    image,
    rating,
    price,
    onPress,
    onBook,
    onIncrement,
    onDecrement,
    quantity = 0,
    style,
    variant = 'horizontal',
}) => {
    const { colors } = useTheme();

    const renderAddButton = () => {
        if (quantity > 0 && onIncrement && onDecrement) {
            return (
                <View style={styles.counterContainer}>
                    <TouchableOpacity onPress={onDecrement} style={styles.counterBtn}>
                        <Text style={styles.counterBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.counterText}>{quantity}</Text>
                    <TouchableOpacity onPress={onIncrement} style={styles.counterBtn}>
                        <Text style={styles.counterBtnText}>+</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return (
            <TouchableOpacity
                style={styles.bgButton}
                onPress={onBook}
            >
                <Text style={styles.bgButtonText}>Add</Text>
            </TouchableOpacity>
        );
    };

    if (variant === 'backgroundImage') {
        return (
            <TouchableOpacity
                style={[styles.bgCard, style]}
                onPress={onPress}
                activeOpacity={0.9}
            >
                <ImageBackground
                    source={typeof image === 'string' ? { uri: image } : image}
                    style={styles.bgImage}
                    imageStyle={{ borderRadius: borderRadius.m }}
                >
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.bgOverlay}
                    >
                        <View style={styles.bgHeader}>
                            <View style={styles.bgRating}>
                                <Ionicons name="star" size={12} color="#FFD700" />
                                <Text style={styles.bgRatingText}>{rating}</Text>
                            </View>
                        </View>

                        <View style={styles.bgContent}>
                            <Text style={styles.bgTitle} numberOfLines={2}>{title}</Text>
                            <View style={styles.bgFooter}>
                                <Text style={styles.bgPrice}>{price}</Text>
                                {renderAddButton()}
                            </View>
                        </View>
                    </LinearGradient>
                </ImageBackground>
            </TouchableOpacity>
        );
    }

    if (variant === 'vertical') {
        return (
            <TouchableOpacity
                style={[styles.verticalContainer, styles.card, style]}
                onPress={onPress}
                activeOpacity={0.9}
            >
                <Image
                    source={typeof image === 'string' ? { uri: image } : image}
                    style={styles.verticalImage}
                    resizeMode="cover"
                />
                <View style={styles.verticalContent}>
                    <View style={styles.verticalHeader}>
                        <View style={styles.row}>
                            <RatingStars rating={rating} size={14} />
                            <Text style={styles.reviewCount}>(120)</Text>
                        </View>
                    </View>
                    <Text style={[styles.verticalTitle, { color: colors.text }]}>{title}</Text>
                    <View style={styles.verticalFooter}>
                        <Text style={styles.verticalPrice}>{price}</Text>
                        <TouchableOpacity
                            style={[styles.verticalButton, { backgroundColor: colors.primary }]}
                            onPress={onBook}
                        >
                            <Text style={[styles.verticalButtonText, { color: colors.white }]}>Book Now</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            style={[styles.container, styles.card, style]}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <Image
                source={typeof image === 'string' ? { uri: image } : image}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{title}</Text>
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text style={[styles.rating, { color: colors.textSecondary }]}>{rating}</Text>
                    </View>
                </View>
                <Text style={[styles.price, { color: colors.primary }]}>{price}</Text>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={onBook}
                >
                    <Text style={[styles.buttonText, { color: colors.white }]}>Book</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: borderRadius.m,
        ...shadows.small,
        overflow: 'hidden',
    },
    container: {
        flexDirection: 'row',
        padding: spacing.s,
        alignItems: 'center',
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: borderRadius.s,
    },
    content: {
        flex: 1,
        marginLeft: spacing.m,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.xs,
    },
    title: {
        ...typography.bodyBold,
        flex: 1,
        marginRight: spacing.s,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rating: {
        ...typography.caption,
        marginLeft: 2,
    },
    price: {
        ...typography.bodyBold,
        marginBottom: spacing.s,
    },
    button: {
        paddingVertical: 6,
        paddingHorizontal: spacing.m,
        borderRadius: borderRadius.s,
        alignSelf: 'flex-start',
    },
    buttonText: {
        ...typography.caption,
        fontWeight: 'bold',
    },
    // Vertical Styles
    verticalContainer: {
        width: '100%',
    },
    verticalImage: {
        width: '100%',
        height: 220,
    },
    verticalContent: {
        padding: spacing.m,
    },
    verticalHeader: {
        marginBottom: spacing.s,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reviewCount: {
        ...typography.caption,
        marginLeft: spacing.xs,
        color: '#888',
    },
    verticalTitle: {
        ...typography.h2,
        marginBottom: spacing.xs,
    },
    verticalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.s,
    },
    verticalPrice: {
        ...typography.h1,
        fontSize: 24,
        color: '#E91E63', // Brand color
    },
    verticalButton: {
        paddingVertical: spacing.s,
        paddingHorizontal: spacing.l,
        minWidth: 120,
        borderRadius: borderRadius.l,
    },
    verticalButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Background Image Styles
    bgCard: {
        height: 200,
        borderRadius: borderRadius.m,
        overflow: 'hidden',
        marginBottom: spacing.m,
        ...shadows.medium,
    },
    bgImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'space-between',
    },
    bgOverlay: {
        flex: 1,
        justifyContent: 'space-between',
        padding: spacing.m,
        borderRadius: borderRadius.m,
    },
    bgHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    bgRating: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    bgRatingText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 4,
        fontSize: 12,
    },
    bgContent: {
        width: '100%',
    },
    bgTitle: {
        ...typography.h2,
        color: 'white',
        marginBottom: spacing.xs,
        ...Platform.select({
            web: {
                textShadow: '-1px 1px 10px rgba(0,0,0,0.75)',
            },
            default: {
                textShadowColor: 'rgba(0,0,0,0.75)',
                textShadowOffset: { width: -1, height: 1 },
                textShadowRadius: 10,
            },
        }),
    },
    bgFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bgPrice: {
        ...typography.h2,
        color: 'white',
        ...Platform.select({
            web: {
                textShadow: '-1px 1px 10px rgba(0,0,0,0.75)',
            },
            default: {
                textShadowColor: 'rgba(0,0,0,0.75)',
                textShadowOffset: { width: -1, height: 1 },
                textShadowRadius: 10,
            },
        }),
    },
    bgButton: {
        backgroundColor: 'white',
        paddingHorizontal: spacing.m,
        paddingVertical: 6,
        borderRadius: borderRadius.l,
    },
    bgButtonText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 12,
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: borderRadius.l,
        paddingHorizontal: 4,
        paddingVertical: 4,
    },
    counterBtn: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
    },
    counterBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
    },
    counterText: {
        marginHorizontal: 8,
        fontWeight: 'bold',
        fontSize: 14,
        color: 'black',
    }
});
