import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Platform, useWindowDimensions, Text as RNText, Pressable } from 'react-native';
import { Text, TextInput, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, FadeInRight } from 'react-native-reanimated';
import { theme } from '@/theme/theme';

export default function InteractiveLoginScreen({ navigation }: any) {
    const { width } = useWindowDimensions();
    const isLargeScreen = width >= 1024;

    const [phone, setPhone] = useState('');
    const [focused, setFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleSendOTP = async () => {
        if (phone.length < 10) return;
        navigation.navigate('OTPVerification', { phone, mode: 'signup' });
    };

    const handleLogin = () => {
        navigation.navigate('Login');
    };

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                {/* Left Side - Hero Image (Visible on large screens) */}
                {isLargeScreen && (
                    <Animated.View
                        entering={FadeInRight.duration(1000).springify()}
                        style={styles.heroContainer}
                    >
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1521737781877-96569c8c6048?q=80&w=2070&auto=format&fit=crop' }} // Professional team/collaboration image
                            style={styles.heroImage}
                            resizeMode="cover"
                        />
                        <LinearGradient
                            colors={['rgba(99, 102, 241, 0.8)', 'rgba(79, 70, 229, 0.9)']}
                            style={styles.heroOverlay}
                        >
                            <View style={styles.heroContent}>
                                <Animated.Text entering={FadeInUp.delay(200).duration(800)} style={styles.heroTitle}>
                                    Join Our Community
                                </Animated.Text>
                                <Animated.Text entering={FadeInUp.delay(400).duration(800)} style={styles.heroSubtitle}>
                                    Start your journey with UrbanVendor and take your business to new heights.
                                </Animated.Text>

                                <View style={styles.benefitsList}>
                                    <View style={styles.benefitRow}>
                                        <MaterialCommunityIcons name="check-circle" size={24} color="#a5b4fc" />
                                        <Text style={styles.benefitText}>Access to thousands of customers</Text>
                                    </View>
                                    <View style={styles.benefitRow}>
                                        <MaterialCommunityIcons name="check-circle" size={24} color="#a5b4fc" />
                                        <Text style={styles.benefitText}>Real-time analytics and insights</Text>
                                    </View>
                                    <View style={styles.benefitRow}>
                                        <MaterialCommunityIcons name="check-circle" size={24} color="#a5b4fc" />
                                        <Text style={styles.benefitText}>Secure and fast payments</Text>
                                    </View>
                                </View>
                            </View>
                        </LinearGradient>
                    </Animated.View>
                )}

                {/* Right Side - Registration Form */}
                <View style={[styles.formContainer, !isLargeScreen && styles.formContainerFull]}>
                    <Animated.View
                        entering={FadeInDown.duration(800).springify()}
                        style={styles.formContent}
                    >
                        <View style={styles.header}>
                            <View style={styles.logoContainer}>
                                <MaterialCommunityIcons name="rocket-launch" size={40} color={theme.colors.primary} />
                            </View>
                            <Text style={styles.welcomeText}>Become a Vendor</Text>
                            <Text style={styles.instructionText}>Enter your mobile number to get started.</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Mobile Number</Text>
                            <View style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}>
                                <View style={styles.prefixContainer}>
                                    <Text style={styles.prefixText}>🇮🇳 +91</Text>
                                </View>
                                <TextInput
                                    mode="flat"
                                    value={phone}
                                    onChangeText={setPhone}
                                    onFocus={() => setFocused(true)}
                                    onBlur={() => setFocused(false)}
                                    placeholder="98765 43210"
                                    style={styles.input}
                                    underlineColor="transparent"
                                    activeUnderlineColor="transparent"
                                    keyboardType="number-pad"
                                    maxLength={10}
                                    theme={{ colors: { text: theme.colors.text } }}
                                />
                            </View>
                        </View>

                        <Pressable
                            onPress={handleSendOTP}
                            disabled={phone.length < 10}
                            onHoverIn={() => setIsHovered(true)}
                            onHoverOut={() => setIsHovered(false)}
                            style={({ pressed }) => [
                                styles.continueButton,
                                phone.length < 10 && styles.continueButtonDisabled,
                                pressed && styles.continueButtonPressed
                            ]}
                        >
                            <LinearGradient
                                colors={phone.length >= 10 ? [theme.colors.primary, theme.colors.secondary] : ['#e2e8f0', '#cbd5e1']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientButton}
                            >
                                <Text style={styles.continueButtonText}>Continue</Text>
                                <MaterialCommunityIcons name="arrow-right" size={20} color="#ffffff" style={styles.buttonIcon} />
                            </LinearGradient>
                        </Pressable>

                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Already have an account? </Text>
                            <TouchableOpacity onPress={handleLogin}>
                                <Text style={styles.loginLink}>Sign In</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>By continuing, you agree to our</Text>
                            <View style={styles.footerLinks}>
                                <Text style={styles.footerLink}>Terms of Service</Text>
                                <Text style={styles.footerText}> and </Text>
                                <Text style={styles.footerLink}>Privacy Policy</Text>
                            </View>
                        </View>
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
        flex: 1.2,
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
    benefitsList: {
        marginTop: 24,
    },
    benefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    benefitText: {
        color: '#e0e7ff',
        fontSize: 18,
        marginLeft: 12,
        fontFamily: Platform.select({ web: 'Inter, sans-serif' }),
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 60, // Increased padding
        backgroundColor: '#ffffff',
    },
    formContainerFull: {
        flex: 1,
        padding: 40, // Increased padding
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    formContent: {
        width: '100%',
        maxWidth: 440,
        paddingHorizontal: 20, // Added horizontal padding
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    welcomeText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 12,
        fontFamily: Platform.select({ web: 'Inter, sans-serif' }),
    },
    instructionText: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 32,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        overflow: 'hidden',
        height: 56,
        // @ts-ignore
        transition: 'all 0.2s ease',
    },
    inputWrapperFocused: {
        borderColor: theme.colors.primary,
        backgroundColor: '#ffffff',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    prefixContainer: {
        paddingHorizontal: 16,
        height: '100%',
        justifyContent: 'center',
        backgroundColor: '#f1f5f9',
        borderRightWidth: 1,
        borderRightColor: '#e2e8f0',
    },
    prefixText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#475569',
    },
    input: {
        flex: 1,
        backgroundColor: 'transparent',
        fontSize: 16,
        height: 56,
        paddingHorizontal: 16,
    },
    continueButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 32,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 4,
    },
    continueButtonDisabled: {
        opacity: 0.7,
        shadowOpacity: 0,
    },
    continueButtonPressed: {
        transform: [{ scale: 0.98 }],
    },
    gradientButton: {
        height: 56,
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
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 48,
    },
    loginText: {
        color: '#64748b',
        fontSize: 15,
    },
    loginLink: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        fontSize: 15,
    },
    footer: {
        alignItems: 'center',
        marginTop: 'auto',
    },
    footerText: {
        color: '#94a3b8',
        fontSize: 13,
        marginBottom: 4,
    },
    footerLinks: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerLink: {
        color: '#64748b',
        fontSize: 13,
        fontWeight: '500',
    },
});
