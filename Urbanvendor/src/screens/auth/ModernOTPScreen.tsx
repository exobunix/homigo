import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TextInput as RNTextInput } from 'react-native';
import { Card, Title, Text, Button, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function ModernOTPScreen({ navigation, route }: any) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const { phone } = route.params;
  const inputRefs = useRef<(RNTextInput | null)[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = () => {
    const otpString = otp.join('');
    if (otpString.length === 6) {
      navigation.navigate('ProfileSetup');
    }
  };

  const isComplete = otp.every(digit => digit !== '');

  return (
    <LinearGradient colors={['#f8fafc', '#e2e8f0']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            textColor="#64748b"
          >
            <MaterialCommunityIcons name="arrow-left" size={24} />
          </Button>
        </View>

        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <LinearGradient 
            colors={['#6366f1', '#8b5cf6']} 
            style={styles.illustrationCircle}
          >
            <MaterialCommunityIcons name="message-text" size={50} color="#ffffff" />
          </LinearGradient>
          
          {/* Floating Elements */}
          <View style={[styles.floatingElement, styles.element1]}>
            <Text style={styles.floatingText}>📱</Text>
          </View>
          <View style={[styles.floatingElement, styles.element2]}>
            <Text style={styles.floatingText}>✨</Text>
          </View>
        </View>

        {/* Main Content Card */}
        <Surface style={styles.mainCard} elevation={4}>
          <View style={styles.cardContent}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <Title style={styles.mainTitle}>Verify your number</Title>
              <Text style={styles.subtitle}>
                We've sent a 6-digit verification code to
              </Text>
              <Text style={styles.phoneNumber}>{phone}</Text>
            </View>

            {/* OTP Input Section */}
            <View style={styles.otpSection}>
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <View key={index} style={styles.otpInputWrapper}>
                    <RNTextInput
                      ref={(ref) => inputRefs.current[index] = ref}
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

              {/* Timer and Resend */}
              <View style={styles.timerSection}>
                <Text style={styles.timerText}>
                  Didn't receive the code? 
                  <Text style={styles.resendText}> Resend (0:30)</Text>
                </Text>
              </View>
            </View>

            {/* Action Button */}
            <LinearGradient 
              colors={isComplete ? ['#6366f1', '#8b5cf6'] : ['#e2e8f0', '#cbd5e1']} 
              style={styles.buttonGradient}
            >
              <Button
                mode="contained"
                onPress={handleVerifyOTP}
                disabled={!isComplete}
                style={styles.actionButton}
                buttonColor="transparent"
                textColor={isComplete ? "#ffffff" : "#94a3b8"}
                labelStyle={styles.buttonLabel}
              >
                Continue
              </Button>
            </LinearGradient>
          </View>
        </Surface>

        {/* Bottom Navigation Dots */}
        <View style={styles.navigationDots}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  illustrationContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
    width: '100%',
    marginBottom: 40,
  },
  illustrationCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingElement: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  element1: {
    top: 10,
    right: 60,
  },
  element2: {
    bottom: 20,
    left: 50,
  },
  floatingText: {
    fontSize: 16,
  },
  mainCard: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    marginBottom: 30,
  },
  cardContent: {
    padding: 32,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  otpSection: {
    marginBottom: 40,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 20,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  otpInputFilled: {
    borderColor: '#6366f1',
    backgroundColor: '#f0f4ff',
  },
  timerSection: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    color: '#64748b',
  },
  resendText: {
    color: '#6366f1',
    fontWeight: '600',
  },
  buttonGradient: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  actionButton: {
    paddingVertical: 8,
    elevation: 0,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  navigationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
  },
  activeDot: {
    backgroundColor: '#6366f1',
    width: 24,
  },
});
