import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAppDispatch, useAppSelector } from '@/store';
import { loadUserFromStorage } from '@/store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Navigation
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

// Components
import LoadingScreen from '@/components/LoadingScreen';
import BookingRequestModal from '@/components/BookingRequestModal';
import PendingApprovalScreen from '@/screens/app/PendingApprovalScreen';

// Types
import { RootStackParamList } from '@/types';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { isRequestVisible } = useAppSelector((state) => state.booking);

  useEffect(() => {
    // Try to load user from storage on app start
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  // Connect socket for real-time updates (Global)
  useEffect(() => {
    const connectSocket = async () => {
      try {
        if (isAuthenticated && user?.id) {
          const token = await AsyncStorage.getItem('vendorToken');
          if (token) {
            console.log('🔌 RootNavigator: Connecting socket...', user.id);
            // Import dynamically to avoid circular dependencies if any
            const SocketService = require('@/services/SocketService').default;
            SocketService.connect(user.id, token);
          }
        }
      } catch (error) {
        console.error('❌ RootNavigator: Socket connection error:', error);
      }
    };

    connectSocket();
  }, [isAuthenticated, user?.id]);

  // Check if vendor is verified
  const isVendorVerified = user?.isVerified !== false;

  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : !isVendorVerified ? (
          <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
        ) : (
          <Stack.Screen name="App" component={AppNavigator} />
        )}
      </Stack.Navigator>

      {/* Global Booking Request Modal */}
      {isRequestVisible && <BookingRequestModal />}
    </>
  );
}
