import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Text, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppDispatch } from '@/store';
import { setUser } from '@/store/slices/authSlice';

export default function OnboardingCompleteScreen({ navigation }: any) {
  const dispatch = useAppDispatch();

  const handleGetStarted = () => {
    // Create a complete demo vendor user
    const demoUser = {
      id: '1',
      name: 'Yogesh Thakur',
      email: 'yogesh@urbanvendor.com',
      phone: '+91 9876543210',
      profileImage: undefined,
      isOnline: false,
      rating: 4.8,
      totalJobs: 156,
      joinDate: new Date().toISOString(),
      services: [
        {
          id: '1',
          name: 'Plumbing',
          icon: '🔧',
          basePrice: 500,
          variants: [],
          isActive: true,
        },
        {
          id: '2',
          name: 'Electrical',
          icon: '⚡',
          basePrice: 400,
          variants: [],
          isActive: true,
        },
      ],
      workingHours: {
        monday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
        tuesday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
        wednesday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
        thursday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
        friday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
        saturday: { isWorking: true, startTime: '10:00', endTime: '16:00' },
        sunday: { isWorking: false, startTime: '00:00', endTime: '00:00' },
      },
      location: {
        latitude: 19.0760,
        longitude: 72.8777,
        address: '123 Main Street, Andheri West',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
      },
      kyc: {
        aadharNumber: '1234-5678-9012',
        aadharFront: '',
        aadharBack: '',
        panNumber: 'ABCDE1234F',
        panImage: '',
        certificates: [],
        isVerified: true,
        verificationDate: new Date().toISOString(),
      },
      bankDetails: {
        accountNumber: '1234567890',
        ifscCode: 'HDFC0001234',
        accountHolderName: 'Yogesh Thakur',
        bankName: 'HDFC Bank',
        isVerified: true,
      },
      workingRadius: 10,
      experience: 5,
      isVerified: true,
      earnings: {
        totalEarnings: 125000,
        todayEarnings: 1250,
        weekEarnings: 8500,
        monthEarnings: 32000,
        pendingAmount: 2500,
        lastPayoutDate: new Date().toISOString(),
      },
    };

    // Set user as authenticated - this will trigger navigation to main app
    dispatch(setUser(demoUser));
    console.log('✅ Onboarding completed! User authenticated:', demoUser.name);
  };

  return (
    <LinearGradient colors={['#10b981', '#059669']} style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>🎉 Welcome to UrbanVendor!</Title>
            <Text style={styles.subtitle}>
              Your account is ready. Start receiving bookings now!
            </Text>
            
            <Button
              mode="contained"
              onPress={handleGetStarted}
              style={styles.button}
            >
              Get Started
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
    marginBottom: 16,
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#64748b',
    lineHeight: 22,
  },
  button: {
    paddingVertical: 8,
  },
});
