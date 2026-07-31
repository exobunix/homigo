import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Card, Title, Text, Button, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppDispatch } from '@/store';
import { setUser } from '@/store/slices/authSlice';

const { width, height } = Dimensions.get('window');

export default function ModernOnboardingCompleteScreen({ navigation }: any) {
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
    <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Success Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.successCircle}>
            <LinearGradient 
              colors={['#ffffff', '#f8fafc']} 
              style={styles.innerCircle}
            >
              <MaterialCommunityIcons name="check" size={80} color="#10b981" />
            </LinearGradient>
          </View>
          
          {/* Floating Success Elements */}
          <View style={[styles.floatingElement, styles.element1]}>
            <Text style={styles.floatingText}>🎉</Text>
          </View>
          <View style={[styles.floatingElement, styles.element2]}>
            <Text style={styles.floatingText}>✨</Text>
          </View>
          <View style={[styles.floatingElement, styles.element3]}>
            <Text style={styles.floatingText}>🚀</Text>
          </View>
          <View style={[styles.floatingElement, styles.element4]}>
            <Text style={styles.floatingText}>💼</Text>
          </View>
        </View>

        {/* Main Content Card */}
        <Surface style={styles.mainCard} elevation={4}>
          <View style={styles.cardContent}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <Title style={styles.mainTitle}>You are ready to go!</Title>
              <Text style={styles.subtitle}>
                Thanks for your time. Your account has been created successfully. 
                Now you can start receiving bookings and grow your business with UrbanVendor.
              </Text>
            </View>

            {/* Features List */}
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <MaterialCommunityIcons name="lightning-bolt" size={20} color="#f59e0b" />
                </View>
                <Text style={styles.featureText}>Instant booking notifications</Text>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <MaterialCommunityIcons name="wallet" size={20} color="#10b981" />
                </View>
                <Text style={styles.featureText}>Secure payments & earnings</Text>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <MaterialCommunityIcons name="star" size={20} color="#f59e0b" />
                </View>
                <Text style={styles.featureText}>Build your reputation</Text>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <MaterialCommunityIcons name="chart-line" size={20} color="#6366f1" />
                </View>
                <Text style={styles.featureText}>Track your business growth</Text>
              </View>
            </View>

            {/* Action Button */}
            <LinearGradient 
              colors={['#6366f1', '#8b5cf6']} 
              style={styles.buttonGradient}
            >
              <Button
                mode="contained"
                onPress={handleGetStarted}
                style={styles.actionButton}
                buttonColor="transparent"
                textColor="#ffffff"
                labelStyle={styles.buttonLabel}
              >
                Get Started
              </Button>
            </LinearGradient>
          </View>
        </Surface>

        {/* Bottom Navigation Dots */}
        <View style={styles.navigationDots}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  illustrationContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    width: '100%',
    marginBottom: 40,
  },
  successCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#ffffff20',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  innerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingElement: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff20',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  element1: {
    top: 20,
    right: 40,
  },
  element2: {
    bottom: 30,
    left: 30,
  },
  element3: {
    top: 60,
    left: 10,
  },
  element4: {
    bottom: 60,
    right: 20,
  },
  floatingText: {
    fontSize: 20,
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  featuresList: {
    marginBottom: 40,
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },
  buttonGradient: {
    borderRadius: 16,
    elevation: 6,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  actionButton: {
    paddingVertical: 12,
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
    backgroundColor: '#ffffff40',
  },
  activeDot: {
    backgroundColor: '#ffffff',
    width: 24,
  },
});
