import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Modal } from 'react-native';
import { WebLayout } from './WebLayout';
import { colors, spacing, typography, borderRadius, shadows, palette } from '../../theme/tokens';
import { AppButton } from '../../components/ui/AppButton';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';

export const WebLogin = ({ onNavigate }: { onNavigate: (route: string) => void }) => {
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6 digits
    const [loading, setLoading] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);

    const handleSendOtp = async () => {
        if (phone.length < 10) {
            alert('Please enter a valid phone number');
            return;
        }

        setLoading(true);
        try {
            const formattedPhone = `+91${phone}`;
            console.log('📱 Phone number:', formattedPhone);
            console.log('🔐 OTP for all users: 123456');

            // Show alert with OTP
            alert('OTP: 123456\n\n(Use this OTP for any phone number)');

            setStep('otp');
        } catch (error: any) {
            console.error('💥 Error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        const otpValue = otp.join('');
        if (otpValue.length !== 6) {
            alert('Please enter the complete 6-digit code');
            return;
        }

        console.log('🔐 ========== VERIFYING OTP ==========');
        console.log('📱 Phone:', phone);
        console.log('🔢 Entered OTP:', otpValue);

        setLoading(true);
        try {
            // Verify OTP is 123456
            if (otpValue !== '123456') {
                console.log('❌ OTP verification failed');
                alert('Invalid OTP. Use: 123456');
                setLoading(false);
                return;
            }

            console.log('✅ OTP verified! Logging in...');

            // Login with backend
            const response = await api.loginOrRegister(`+91${phone}`);

            console.log('📡 Backend response:', response);

            if (response.success) {
                console.log('✅ Login successful!');
                setLoading(false);
                // Show location modal after successful login
                setShowLocationModal(true);
            } else {
                console.log('❌ Backend login failed');
                setLoading(false);
                alert('Login failed: ' + response.message);
            }
        } catch (error: any) {
            console.error('💥 Login error:', error);
            setLoading(false);
            alert('Login failed. Please try again.');
        }
    };

    const requestLocation = async () => {
        setLocationLoading(true);
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject(new Error('Geolocation not supported'));
                    return;
                }
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });

            const { latitude, longitude } = position.coords;

            // Reverse geocode
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
            );
            const data = await response.json();
            const city = data?.address?.city || data?.address?.town || data?.address?.village || 'Your Location';

            // Save location to profile
            await api.updateProfile({
                location: { latitude, longitude, city }
            });

            setShowLocationModal(false);
            onNavigate('home');
        } catch (error: any) {
            setLocationLoading(false);
            if (error.code === 1) {
                // Permission denied - ask for manual input
                const manualCity = window.prompt('Please enter your city name:', '');
                if (manualCity) {
                    try {
                        await api.updateProfile({
                            location: { city: manualCity }
                        });
                        setShowLocationModal(false);
                        onNavigate('home');
                    } catch (e) {
                        alert('Failed to save location');
                    }
                }
            } else {
                alert('Failed to get location. Please try again.');
            }
        } finally {
            setLocationLoading(false);
        }
    };

    const skipLocation = () => {
        setShowLocationModal(false);
        onNavigate('home');
    };

    const inputRefs = React.useRef<Array<TextInput | null>>([]);

    const handleOtpChange = (text: string, index: number) => {
        const newOtp = [...otp];

        // Handle paste event (if text length > 1)
        if (text.length > 1) {
            const pastedCode = text.slice(0, 6).split('');
            for (let i = 0; i < 6; i++) {
                newOtp[i] = pastedCode[i] || '';
            }
            setOtp(newOtp);
            // Focus last filled input or the last input
            const lastIndex = Math.min(pastedCode.length, 5);
            inputRefs.current[lastIndex]?.focus();
            return;
        }

        newOtp[index] = text;
        setOtp(newOtp);

        // Auto-focus next input
        if (text && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyPress = (e: any, index: number) => {
        // Handle backspace
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    return (
        <WebLayout onNavigate={onNavigate}>
            <View style={styles.container}>
                <View style={styles.loginCard}>
                    <Text style={styles.title}>{step === 'phone' ? 'Login / Sign up' : 'Verification Code'}</Text>

                    {step === 'phone' ? (
                        <>
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Phone Number</Text>
                                <View style={styles.phoneInputWrapper}>
                                    <View style={styles.prefixContainer}>
                                        <Text style={styles.prefixText}>+91</Text>
                                    </View>
                                    <TextInput
                                        style={styles.phoneInput}
                                        placeholder="Mobile Number"
                                        placeholderTextColor={colors.textSecondary}
                                        value={phone}
                                        onChangeText={(text) => {
                                            // Only allow numbers and max 10 digits
                                            const numeric = text.replace(/[^0-9]/g, '').slice(0, 10);
                                            setPhone(numeric);
                                        }}
                                        keyboardType="phone-pad"
                                        maxLength={10}
                                    />
                                </View>
                                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                                    Test Number: 9876543210 (OTP: 123456)
                                </Text>
                            </View>

                            <AppButton
                                title={loading ? "Sending..." : "Continue"}
                                onPress={handleSendOtp}
                                style={styles.button}
                                disabled={loading}
                            />


                        </>
                    ) : (
                        <>
                            <Text style={styles.subtitle}>
                                We have sent the verification code to <Text style={{ fontWeight: 'bold' }}>{phone}</Text>
                            </Text>

                            <View style={styles.otpContainer}>
                                {otp.map((digit, index) => (
                                    <TextInput
                                        key={index}
                                        ref={(ref) => { inputRefs.current[index] = ref; }}
                                        style={styles.otpInput}
                                        value={digit}
                                        onChangeText={(text) => handleOtpChange(text, index)}
                                        onKeyPress={(e) => handleOtpKeyPress(e, index)}
                                        keyboardType="number-pad"
                                        maxLength={6} // Allow pasting full code
                                        selectTextOnFocus
                                    />
                                ))}
                            </View>

                            <AppButton
                                title={loading ? "Verifying..." : "Verify & Continue"}
                                onPress={handleVerify}
                                style={styles.button}
                                disabled={loading}
                            />

                            <TouchableOpacity onPress={() => setStep('phone')}>
                                <Text style={{ color: colors.primary, textAlign: 'center', marginTop: spacing.m }}>Change Phone Number</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>

            {/* Location Permission Modal */}
            <Modal
                visible={showLocationModal}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.locationModal}>
                        <View style={styles.locationIconContainer}>
                            <Ionicons name="location" size={60} color={colors.primary} />
                        </View>

                        <Text style={styles.modalTitle}>Enable Location Services</Text>
                        <Text style={styles.modalText}>
                            We need your location to show you the best services available in your area
                        </Text>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.primaryButton]}
                                onPress={requestLocation}
                                disabled={locationLoading}
                            >
                                {locationLoading ? (
                                    <ActivityIndicator color={colors.white} />
                                ) : (
                                    <>
                                        <Ionicons name="locate" size={20} color={colors.white} />
                                        <Text style={styles.primaryButtonText}>Allow Location</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.secondaryButton]}
                                onPress={skipLocation}
                                disabled={locationLoading}
                            >
                                <Text style={styles.secondaryButtonText}>Skip for Now</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </WebLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.xxl,
        backgroundColor: colors.surface,
    },
    loginCard: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: colors.white,
        borderRadius: borderRadius.l,
        padding: spacing.xl,
        ...shadows.medium,
        borderWidth: 1,
        borderColor: colors.border,
    },
    title: {
        ...typography.h2,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    subtitle: {
        ...typography.body,
        textAlign: 'center',
        marginBottom: spacing.l,
        color: colors.textSecondary,
    },
    inputContainer: {
        marginBottom: spacing.l,
    },
    label: {
        ...typography.caption,
        fontWeight: '600',
        marginBottom: spacing.s,
        textTransform: 'uppercase',
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.m,
        padding: spacing.m,
        fontSize: 16,
        width: '100%',
    },
    phoneInputWrapper: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.m,
        overflow: 'hidden',
    },
    prefixContainer: {
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.m,
        justifyContent: 'center',
        borderRightWidth: 1,
        borderRightColor: colors.border,
    },
    prefixText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    phoneInput: {
        flex: 1,
        padding: spacing.m,
        fontSize: 16,
        color: colors.text,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.m,
        marginBottom: spacing.l,
    },
    otpInput: {
        width: 50,
        height: 50,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.m,
        textAlign: 'center',
        fontSize: 20,
    },
    button: {
        marginBottom: spacing.l,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.l,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    orText: {
        marginHorizontal: spacing.m,
        ...typography.caption,
    },
    socialButton: {
        marginBottom: spacing.m,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    locationModal: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        padding: spacing.xxl,
        maxWidth: 400,
        width: '100%',
        alignItems: 'center',
        ...shadows.large,
    },
    locationIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.l,
    },
    modalTitle: {
        ...typography.h2,
        fontSize: 24,
        textAlign: 'center',
        marginBottom: spacing.m,
    },
    modalText: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: 22,
    },
    modalButtons: {
        width: '100%',
        gap: spacing.m,
    },
    modalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.m,
        paddingHorizontal: spacing.l,
        borderRadius: borderRadius.m,
        gap: spacing.s,
    },
    primaryButton: {
        backgroundColor: colors.primary,
    },
    primaryButtonText: {
        ...typography.bodyBold,
        color: colors.white,
        fontSize: 16,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border,
    },
    secondaryButtonText: {
        ...typography.bodyBold,
        color: colors.text,
        fontSize: 16,
    },
});
