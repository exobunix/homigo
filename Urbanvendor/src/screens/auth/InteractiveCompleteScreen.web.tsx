import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, useWindowDimensions, Text as RNText, Pressable } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, FadeInRight } from 'react-native-reanimated';
import { useAppDispatch, useAppSelector } from '@/store';
import { setUser } from '@/store/slices/authSlice';
import { theme } from '@/theme/theme';

export default function InteractiveCompleteScreen({ navigation }: any) {
    const { width } = useWindowDimensions();
    const isLargeScreen = width >= 1024;
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const [isHovered, setIsHovered] = useState(false);

    const handleGetStarted = () => {
        if (user) {
            dispatch(setUser(user));
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                {/* Left Side - Hero (Large Screen) */}
                {isLargeScreen && (
                    <Animated.View
                        entering={FadeInRight.duration(1000).springify()}
                        style={styles.heroContainer}
                    >
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2032&auto=format&fit=crop' }} // Success/Business handshake/Growth
                            style={styles.heroImage}
                            resizeMode="cover"
                        />
                        <LinearGradient
                            colors={['rgba(99, 102, 241, 0.8)', 'rgba(79, 70, 229, 0.9)']}
                            style={styles.heroOverlay}
                        >
                            <View style={styles.heroContent}>
                                <Animated.Text entering={FadeInUp.delay(200).duration(800)} style={styles.heroTitle}>
                                    Welcome Aboard!
                                </Animated.Text>
                                <Animated.Text entering={FadeInUp.delay(400).duration(800)} style={styles.heroSubtitle}>
                                    You are now part of the UrbanVendor community. Let's grow your business together.
                                </Animated.Text>
                            </View>
                        </LinearGradient>
                    </Animated.View>
                )}

                {/* Right Side - Success Content */}
                <View style={[styles.formContainer, !isLargeScreen && styles.formContainerFull]}>
                    <Animated.View
                        entering={FadeInDown.duration(800).springify()}
                        style={styles.formContent}
                    >
                        <View style={styles.successIconContainer}>
                            <MaterialCommunityIcons name="check-circle" size={80} color={theme.colors.primary} />
                        </View>

                        <Text style={styles.title}>All Set!</Text>
                        <Text style={styles.subtitle}>
                            Your vendor account is ready. Start receiving bookings now!
                        </Text>

                        <View style={styles.featuresList}>
                            <View style={styles.featureItem}>
                                <View style={styles.featureIcon}>
                                    <MaterialCommunityIcons name="lightning-bolt" size={24} color="#8B80F8" />
                                </View>
                                <View>
                                    <Text style={styles.featureTitle}>Instant Job Alerts</Text>
                                    <Text style={styles.featureDesc}>Get notified immediately when a customer books you.</Text>
                                </View>
                            </View>

                            <View style={styles.featureItem}>
                                <View style={styles.featureIcon}>
                                    <MaterialCommunityIcons name="wallet" size={24} color="#8B80F8" />
                                </View>
                                <View>
                                    <Text style={styles.featureTitle}>Secure Payments</Text>
                                    <Text style={styles.featureDesc}>Receive payments directly to your bank account safely.</Text>
                                </View>
                            </View>

                            <View style={styles.featureItem}>
                                <View style={styles.featureIcon}>
                                    <MaterialCommunityIcons name="chart-line" size={24} color="#8B80F8" />
                                </View>
                                <View>
                                    <Text style={styles.featureTitle}>Track Growth</Text>
                                    <Text style={styles.featureDesc}>Monitor your earnings and performance in real-time.</Text>
                                </View>
                            </View>
                        </View>

                        <Pressable
                            onPress={handleGetStarted}
                            onHoverIn={() => setIsHovered(true)}
                            onHoverOut={() => setIsHovered(false)}
                            style={({ pressed }) => [
                                styles.continueButton,
                                pressed && styles.continueButtonPressed
                            ]}
                        >
                            <LinearGradient
                                colors={[theme.colors.primary, theme.colors.secondary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientButton}
                            >
                                <Text style={styles.continueButtonText}>Go to Dashboard</Text>
                                <MaterialCommunityIcons name="arrow-right" size={20} color="#ffffff" style={styles.buttonIcon} />
                            </LinearGradient>
                        </Pressable>
                    </Animated.View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        overflow: 'hidden',
    },
    row: {
        flex: 1,
        flexDirection: 'row',
    },
    heroContainer: {
        flex: 1,
        position: 'relative',
        backgroundColor: '#1e1b4b',
    },
    heroImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        padding: 60,
        justifyContent: 'center',
    },
    heroContent: {
        maxWidth: 600,
    },
    heroTitle: {
        fontSize: 48,
        fontWeight: '800',
        color: '#ffffff',
        marginBottom: 24,
        lineHeight: 56,
        fontFamily: Platform.select({ web: 'Inter, sans-serif' }),
    },
    heroSubtitle: {
        fontSize: 20,
        color: '#e0e7ff',
        marginBottom: 48,
        lineHeight: 30,
        fontFamily: Platform.select({ web: 'Inter, sans-serif' }),
    },
    formContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 60,
    },
    formContainerFull: {
        flex: 1,
        width: '100%',
        padding: 40,
    },
    formContent: {
        width: '100%',
        maxWidth: 500,
        alignItems: 'center',
    },
    successIconContainer: {
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 12,
        fontFamily: Platform.select({ web: 'Inter, sans-serif' }),
    },
    subtitle: {
        fontSize: 18,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 48,
        lineHeight: 28,
    },
    featuresList: {
        width: '100%',
        marginBottom: 48,
        gap: 24,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#f8fafc',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#eef2ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    featureDesc: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
    },
    continueButton: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 4,
    },
    continueButtonPressed: {
        transform: [{ scale: 0.98 }],
    },
    gradientButton: {
        height: 60,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    continueButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        letterSpacing: 0.5,
    },
    buttonIcon: {
        marginLeft: 8,
    },
});
