import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Animated, Easing, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/ui/AppButton';
import { AppInput } from '../../components/ui/AppInput';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const Login = ({ navigation }: any) => {
    const { colors, isDark } = useTheme();
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(50));

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                easing: Easing.out(Easing.exp),
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleSendOTP = async () => {
        if (phone.length < 10) {
            Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number');
            return;
        }

        setLoading(true);
        try {
            // Generate random 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            // Store OTP in AsyncStorage for verification
            await AsyncStorage.setItem(`otp_${phone}`, otp);

            // Format phone number with country code
            const formattedPhone = `+91${phone}`;

            console.log('🔐 Generated OTP:', otp, 'for phone:', formattedPhone);

            // Show OTP to user (in production, this would be sent via SMS)
            Alert.alert(
                'OTP Generated!',
                `Your OTP is: ${otp}\n\n(In production, this would be sent via SMS)`,
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('OTPScreen', { phoneNumber: formattedPhone, generatedOTP: otp })
                    }
                ]
            );
        } catch (error: any) {
            console.error('Send OTP error:', error);
            Alert.alert('Error', error.message || 'Failed to generate OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <View style={{ width: 24 }} />
                    <TouchableOpacity onPress={() => navigation.navigate('MainTabs')}>
                        <Text style={[styles.skipText, { color: colors.primary }]}>Skip</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Animated.View style={[styles.illustrationContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <Image
                            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2942/2942259.png' }}
                            style={styles.illustration}
                            resizeMode="contain"
                        />
                        <Text style={[styles.welcomeText, { color: colors.text }]}>Welcome Back!</Text>
                        <Text style={[styles.welcomeSubText, { color: colors.textSecondary }]}>Login to continue booking expert services</Text>
                    </Animated.View>

                    <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }], backgroundColor: isDark ? colors.surface : colors.white }]}>
                        <Text style={[styles.label, { color: colors.text }]}>Mobile Number</Text>
                        <AppInput
                            placeholder="98765 43210"
                            keyboardType="phone-pad"
                            value={phone}
                            onChangeText={setPhone}
                            maxLength={10}
                            leftIcon={<Ionicons name="call-outline" size={20} color={colors.textSecondary} />}
                            style={styles.input}
                            editable={!loading}
                        />

                        <AppButton
                            title={loading ? "Sending OTP..." : "Get OTP"}
                            onPress={handleSendOTP}
                            style={styles.loginButton}
                            disabled={phone.length < 10 || loading}
                            icon={loading ? <ActivityIndicator color="#fff" size="small" /> : undefined}
                        />

                        <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                            By continuing, you agree to our <Text style={[styles.linkText, { color: colors.primary }]}>Terms</Text> & <Text style={[styles.linkText, { color: colors.primary }]}>Privacy Policy</Text>
                        </Text>
                    </Animated.View>

                    {/* reCAPTCHA container for Firebase */}
                    <View id="recaptcha-container" style={{ height: 0, width: 0, opacity: 0 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: spacing.m,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    skipText: {
        ...typography.bodyBold,
    },
    scrollContent: {
        flexGrow: 1,
        padding: spacing.m,
    },
    illustrationContainer: {
        alignItems: 'center',
        marginBottom: spacing.xl,
        marginTop: spacing.l,
    },
    illustration: {
        width: 180,
        height: 180,
        marginBottom: spacing.l,
    },
    welcomeText: {
        ...typography.h1,
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    welcomeSubText: {
        ...typography.body,
        textAlign: 'center',
        marginBottom: spacing.m,
    },
    formContainer: {
        padding: spacing.l,
        borderRadius: borderRadius.l,
        ...shadows.medium,
    },
    label: {
        ...typography.caption,
        fontWeight: '600',
        marginBottom: spacing.s,
        textTransform: 'uppercase',
    },
    input: {
        backgroundColor: 'transparent',
    },
    loginButton: {
        marginTop: spacing.m,
        marginBottom: spacing.l,
    },
    termsText: {
        ...typography.caption,
        textAlign: 'center',
        lineHeight: 20,
    },
    linkText: {
        fontWeight: '600',
    },
});
