import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from '@/types';

// Auth Screens
import LoginFormScreen from '@/screens/auth/LoginFormScreen';
import InteractiveLoginScreen from '@/screens/auth/InteractiveLoginScreen';
import InteractiveOTPScreen from '@/screens/auth/InteractiveOTPScreen';
import ResetPasswordScreenNative from '@/screens/auth/ResetPasswordScreen';
import ResetPasswordWeb from '@/screens/auth/ResetPasswordWeb';
import { Platform } from 'react-native';

const ResetPasswordScreen = Platform.OS === 'web' ? ResetPasswordWeb : ResetPasswordScreenNative;
import ProfileSetupScreen from '@/screens/auth/ProfileSetupScreen';
import KYCUploadScreen from '@/screens/auth/KYCUploadScreen';
import InteractiveServiceScreen from '@/screens/auth/InteractiveServiceScreen';
import BankDetailsScreen from '@/screens/auth/BankDetailsScreen';
import WorkingHoursScreen from '@/screens/auth/WorkingHoursScreen';
import InteractiveCompleteScreen from '@/screens/auth/InteractiveCompleteScreen';

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#ffffff' }
      }}
    >
      <Stack.Screen name="Login" component={LoginFormScreen} />
      <Stack.Screen name="VendorSignup" component={InteractiveLoginScreen} />
      <Stack.Screen name="OTPVerification" component={InteractiveOTPScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="KYCUpload" component={KYCUploadScreen} />
      <Stack.Screen name="ServiceSelection" component={InteractiveServiceScreen} />
      <Stack.Screen name="BankDetails" component={BankDetailsScreen} />
      <Stack.Screen name="WorkingHours" component={WorkingHoursScreen} />
      <Stack.Screen name="OnboardingComplete" component={InteractiveCompleteScreen} />
    </Stack.Navigator>
  );
}
