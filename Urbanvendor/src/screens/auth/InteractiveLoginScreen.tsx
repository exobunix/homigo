import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { Card, Title, Text, TextInput, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';

const { width, height } = Dimensions.get('window');

export default function InteractiveLoginScreen({ navigation }: any) {
  const { width: windowWidth } = useWindowDimensions();
  const isLargeScreen = Platform.OS === 'web' && windowWidth >= 900;

  const [phone, setPhone] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSendOTP = async () => {
    if (phone.length < 10) return;

    // Firebase OTP will be sent from OTP screen; just navigate with phone
    navigation.navigate('OTPVerification', { phone, mode: 'signup' });
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <LinearGradient colors={['#ffffff', '#f8fafc']} style={styles.background} />
      
      {/* Main Content */}
      <View style={styles.outerContent}>
        <View style={[styles.content, isLargeScreen && styles.contentLarge]}>
        {/* Header Illustration */}
        <View style={styles.headerSection}>
          <View style={styles.illustrationContainer}>
            <Video
              source={{ uri: 'https://res.cloudinary.com/dosplgqif/video/upload/v1763208854/sign1_szjtmx.mp4' }}
              style={styles.vendorVideo}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              isLooping
              isMuted
            />
          </View>
          
          <Title style={styles.title}>Join as Vendor</Title>
          <Text style={styles.subtitle}>Start earning with your skills</Text>
        </View>

        {/* Input Card */}
        <Card style={styles.inputCard} elevation={2}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.inputLabel}>Mobile Number</Text>
            
            <View style={[styles.phoneContainer, focused && styles.phoneContainerFocused]}>
              <View style={styles.countryCode}>
                <Text style={styles.countryText}>🇮🇳 +91</Text>
              </View>
              <TextInput
                mode="flat"
                value={phone}
                onChangeText={setPhone}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                keyboardType="phone-pad"
                maxLength={10}
                placeholder="Enter mobile number"
                style={styles.phoneInput}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                contentStyle={styles.inputContent}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.continueButton,
                phone.length >= 10 && styles.continueButtonActive
              ]}
              onPress={handleSendOTP}
              disabled={phone.length < 10}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={phone.length >= 10 ? ['#8B80F8', '#A599FF'] : ['#e2e8f0', '#cbd5e1']}
                style={styles.buttonGradient}
              >
                <Text style={[
                  styles.buttonText,
                  phone.length >= 10 && styles.buttonTextActive
                ]}>
                  Continue
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {/* Benefits */}
        <View style={styles.benefitsSection}>
          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <MaterialCommunityIcons name="lightning-bolt" size={16} color="#8B80F8" />
            </View>
            <Text style={styles.benefitText}>Instant job alerts</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <MaterialCommunityIcons name="wallet" size={16} color="#8B80F8" />
            </View>
            <Text style={styles.benefitText}>Secure payments</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <MaterialCommunityIcons name="star" size={16} color="#8B80F8" />
            </View>
            <Text style={styles.benefitText}>Build reputation</Text>
          </View>
        </View>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressDot, styles.activeDot]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>
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
  outerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  content: {
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  contentLarge: {
    maxWidth: 480,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  illustrationContainer: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorVideo: {
    width: 320,
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  inputCard: {
    borderRadius: 20,
    backgroundColor: '#ffffff',
    marginBottom: 40,
  },
  cardContent: {
    padding: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  phoneContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    marginBottom: 24,
    overflow: 'hidden',
  },
  phoneContainerFocused: {
    borderColor: '#8B80F8',
    backgroundColor: '#f0f4ff',
  },
  countryCode: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
  },
  countryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 16,
  },
  inputContent: {
    fontSize: 16,
    color: '#1e293b',
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  continueButtonActive: {
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
  benefitsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  benefitItem: {
    alignItems: 'center',
    flex: 1,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f4ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
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
});
