import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, useWindowDimensions, Text as RNText, Pressable } from 'react-native';
import { Text, TextInput, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, FadeInRight } from 'react-native-reanimated';
import { authAPI } from '@/services/api';
import { theme } from '@/theme/theme';

interface ResetPasswordScreenProps {
    navigation: any;
    route: { params: { phone: string } };
}

export default function ResetPasswordWeb({ navigation, route }: ResetPasswordScreenProps) {
    const { width } = useWindowDimensions();
    const isLargeScreen = width >= 1024;
    const { phone } = route.params || { phone: '' };

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleSubmit = async () => {
        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('New password and confirm password must match');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);
            await authAPI.updateProfile({ password: newPassword } as any);
            navigation.navigate('Login');
        } catch (e: any) {
            const message = e?.response?.data?.message || 'Failed to reset password';
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isValid = newPassword.length >= 6 && newPassword === confirmPassword;

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
                            source={{ uri: 'https://images.unsplash.com/photo-1512428559087-560fa0db79b5?q=80&w=2070&auto=format&fit=crop' }} // Security/Lock image
                            style={styles.heroImage}
                            resizeMode="cover"
                        />
                        <LinearGradient
                            colors={['rgba(99, 102, 241, 0.8)', 'rgba(79, 70, 229, 0.9)']}
                            style={styles.heroOverlay}
                        >
                            <View style={styles.heroContent}>
                                <Animated.Text entering={FadeInUp.delay(200).duration(800)} style={styles.heroTitle}>
                                    Secure Your Account
                                </Animated.Text>
                                <Animated.Text entering={FadeInUp.delay(400).duration(800)} style={styles.heroSubtitle}>
                                    Create a strong password to protect your business data and earnings.
                                </Animated.Text>
                            </View>
                        </LinearGradient>
                    </Animated.View>
                )}

                {/* Right Side - Form */}
                <View style={[styles.formContainer, !isLargeScreen && styles.formContainerFull]}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <Animated.View
                            entering={FadeInDown.duration(800).springify()}
                            style={styles.formContent}
                        >
                            <View style={styles.header}>
                                <View style={styles.iconContainer}>
                                    <MaterialCommunityIcons name="lock-reset" size={40} color={theme.colors.primary} />
                                </View>
                                <Text style={styles.welcomeText}>Reset Password</Text>
                                <Text style={styles.instructionText}>Set a new password for {phone}</Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <TextInput
                                    label="New Password"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry={!showNew}
                                    mode="outlined"
                                    style={styles.input}
                                    outlineColor="#e2e8f0"
                                    activeOutlineColor={theme.colors.primary}
                                    right={<TextInput.Icon icon={showNew ? "eye-off" : "eye"} onPress={() => setShowNew(!showNew)} />}
                                    autoComplete="new-password" // Prevent autofill
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <TextInput
                                    label="Confirm New Password"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirm}
                                    mode="outlined"
                                    style={styles.input}
                                    outlineColor="#e2e8f0"
                                    activeOutlineColor={theme.colors.primary}
                                    right={<TextInput.Icon icon={showConfirm ? "eye-off" : "eye"} onPress={() => setShowConfirm(!showConfirm)} />}
                                    autoComplete="new-password" // Prevent autofill
                                />
                            </View>

                            {error && (
                                <Animated.View entering={FadeInUp} style={styles.errorContainer}>
                                    <MaterialCommunityIcons name="alert-circle" size={20} color="#ef4444" />
                                    <Text style={styles.errorText}>{error}</Text>
                                </Animated.View>
                            )}

                            <Pressable
                                onPress={handleSubmit}
                                disabled={!isValid || isSubmitting}
                                onHoverIn={() => setIsHovered(true)}
                                onHoverOut={() => setIsHovered(false)}
                                style={({ pressed }) => [
                                    styles.submitButton,
                                    (!isValid || isSubmitting) && styles.submitButtonDisabled,
                                    pressed && styles.submitButtonPressed
                                ]}
                            >
                                <LinearGradient
                                    colors={isValid ? [theme.colors.primary, theme.colors.secondary] : ['#e2e8f0', '#cbd5e1']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.gradientButton}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Reset Password</Text>
                                    )}
                                </LinearGradient>
                            </Pressable>


                        </Animated.View>
                    </ScrollView>
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 24,
    },
    formContent: {
        width: '100%',
        maxWidth: 440,
        paddingHorizontal: 20,
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    welcomeText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
        fontFamily: Platform.select({ web: 'Inter, sans-serif' }),
    },
    instructionText: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 20,
        width: '100%',
    },
    input: {
        backgroundColor: '#ffffff',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef2f2',
        padding: 12,
        borderRadius: 8,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#fee2e2',
    },
    errorText: {
        color: '#ef4444',
        marginLeft: 8,
        fontSize: 14,
        flex: 1,
    },
    submitButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 8,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 4,
    },
    submitButtonDisabled: {
        opacity: 0.7,
        shadowOpacity: 0,
    },
    submitButtonPressed: {
        transform: [{ scale: 0.98 }],
    },
    gradientButton: {
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        letterSpacing: 0.5,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
        padding: 8,
    },
    backButtonText: {
        color: '#64748b',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
});
