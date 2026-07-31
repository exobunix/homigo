import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Image, useWindowDimensions, Platform } from 'react-native';
import { Card, Title, Text, TextInput, Button, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function ModernLoginScreen({ navigation }: any) {
  const { width: windowWidth } = useWindowDimensions();
  const isLargeScreen = Platform.OS === 'web' && windowWidth >= 900;

  const [phone, setPhone] = useState('');

  const handleSendOTP = () => {
    if (phone.length >= 10) {
      navigation.navigate('OTPVerification', { phone });
    }
  };

  return (
    <LinearGradient colors={['#f8fafc', '#e2e8f0']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with Illustration */}
        <View style={styles.header}>
          <View style={styles.illustrationContainer}>
            <LinearGradient 
              colors={['#8B80F8', '#A599FF']} 
              style={styles.illustrationCircle}
            >
              <MaterialCommunityIcons name="account-hard-hat" size={60} color="#ffffff" />
            </LinearGradient>
            
            {/* Floating Elements */}
            <View style={[styles.floatingElement, styles.element1]}>
              <MaterialCommunityIcons name="tools" size={20} color="#8B80F8" />
            </View>
            <View style={[styles.floatingElement, styles.element2]}>
              <MaterialCommunityIcons name="lightning-bolt" size={16} color="#8B80F8" />
            </View>
            <View style={[styles.floatingElement, styles.element3]}>
              <MaterialCommunityIcons name="wrench" size={18} color="#8B80F8" />
            </View>
          </View>
        </View>

        {/* Main Content Card */}
        <View style={[styles.mainWrapper, isLargeScreen && styles.mainWrapperLarge]}>
          <Surface style={[styles.mainCard, isLargeScreen && styles.mainCardLarge]} elevation={4}>
            <View style={styles.cardContent}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <Title style={styles.mainTitle}>Vendor Registration</Title>
              <Text style={styles.subtitle}>
                A series of screens that guide users through the app's interface and functions.
              </Text>
            </View>

            {/* Phone Input Section */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Do you want to turn on notifications?</Text>
              
              <View style={styles.phoneInputContainer}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                </View>
                <TextInput
                  mode="flat"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={styles.phoneInput}
                  contentStyle={styles.phoneInputContent}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  placeholder="Enter mobile number"
                />
              </View>

              {/* Features List */}
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#10b981" />
                  <Text style={styles.featureText}>New order instant alerts</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#10b981" />
                  <Text style={styles.featureText}>Promotional rewards</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#10b981" />
                  <Text style={styles.featureText}>Promotional rewards</Text>
                </View>
              </View>
            </View>

            {/* Action Button */}
            <LinearGradient 
              colors={['#8B80F8', '#A599FF']} 
              style={styles.buttonGradient}
            >
              <Button
                mode="contained"
                onPress={handleSendOTP}
                disabled={phone.length < 10}
                style={styles.actionButton}
                buttonColor="transparent"
                textColor="#ffffff"
                labelStyle={styles.buttonLabel}
              >
                Next
              </Button>
            </LinearGradient>
          </View>
        </Surface>
        </View>

        {/* Bottom Navigation Dots */}
        <View style={styles.navigationDots}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  illustrationContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    height: 160,
    width: 160,
  },
  illustrationCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  floatingElement: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  element1: {
    top: 20,
    right: 10,
  },
  element2: {
    bottom: 30,
    left: 0,
  },
  element3: {
    top: 60,
    left: -10,
  },
  mainCard: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    marginBottom: 30,
  },
  mainWrapper: {
    width: '100%',
  },
  mainWrapperLarge: {
    maxWidth: 520,
    alignSelf: 'center',
  },
  mainCardLarge: {
    borderRadius: 24,
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
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  inputSection: {
    marginBottom: 40,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 24,
    textAlign: 'center',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 4,
  },
  countryCode: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 16,
  },
  phoneInputContent: {
    fontSize: 16,
    color: '#1e293b',
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '500',
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
    backgroundColor: '#8B80F8',
    width: 24,
  },
});
