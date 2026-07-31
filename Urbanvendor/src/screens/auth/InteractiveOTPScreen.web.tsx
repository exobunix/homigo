import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Platform, useWindowDimensions, Text as RNText, Pressable, TextInput as RNTextInput } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, FadeInRight } from 'react-native-reanimated';
import { useAppDispatch } from '@/store';
import { verifyOTP } from '@/store/slices/authSlice';
import { theme } from '@/theme/theme';

export default function InteractiveOTPScreen({ navigation, route }: any) {
    const { width } = useWindowDimensions();
    const isLargeScreen = width >= 1024;

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(30);
    const { phone, mode = 'signup' } = route.params || {};
    const inputRefs = useRef<(RNTextInput | null)[]>([]);
    const dispatch = useAppDispatch();
    const [isVerifying, setIsVerifying] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleOtpChange = (value: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOTP = async () => {
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setErrorMessage('Please enter the 6-digit code.');
            return;
        }

        if (otpString !== '123456') {
            setErrorMessage('Invalid OTP. For testing, please use 123456.');
            return;
        }

        if (isVerifying) return;

        try {
            setIsVerifying(true);
            const action = await dispatch(verifyOTP({ phone, otp: otpString }));

            if (verifyOTP.fulfilled.match(action)) {
                setErrorMessage(null);
                if (mode === 'reset') {
                    navigation.navigate('ResetPassword', { phone });
                } else {
                    navigation.navigate('ProfileSetup', { phone });
                }
            }
        } catch (error) {
            const fbError: any = error;
            const message = fbError?.message || 'Invalid code. Please try again.';
            setErrorMessage(message);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = () => {
        if (timer === 0) {
            setOtp(['', '', '', '', '', '']);
            setErrorMessage(null);
            setTimer(30);
        }
    };

    const isComplete = otp.every(digit => digit !== '');

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
                            source={{ uri: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop' }} // Security/Technology image
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
                                    We take security seriously. Verify your identity to access your vendor dashboard.
                                </Animated.Text>

                                <View style={styles.securityBadge}>
                                    <MaterialCommunityIcons name="shield-check" size={48} color="#ffffff" />
                                    <View style={styles.securityTextContainer}>
                                        <Text style={styles.securityTitle}>Bank-Grade Security</Text>
                                        <Text style={styles.securityDesc}>Your data is encrypted and protected 24/7.</Text>
                                    </View>
                                </View>
                            </View>
                        </LinearGradient>
                    </Animated.View>
                )}

                {/* Right Side - OTP Form */}
                <View style={[styles.formContainer, !isLargeScreen && styles.formContainerFull]}>
                    <Animated.View
                        entering={FadeInDown.duration(800).springify()}
                        style={styles.formContent}
                    >


                        <View style={styles.header}>
                            <View style={styles.iconContainer}>
                                <MaterialCommunityIcons name="message-lock" size={40} color={theme.colors.primary} />
                            </View>
                            <Text style={styles.welcomeText}>Verify Mobile Number</Text>
                            <Text style={styles.instructionText}>
                                Enter the 6-digit code sent to <Text style={styles.phoneText}>{phone || '+91 98765 43210'}</Text>
                            </Text>
                        </View>

                        <View style={styles.otpContainer}>
                            {otp.map((digit, index) => (
                                <View key={index} style={styles.otpInputWrapper}>
                                    <RNTextInput
                                        ref={(ref) => { inputRefs.current[index] = ref; }}
                                        style={[
                                            styles.otpInput,
                                            digit ? styles.otpInputFilled : null
                                        ]}
                                        value={digit}
                                        onChangeText={(value) => handleOtpChange(value.slice(-1), index)}
                                        onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                                        keyboardType="number-pad"
                                        maxLength={1}
                                        textAlign="center"
                                        selectTextOnFocus
                                    />
                                </View>
                            ))}
                        </View>

                        {errorMessage && (
                            <Animated.View entering={FadeInDown} style={styles.errorContainer}>
                                <MaterialCommunityIcons name="alert-circle" size={16} color={theme.colors.error} />
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            </Animated.View>
                        )}

                        <Pressable
                            onPress={handleVerifyOTP}
                            disabled={!isComplete || isVerifying}
                            onHoverIn={() => setIsHovered(true)}
                            onHoverOut={() => setIsHovered(false)}
                            style={({ pressed }) => [
                                styles.verifyButton,
                                (!isComplete || isVerifying) && styles.verifyButtonDisabled,
                                pressed && styles.verifyButtonPressed
                            ]}
                        >
                            <LinearGradient
                                colors={isComplete ? [theme.colors.primary, theme.colors.secondary] : ['#e2e8f0', '#cbd5e1']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientButton}
                            >
                                {isVerifying ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.verifyButtonText}>Verify & Continue</Text>
                                )}
                            </LinearGradient>
                        </Pressable>

                        <View style={styles.resendContainer}>
                            <Text style={styles.resendText}>Didn't receive the code? </Text>
                            <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
                                <Text style={[styles.resendLink, timer > 0 && styles.resendLinkDisabled]}>
                                    {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                                </Text>
                            </TouchableOpacity>
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
    securityBadge: {
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
    securityTextContainer: {
        marginLeft: 16,
    },
    securityTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    securityDesc: {
        fontSize: 14,
        color: '#c7d2fe',
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#ffffff',
    },
    formContainerFull: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    formContent: {
        width: '100%',
        maxWidth: 440,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
        alignSelf: 'flex-start',
    },
    backText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#64748b',
        fontWeight: '500',
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    iconContainer: {
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
        textAlign: 'center',
        fontFamily: Platform.select({ web: 'Inter, sans-serif' }),
    },
    instructionText: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 24,
    },
    phoneText: {
        color: '#1e293b',
        fontWeight: '600',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 32,
        gap: 12,
    },
    otpInputWrapper: {
        width: 50,
        height: 60,
    },
    otpInput: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        textAlign: 'center',
        padding: 0,
        // @ts-ignore
        transition: 'all 0.2s ease',
    },
    otpInputFilled: {
        borderColor: theme.colors.primary,
        backgroundColor: '#ffffff',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    verifyButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 32,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 4,
    },
    verifyButtonDisabled: {
        opacity: 0.7,
        shadowOpacity: 0,
    },
    verifyButtonPressed: {
        transform: [{ scale: 0.98 }],
    },
    gradientButton: {
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    verifyButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        letterSpacing: 0.5,
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    resendText: {
        color: '#64748b',
        fontSize: 15,
    },
    resendLink: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        fontSize: 15,
    },
    resendLinkDisabled: {
        color: '#94a3b8',
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
});
