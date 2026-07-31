import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, useWindowDimensions, Platform, ScrollView, Alert, Image } from 'react-native';
import { Card, Title, Text, TextInput, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { useAppDispatch, useAppSelector } from '@/store';
import { loginWithPasswordAuth } from '@/store/slices/authSlice';

const { width, height } = Dimensions.get('window');

export default function LoginFormScreen({ navigation }: any) {
  const { width: windowWidth } = useWindowDimensions();
  const isLargeScreen = Platform.OS === 'web' && windowWidth >= 900;

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const handleLogin = async () => {
    if (phone.length < 10 || password.length < 6 || isLoading) {
      return;
    }

    const action = await dispatch(
      loginWithPasswordAuth({ phone, password })
    );

    if (loginWithPasswordAuth.fulfilled.match(action)) {
      console.log('✅ Login successful');
    }
  };

  const handleSignup = () => {
    // Go to vendor registration flow
    navigation.navigate('VendorSignup');
  };

  const handleForgotPassword = () => {
    if (isLoading) {
      return;
    }
    if (phone.length < 10) {
      Alert.alert('Enter mobile number', 'Please enter your 10-digit mobile number to reset password.');
      return;
    }
    navigation.navigate('OTPVerification', { phone, mode: 'reset' });
  };

  const isFormValid = phone.length >= 10 && password.length >= 6;
  const loginError = (error as any)?.message ?? null;

  const renderForm = () => (
    <>
        {/* Login Form Card */}
        <Card style={styles.formCard} elevation={2}>
          <Card.Content style={styles.cardContent}>
            {/* Phone Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <View style={[styles.inputContainer, phoneFocused && styles.inputContainerFocused]}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryText}>🇮🇳 +91</Text>
                </View>
                <TextInput
                  mode="flat"
                  value={phone}
                  onChangeText={setPhone}
                  onFocus={() => setPhoneFocused(true)}
                  onBlur={() => setPhoneFocused(false)}
                  keyboardType="phone-pad"
                  maxLength={10}
                  placeholder="Enter mobile number"
                  style={styles.textInput}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  contentStyle={styles.inputContent}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.inputContainer, passwordFocused && styles.inputContainerFocused]}>
                <TextInput
                  mode="flat"
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  secureTextEntry={!showPassword}
                  placeholder="Enter password"
                  style={styles.passwordInput}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  contentStyle={styles.inputContent}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialCommunityIcons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#64748b" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                isFormValid && styles.loginButtonActive
              ]}
              onPress={handleLogin}
              disabled={!isFormValid || isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isFormValid ? ['#8B80F8', '#A599FF'] : ['#e2e8f0', '#cbd5e1']}
                style={styles.buttonGradient}
              >
                <Text style={[
                  styles.buttonText,
                  isFormValid && styles.buttonTextActive
                ]}>
                  Sign In
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {loginError && (
              <Text style={styles.errorText}>
                {loginError}
              </Text>
            )}

            {/* Forgot Password */}
            <View style={styles.forgotRowWrapper}>
              <TouchableOpacity style={styles.forgotButton} onPress={handleForgotPassword}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Signup Section */}
            <View style={styles.signupSection}>
              <Text style={styles.signupText}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={handleSignup} style={styles.signupButton}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>
    </>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#ffffff', '#f8fafc']} style={styles.background} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          Platform.OS === 'web' && styles.scrollContentWeb,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.outerContent,
            Platform.OS === 'web' && styles.outerContentWeb,
          ]}
        >
          <View style={[styles.content, isLargeScreen && styles.contentLarge]}>
        {isLargeScreen ? (
          <View style={styles.webRow}>
            <View style={styles.webLeft}>
              <View style={styles.webIllustrationCard}>
                <Image
                  source={{ uri: 'https://res.cloudinary.com/dosplgqif/image/upload/v1763558583/l1_mbc3fo.jpg' }}
                  style={styles.webIllustrationImage}
                  resizeMode="cover"
                />
              </View>
            </View>
            <View style={styles.webRight}>
              <View style={styles.webRightInner}>
                <View style={styles.webHeaderText}>
                  <Title style={[styles.title, styles.webTitle]}>Welcome Back</Title>
                  <Text style={[styles.subtitle, styles.webSubtitle]}>Sign in to your vendor account</Text>
                </View>
                {renderForm()}
              </View>
            </View>
          </View>
        ) : (
          <>
        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.illustrationContainer}>
            <Video
              source={{ uri: 'https://res.cloudinary.com/dosplgqif/video/upload/v1763203831/userlogin_y9br8d.mp4' }}
              style={[styles.loginVideo, isLargeScreen && styles.loginVideoLarge]}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isLooping
              isMuted
            />
          </View>
          
          <Title style={styles.title}>Welcome Back</Title>
          <Text style={styles.subtitle}>Sign in to your vendor account</Text>
        </View>

        {renderForm()}
          </>
        )}
          </View>
        </View>
      </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  scrollContentWeb: {
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  outerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  outerContentWeb: {
    justifyContent: 'flex-start',
    paddingVertical: 0,
  },
  content: {
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
  },
  contentLarge: {
    maxWidth: 960,
  },
  webRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 10,
  },
  webLeft: {
    flex: 1.6,
    backgroundColor: '#f1f5f9',
  },
  webRight: {
    flex: 0.8,
    paddingVertical: 40,
    paddingHorizontal: 40,
    backgroundColor: '#ffffff',
  },
  webRightInner: {
    maxWidth: 420,
    alignSelf: 'center',
  },
  webIllustrationCard: {
    flex: 1,
    overflow: 'hidden',
  },
  webIllustrationImage: {
    width: '100%',
    height: '100%',
  },
  webHeaderText: {
    marginBottom: 24,
    alignItems: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  illustrationContainer: {
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 4,
    elevation: 1,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  loginVideo: {
    width: 250,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  loginVideoLarge: {
    width: 340,
    height: 240,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  webTitle: {
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  webSubtitle: {
    textAlign: 'center',
  },
  formCard: {
    borderRadius: 20,
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  cardContent: {
    padding: 24,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  inputContainerFocused: {
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
  textInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 16,
  },
  passwordInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 16,
    paddingRight: 50,
  },
  inputContent: {
    fontSize: 16,
    color: '#1e293b',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  loginButtonActive: {
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
  forgotRowWrapper: {
    marginTop: 16,
    alignItems: 'flex-end',
  },
  forgotButton: {
    alignItems: 'flex-end',
  },
  forgotText: {
    fontSize: 14,
    color: '#8B80F8',
    fontWeight: '600',
  },
  signupSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingBottom: 8,
  },
  signupText: {
    fontSize: 16,
    color: '#64748b',
  },
  signupButton: {
    marginLeft: 4,
  },
  signupLink: {
    fontSize: 16,
    color: '#8B80F8',
    fontWeight: 'bold',
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
  },
});
