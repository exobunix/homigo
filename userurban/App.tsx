import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';

import { CartProvider } from './src/context/CartContext';
import { LocationProvider } from './src/context/LocationContext';

import { ThemeProvider } from './src/context/ThemeContext';

import { NotificationProvider } from './src/context/NotificationContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LocationProvider>
          <CartProvider>
            <StatusBar style="auto" />
            <NotificationProvider>
              <AppNavigator />
            </NotificationProvider>
          </CartProvider>
        </LocationProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
