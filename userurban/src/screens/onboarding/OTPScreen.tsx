import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput, ScrollView, Animated, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/ui/AppButton';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography, shadows, borderRadius } from '../../theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const OTPScreen = ({ navigation, route }: any) => {
    const { colors, isDark } = useTheme();
    const { phoneNumber, generatedOTP } = route.params || { phoneNumber: '+91 98765 43210', generatedOTP: '' };
    const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6 digits
    const inputs = useRef<Array<TextInput | null>>([]);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.8));
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleOtpChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpValue = otp.join('');
        if (otpValue.length !== 6) {
            Alert.alert('Invalid OTP', 'Please enter the complete 6-digit code');
            return;
        }

        console.log('🔐 ========== STARTING OTP VERIFICATION ==========');
        console.log('📱 Phone:', phoneNumber);
        console.log('🔢 Entered OTP:', otpValue);
        console.log('🔢 Expected OTP:', generatedOTP);

        setLoading(true);
        try {
            // Verify OTP matches the generated one
            if (otpValue !== generatedOTP) {
                console.log('❌ OTP verification FAILED - Mismatch');
                Alert.alert('Invalid OTP', 'The code you entered is incorrect');
                setLoading(false);
                return;
            }

            console.log('✅ OTP verification SUCCESS');

            // Login/Register with backend
            console.log('📡 Calling backend login...');
            const response = await api.loginOrRegister(phoneNumber);

            console.log('📡 Backend response:', response);

            if (response.success) {
                const user = response.data?.user || response.user;
                console.log('✅ Login successful:', user);

                // Check if user has saved addresses
                if (user.savedAddresses && user.savedAddresses.length > 0) {
                    navigation.navigate('MainTabs', { screen: 'Home' });
                } else {
                    navigation.navigate('LocationPermission');
                }
            } else {
                console.log('❌ Backend login failed');
                Alert.alert('Login Failed', response.message || 'Failed to login. Please try again.');
            }
        } catch (error: any) {
            console.error('💥 Verification error:', error);
            Alert.alert('Error', error.message || 'Failed to verify OTP. Please try again.');
        } finally {
            setLoading(false);
            console.log('🔐 ========== OTP VERIFICATION COMPLETE ==========');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <Animated.View style={[styles.illustrationContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                        <View style={[styles.iconCircle, { backgroundColor: isDark ? colors.surfaceHighlight : colors.surfaceHighlight }]}>
                            <Ionicons name="shield-checkmark" size={48} color={colors.primary} />
                        </View>
                    </Animated.View>

                    <Animated.View style={{ opacity: fadeAnim }}>
                        <Text style={[styles.title, { color: colors.text }]}>Verification Code</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            We have sent the verification code to your mobile number <Text style={[styles.phoneNumber, { color: colors.text }]}>{phoneNumber}</Text>
                        </Text>

                        <View style={styles.otpContainer}>
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref: any) => (inputs.current[index] = ref)}
                                    style={[
                                        styles.otpInput,
                                        {
                                            borderColor: colors.border,
                                            color: colors.text,
                                            backgroundColor: colors.surface
                                        },
                                        digit ? { borderColor: colors.primary, backgroundColor: isDark ? colors.surface : colors.white } : null
                                    ]}
                                    value={digit}
                                    onChangeText={(text) => handleOtpChange(text, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    selectTextOnFocus
                                    selectionColor={colors.primary}
                                    placeholderTextColor={colors.textSecondary}
                                />
                            ))}
                        </View>

                        <TouchableOpacity style={styles.resendContainer}>
                            <Text style={[styles.resendText, { color: colors.textSecondary }]}>Didn't receive code? </Text>
                            <Text style={[styles.resendLink, { color: colors.primary }]}>Resend</Text>
                        </TouchableOpacity>

                        <AppButton
                            title={loading ? "Verifying..." : "Verify & Continue"}
                            onPress={handleVerify}
                            style={styles.verifyButton}
                            disabled={otp.some(d => !d) || loading}
                        />
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView >
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: spacing.m,
    },
    iconButton: {
        padding: spacing.xs,
    },
    content: {
        flexGrow: 1,
        padding: spacing.l,
        paddingTop: spacing.s,
    },
    illustrationContainer: {
        alignItems: 'center',
        marginBottom: spacing.xl,
        marginTop: spacing.m,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.medium,
    },
    title: {
        ...typography.h1,
        marginBottom: spacing.s,
        textAlign: 'center',
    },
    subtitle: {
        ...typography.body,
        marginBottom: spacing.xl,
        textAlign: 'center',
        paddingHorizontal: spacing.m,
    },
    phoneNumber: {
        fontWeight: '600',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: spacing.l,
        gap: 8, // Reduced gap for better fit
    },
    otpInput: {
        width: 45, // Reduced size
        height: 50, // Reduced size
        borderWidth: 1,
        borderRadius: borderRadius.m,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '600',
        ...shadows.small,
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: spacing.xl,
    },
    resendText: {
        ...typography.body,
    },
    resendLink: {
        ...typography.bodyBold,
    },
    verifyButton: {
        marginTop: spacing.m,
    }
});
