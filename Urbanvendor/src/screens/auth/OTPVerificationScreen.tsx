import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Text, TextInput, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppDispatch, useAppSelector } from '@/store';
import { loginWithPhone, verifyOTP } from '@/store/slices/authSlice';

export default function OTPVerificationScreen({ navigation, route }: any) {
  const [otp, setOtp] = useState('');
  const { phone } = route.params;
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;

    const action = await dispatch(verifyOTP({ phone, otp }));

    if (verifyOTP.fulfilled.match(action)) {
      navigation.navigate('ProfileSetup', { phone });
    }
  };

  return (
    <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Verify OTP</Title>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to {phone}
            </Text>
            
            <TextInput
              label="Enter OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              style={styles.input}
            />
            
            <Button
              mode="contained"
              onPress={handleVerifyOTP}
              style={styles.button}
              disabled={otp.length !== 6 || isLoading}
              loading={isLoading}
            >
              Verify OTP
            </Button>
            
            <Button
              mode="text"
              onPress={() => dispatch(loginWithPhone({ phone }))}
              style={styles.resendButton}
              disabled={isLoading}
            >
              Resend OTP
            </Button>
          </Card.Content>
        </Card>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    elevation: 8,
    borderRadius: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#64748b',
  },
  input: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8,
  },
  button: {
    paddingVertical: 8,
    marginBottom: 16,
  },
  resendButton: {
    // Additional styling if needed
  },
});
