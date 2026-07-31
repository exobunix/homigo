import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Platform, useWindowDimensions, Text as RNText, Pressable } from 'react-native';
import { Text, TextInput, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, FadeInRight } from 'react-native-reanimated';
import { useAppDispatch, useAppSelector } from '@/store';
import { loginWithPasswordAuth } from '@/store/slices/authSlice';
import { theme } from '@/theme/theme';

export default function LoginFormScreen({ navigation }: any) {
    const { width, height } = useWindowDimensions();
    const isLargeScreen = width >= 1024;

    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [phoneFocused, setPhoneFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector((state) => state.auth);

    const handleLogin = async () => {
        if (phone.length < 10 || password.length < 6 || isLoading) {
            return;
        }

        const action = await dispatch(
            loginWithPasswordAuth({ phone, password })
        );

        if (loginWithPasswordAuth.fulfilled.match(action)) {
            console.log('✅ Login successful');
        }
    };

    const handleSignup = () => {
        navigation.navigate('VendorSignup');
    };

    const handleForgotPassword = () => {
        if (isLoading) return;
        if (phone.length < 10) {
            // Ideally show a toast or snackbar here
            alert('Please enter your 10-digit mobile number to reset password.');
            return;
        }
        navigation.navigate('OTPVerification', { phone, mode: 'reset' });
    };

    const isFormValid = phone.length >= 10 && password.length >= 6;
    const loginError = (error as any)?.message ?? null;

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
                            source={{ uri: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?q=80&w=2070&auto=format&fit=crop' }} // Professional business/vendor image
                            style={styles.heroImage}
                            resizeMode="cover"
                        />
                        <LinearGradient
                            colors={['rgba(99, 102, 241, 0.8)', 'rgba(79, 70, 229, 0.9)']}
                            style={styles.heroOverlay}
                        >
                            <View style={styles.heroContent}>
                                <Animated.Text entering={FadeInUp.delay(200).duration(800)} style={styles.heroTitle}>
                                    Grow Your Business
                                </Animated.Text>
                                <Animated.Text entering={FadeInUp.delay(400).duration(800)} style={styles.heroSubtitle}>
                                    Manage orders, track earnings, and reach more customers with UrbanVendor.
                                </Animated.Text>

                                <View style={styles.statsRow}>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statValue}>50k+</Text>
                                        <Text style={styles.statLabel}>Vendors</Text>
                                    </View>
                                    <View style={styles.statDivider} />
                                    <View style={styles.statItem}>
                                        <Text style={styles.statValue}>1M+</Text>
                                        <Text style={styles.statLabel}>Orders</Text>
                                    </View>
                                    <View style={styles.statDivider} />
                                    <View style={styles.statItem}>
                                        <Text style={styles.statValue}>4.8</Text>
                                        <Text style={styles.statLabel}>Rating</Text>
                                    </View>
                                </View>
                            </View>
                        </LinearGradient>
                    </Animated.View>
                )}

                {/* Right Side - Login Form */}
                <View style={[styles.formContainer, !isLargeScreen && styles.formContainerFull]}>
                    <Animated.View
                        entering={FadeInDown.duration(800).springify()}
                        style={styles.formContent}
                    >
                        <View style={styles.header}>
                            <View style={styles.logoContainer}>
                                <MaterialCommunityIcons name="storefront" size={40} color={theme.colors.primary} />
                            </View>
                            <Text style={styles.welcomeText}>Welcome Back!</Text>
                            <Text style={styles.instructionText}>Please enter your details to sign in.</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Mobile Number</Text>
                            <View style={[styles.inputWrapper, phoneFocused && styles.inputWrapperFocused]}>
                                <View style={styles.prefixContainer}>
                                    <Text style={styles.prefixText}>🇮🇳 +91</Text>
                                </View>
                                <TextInput
                                    mode="flat"
                                    value={phone}
                                    onChangeText={setPhone}
                                    onFocus={() => setPhoneFocused(true)}
                                    onBlur={() => setPhoneFocused(false)}
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

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused]}>
                                <MaterialCommunityIcons name="lock-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                                <TextInput
                                    mode="flat"
                                    value={password}
                                    onChangeText={setPassword}
                                    onFocus={() => setPasswordFocused(true)}
                                    onBlur={() => setPasswordFocused(false)}
                                    placeholder="••••••••"
                                    secureTextEntry={!showPassword}
                                    style={styles.input}
                                    underlineColor="transparent"
                                    activeUnderlineColor="transparent"
                                    theme={{ colors: { text: theme.colors.text } }}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                    <MaterialCommunityIcons name={showPassword ? "eye-off" : "eye"} size={20} color="#94a3b8" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.forgotContainer}>
                            <TouchableOpacity onPress={handleForgotPassword}>
                                <Text style={styles.forgotText}>Forgot Password?</Text>
                            </TouchableOpacity>
                        </View>

                        {loginError && (
                            <Animated.View entering={FadeInDown} style={styles.errorContainer}>
                                <MaterialCommunityIcons name="alert-circle" size={16} color={theme.colors.error} />
                                <Text style={styles.errorText}>{loginError}</Text>
                            </Animated.View>
                        )}

                        <Pressable
                            onPress={handleLogin}
                            disabled={!isFormValid || isLoading}
                            onHoverIn={() => setIsHovered(true)}
                            onHoverOut={() => setIsHovered(false)}
                            style={({ pressed }) => [
                                styles.loginButton,
                                (!isFormValid || isLoading) && styles.loginButtonDisabled,
                                pressed && styles.loginButtonPressed
                            ]}
                        >
                            <LinearGradient
                                colors={isFormValid ? [theme.colors.primary, theme.colors.secondary] : ['#e2e8f0', '#cbd5e1']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientButton}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.loginButtonText}>Sign In</Text>
                                )}
                            </LinearGradient>
                        </Pressable>

                        <View style={styles.signupContainer}>
                            <Text style={styles.signupText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={handleSignup}>
                                <Text style={styles.signupLink}>Register as Vendor</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>© 2024 UrbanVendor. All rights reserved.</Text>
                            <View style={styles.footerLinks}>
                                <Text style={styles.footerLink}>Privacy</Text>
                                <Text style={styles.footerDot}>•</Text>
                                <Text style={styles.footerLink}>Terms</Text>
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
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 24,
        borderRadius: 20,
        // @ts-ignore
        backdropFilter: 'blur(10px)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: '#c7d2fe',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
        paddingHorizontal: 20, // Added horizontal padding for inner content
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
        marginBottom: 24,
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
    inputIcon: {
        paddingLeft: 16,
    },
    input: {
        flex: 1,
        backgroundColor: 'transparent',
        fontSize: 16,
        height: 56,
        paddingHorizontal: 16,
    },
    eyeIcon: {
        padding: 16,
    },
    forgotContainer: {
        alignItems: 'flex-end',
        marginBottom: 32,
    },
    forgotText: {
        color: theme.colors.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    loginButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 32,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 4,
    },
    loginButtonDisabled: {
        opacity: 0.7,
        shadowOpacity: 0,
    },
    loginButtonPressed: {
        transform: [{ scale: 0.98 }],
    },
    gradientButton: {
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        letterSpacing: 0.5,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 48,
    },
    signupText: {
        color: '#64748b',
        fontSize: 15,
    },
    signupLink: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        fontSize: 15,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef2f2',
        padding: 12,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#fee2e2',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14,
        marginLeft: 8,
        flex: 1,
    },
    footer: {
        alignItems: 'center',
        marginTop: 'auto',
    },
    footerText: {
        color: '#94a3b8',
        fontSize: 13,
        marginBottom: 8,
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
    footerDot: {
        color: '#cbd5e1',
        marginHorizontal: 8,
    },
});
