import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { WebLayout } from './WebLayout';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

export const WebServiceDetails = ({ onNavigate, params }: { onNavigate: (route: string, params?: any) => void, params?: any }) => {
    const service = params?.service || { name: 'Service Details', price: 0, description: 'No details available' };

    return (
        <WebLayout onNavigate={onNavigate}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.content}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: service.image || 'https://via.placeholder.com/400' }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    </View>
                    <View style={styles.details}>
                        <Text style={styles.title}>{service.name}</Text>
                        <Text style={styles.price}>${service.price}</Text>
                        <Text style={styles.description}>{service.description}</Text>

                        <View style={styles.divider} />

                        <Text style={styles.sectionTitle}>What's Included</Text>
                        <View style={styles.feature}>
                            <Text style={styles.featureText}>• Professional Service</Text>
                        </View>
                        <View style={styles.feature}>
                            <Text style={styles.featureText}>• Safety Protocols</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => onNavigate('checkout', { service })}
                        >
                            <Text style={styles.addButtonText}>Book Now</Text>
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <Text style={styles.sectionTitle}>Customer Reviews</Text>
                        <View style={styles.reviewItem}>
                            <View style={styles.reviewHeader}>
                                <Text style={styles.reviewerName}>John Doe</Text>
                                <View style={{ flexDirection: 'row' }}>
                                    {[...Array(5)].map((_, i) => (
                                        <Text key={i} style={{ color: '#FFB400' }}>★</Text>
                                    ))}
                                </View>
                            </View>
                            <Text style={styles.reviewText}>"Great service! Highly recommended."</Text>
                        </View>
                        <View style={styles.reviewItem}>
                            <View style={styles.reviewHeader}>
                                <Text style={styles.reviewerName}>Jane Smith</Text>
                                <View style={{ flexDirection: 'row' }}>
                                    {[...Array(4)].map((_, i) => (
                                        <Text key={i} style={{ color: '#FFB400' }}>★</Text>
                                    ))}
                                </View>
                            </View>
                            <Text style={styles.reviewText}>"Professional and on time."</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </WebLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    content: {
        flexDirection: 'row',
        maxWidth: 1000,
        width: '100%',
        backgroundColor: colors.white,
        borderRadius: borderRadius.l,
        padding: spacing.xl,
        ...shadows.medium,
        gap: spacing.xl,
    },
    imageContainer: {
        flex: 1,
        height: 400,
        borderRadius: borderRadius.m,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    details: {
        flex: 1,
    },
    title: {
        ...typography.h1,
        marginBottom: spacing.s,
    },
    price: {
        ...typography.h2,
        color: colors.primary,
        marginBottom: spacing.m,
    },
    description: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: spacing.l,
        lineHeight: 24,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: spacing.l,
    },
    sectionTitle: {
        ...typography.h3,
        marginBottom: spacing.m,
    },
    feature: {
        marginBottom: spacing.s,
    },
    featureText: {
        ...typography.body,
    },
    addButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.m,
        borderRadius: borderRadius.m,
        alignItems: 'center',
        marginTop: spacing.xl,
    },
    addButtonText: {
        ...typography.bodyBold,
        color: colors.white,
    },
    reviewItem: {
        marginBottom: spacing.m,
        padding: spacing.m,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.m,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.s,
    },
    reviewerName: {
        ...typography.bodyBold,
        color: colors.text,
    },
    reviewText: {
        ...typography.body,
        color: colors.textSecondary,
        fontStyle: 'italic',
    }
});
