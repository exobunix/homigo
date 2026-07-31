import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TextInput as RNTextInput, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { Card, Title, Text, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { useAppDispatch } from '@/store';
import { verifyOTP } from '@/store/slices/authSlice';

const { width, height } = Dimensions.get('window');

export default function InteractiveOTPScreen({ navigation, route }: any) {
  const { width: windowWidth } = useWindowDimensions();
  const isLargeScreen = Platform.OS === 'web' && windowWidth >= 900;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const { phone, mode = 'signup' } = route.params || {};
  const inputRefs = useRef<(RNTextInput | null)[]>([]);
  const dispatch = useAppDispatch();
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Timer for resend button visual only
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

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

    // Simple development-only OTP check: static 123456
    if (otpString !== '123456') {
      setErrorMessage('Invalid OTP. For testing, please use 123456.');
      return;
    }

    if (isVerifying) return;

    try {
      setIsVerifying(true);
      console.log('🔍 handleVerifyOTP called with code:', otpString);
      // Call backend to create/find vendor and issue JWT (backend does not check OTP in dev mode)
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
      console.log('❌ Invalid OTP or Firebase error', error);
      const fbError: any = error;
      const message = fbError?.message || 'Invalid code. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    if (timer === 0) {
      // In development, just reset the timer and clear the code
      setOtp(['', '', '', '', '', '']);
      setErrorMessage(null);
      setTimer(30);
    }
  };

  const isComplete = otp.every(digit => digit !== '');

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#ffffff', '#f8fafc']} style={styles.background} />
      
      <View style={styles.content}>
        <View
          style={[
            styles.innerContent,
            isLargeScreen && styles.innerContentLarge,
          ]}
        >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Main Section */}
        <View style={styles.mainSection}>
          <View style={styles.illustrationContainer}>
            <Video
              source={{ uri: 'https://res.cloudinary.com/dosplgqif/video/upload/v1763209002/sign2_hixjat.mp4' }}
              style={styles.otpGif}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              isLooping
              isMuted
            />
          </View>
          
          <Title style={styles.title}>Verify Mobile</Title>
          <Text style={styles.subtitle}>
            Enter 6-digit code sent to {phone}
          </Text>
        </View>

        {/* OTP Input Card */}
        <Card
          style={[styles.otpCard, isLargeScreen && styles.otpCardLarge]}
          elevation={2}
        >
          <Card.Content
            style={[styles.cardContent, isLargeScreen && styles.cardContentLarge]}
          >
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

            <TouchableOpacity
              style={[
                styles.verifyButton,
                isComplete && styles.verifyButtonActive
              ]}
              onPress={handleVerifyOTP}
              disabled={!isComplete || isVerifying}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isComplete ? ['#8B80F8', '#A599FF'] : ['#e2e8f0', '#cbd5e1']}
                style={styles.buttonGradient}
              >
                <Text style={[
                  styles.buttonText,
                  isComplete && styles.buttonTextActive
                ]}>
                  Verify & Continue
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {errorMessage && (
              <Text style={styles.errorText}>
                {errorMessage}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Resend Section */}
        <View style={styles.resendSection}>
          <Text style={styles.resendText}>
            Didn't receive code?{' '}
            <Text
              style={[
                styles.resendLink,
                timer === 0 && styles.resendLinkActive
              ]}
              onPress={handleResend}
            >
              {timer > 0 ? `Resend in ${timer}s` : 'Resend'}
            </Text>
          </Text>
        </View>
        </View>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressDot} />
        <View style={[styles.progressDot, styles.activeDot]} />
        <View style={styles.progressDot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  innerContent: {
    flex: 1,
  },
  innerContentLarge: {
    maxWidth: 480,
    alignSelf: 'center',
  },
  header: {
    marginBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  mainSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  illustrationContainer: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpGif: {
    width: 230,
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  otpCard: {
    borderRadius: 20,
    backgroundColor: '#ffffff',
    marginBottom: 30,
  },
  cardContent: {
    padding: 24,
  },
  otpCardLarge: {
    borderRadius: 24,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  cardContentLarge: {
    paddingHorizontal: 32,
    paddingVertical: 28,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  otpInputWrapper: {
    width: 45,
    height: 55,
  },
  otpInput: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  otpInputFilled: {
    borderColor: '#8B80F8',
    backgroundColor: '#f0f4ff',
  },
  verifyButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  verifyButtonActive: {
    elevation: 4,
    shadowColor: '#8B80F8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  buttonTextActive: {
    color: '#ffffff',
  },
  resendSection: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#64748b',
  },
  resendLink: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  resendLinkActive: {
    color: '#8B80F8',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 30,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
  },
  activeDot: {
    backgroundColor: '#8B80F8',
    width: 24,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
  },
});
