import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';

// Store
import { store } from './src/store';

// Navigation
import RootNavigator from './src/navigation/RootNavigator';

// Services
import SocketService from './src/services/SocketService';
import LocationService from './src/services/LocationService';
import NotificationService from './src/services/NotificationService';

// Theme
import { theme } from './src/theme/theme';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Deep linking / web URL config so browser back/forward works between auth and app screens
const linking: any = {
  prefixes: [Linking.createURL('/')],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
          VendorSignup: 'signup',
        },
      },
      App: {
        screens: {
          MainTabs: {
            screens: {
              Home: 'home',
              Bookings: 'bookings',
              Earnings: 'earnings',
              Services: 'services',
              Profile: 'profile',
            },
          },
        },
      },
    },
  },
};

// Ignore specific warnings for development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'VirtualizedLists should never be nested',
]);

export default function App() {
  useEffect(() => {
    // Initialize services
    const initializeServices = async () => {
      try {
        // Initialize notification service
        await NotificationService.initialize();

        // Initialize location service
        await LocationService.initialize();

        // Initialize socket service (will connect when user logs in)
        SocketService.initialize();

        console.log('✅ All services initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize services:', error);
      }
    };

    initializeServices();

    // Cleanup on unmount
    return () => {
      SocketService.disconnect();
      LocationService.cleanup();
      NotificationService.cleanup();
    };
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={theme}>
          <SafeAreaProvider>
            <NavigationContainer linking={linking}>
              <StatusBar
                style="dark"
                backgroundColor="#000000ff"
                translucent={false}
              />
              <RootNavigator />
            </NavigationContainer>
          </SafeAreaProvider>
        </PaperProvider>
      </QueryClientProvider>
    </Provider>
  );
}
