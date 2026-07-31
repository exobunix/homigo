import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/auth/AuthContext';
import { SocketProvider } from './src/context/SocketContext';
import { NotificationBanner } from './src/components/NotificationBanner';
import { AppNavigator } from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SocketProvider>
          <StatusBar style="light" translucent={false} />
          <AppNavigator />
          <NotificationBanner />
        </SocketProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
