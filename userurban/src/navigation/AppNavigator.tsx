import React, { useState } from 'react';
import { Platform, View } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { IntroSlider } from '../screens/onboarding/IntroSlider';
import { LocationPermission } from '../screens/onboarding/LocationPermission';
import { Login } from '../screens/onboarding/Login';
import { OTPScreen } from '../screens/onboarding/OTPScreen';

import { Home } from '../screens/customer/Home';
import { CategoryScreen } from '../screens/customer/CategoryScreen';
import { BookingsScreen } from '../screens/customer/BookingsScreen';
import { RewardsScreen } from '../screens/customer/RewardsScreen';
import { ProfileScreen } from '../screens/customer/ProfileScreen';
import { VendorProfileScreen } from '../screens/customer/VendorProfileScreen';
import { ServiceDetailsScreen } from '../screens/customer/ServiceDetailsScreen';
import { HelpCenterScreen } from '../screens/customer/HelpCenterScreen';
import { CartScreen } from '../screens/customer/CartScreen';
import { TrackJobScreen } from '../screens/customer/TrackJobScreen';
import { ManageAddressesScreen } from '../screens/customer/ManageAddressesScreen';
import { SettingsPlaceholderScreen } from '../screens/customer/SettingsPlaceholderScreen';
import { PaymentMethodsScreen } from '../screens/customer/PaymentMethodsScreen';
import { NotificationsScreen } from '../screens/customer/NotificationsScreen';
import { LanguageScreen } from '../screens/customer/LanguageScreen';
import { TermsScreen } from '../screens/customer/TermsScreen';
import { PaymentScreen } from '../screens/customer/PaymentScreen';
import { SearchScreen } from '../screens/customer/SearchScreen';
import { CheckoutScreen } from '../screens/customer/CheckoutScreen';
import { MultiServiceBookingScreen } from '../screens/customer/MultiServiceBookingScreen';

import { WebHome } from '../screens/web/WebHome';
import { WebCategory } from '../screens/web/WebCategory';
import { WebBookings } from '../screens/web/WebBookings';
import { WebLogin } from '../screens/web/WebLogin';
import { WebServiceDetails } from '../screens/web/WebServiceDetails';
import { WebCart } from '../screens/web/WebCart';
import { WebCheckout } from '../screens/web/WebCheckout';
import { WebProfile } from '../screens/web/WebProfile';
import { WebMultiServiceBooking } from '../screens/web/WebMultiServiceBooking';
import { WebStaticPage } from '../screens/web/WebStaticPage';
import { WebLayout } from '../screens/web/WebLayout';
import { WebBookingDetail } from '../screens/web/WebBookingDetail';

import { useTheme } from '../context/ThemeContext';
import { checkAuth } from '../services/api';
import { useLocation } from '../context/LocationContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Mobile Bottom Tabs
const MainTabs = () => {
    const { colors, isDark } = useTheme();
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: any;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Bookings') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'Rewards') {
                        iconName = focused ? 'gift' : 'gift-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: isDark ? colors.surface : colors.white,
                    borderTopColor: colors.border,
                }
            })}
        >
            <Tab.Screen name="Home" component={Home} />
            <Tab.Screen name="Bookings" component={BookingsScreen} />
            <Tab.Screen name="Rewards" component={RewardsScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

// Mobile Stack
const MobileNavigator = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [initialRoute, setInitialRoute] = useState('IntroSlider');
    const { refreshUserData } = useLocation();

    React.useEffect(() => {
        const initAuth = async () => {
            const isAuthenticated = await checkAuth();
            if (isAuthenticated) {
                setInitialRoute('MainTabs');
                refreshUserData();
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    if (isLoading) {
        return null;
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
            <Stack.Screen name="IntroSlider" component={IntroSlider} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="OTPScreen" component={OTPScreen} />
            <Stack.Screen name="LocationPermission" component={LocationPermission} />
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="CategoryScreen" component={CategoryScreen} />
            <Stack.Screen name="ServiceDetailsScreen" component={ServiceDetailsScreen} />
            <Stack.Screen name="CartScreen" component={CartScreen} />
            <Stack.Screen name="HelpCenterScreen" component={HelpCenterScreen} />
            <Stack.Screen name="TrackJobScreen" component={TrackJobScreen} />
            <Stack.Screen name="ManageAddressesScreen" component={ManageAddressesScreen} />
            <Stack.Screen name="SettingsPlaceholderScreen" component={SettingsPlaceholderScreen} />
            <Stack.Screen name="PaymentMethodsScreen" component={PaymentMethodsScreen} />
            <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
            <Stack.Screen name="LanguageScreen" component={LanguageScreen} />
            <Stack.Screen name="TermsScreen" component={TermsScreen} />
            <Stack.Screen name="VendorProfileScreen" component={VendorProfileScreen} />
            <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
            <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
            <Stack.Screen name="SearchScreen" component={SearchScreen} />
            <Stack.Screen name="MultiServiceBookingScreen" component={MultiServiceBookingScreen} />
        </Stack.Navigator>
    );
};

// Web Navigator with Browser History Support
const WebNavigator = () => {
    const [currentRoute, setCurrentRoute] = useState<{ name: string; params: any }>({ name: 'home', params: {} });

    // Handle browser back/forward buttons
    React.useEffect(() => {
        if (typeof window === 'undefined') return;

        // Check URL on load
        const path = window.location.pathname.replace('/', '') || 'home';
        const validRoutes = ['home', 'category', 'multi-service-booking', 'service-details', 'cart', 'checkout', 'bookings', 'profile', 'login', 'static', 'booking-detail', 'track-job', 'help'];
        if (validRoutes.includes(path)) {
            setCurrentRoute({ name: path, params: {} });
        }

        // Listen for browser back/forward
        const handlePopState = (event: PopStateEvent) => {
            const state = event.state;
            if (state && state.route) {
                setCurrentRoute({ name: state.route, params: state.params || {} });
            } else {
                // Default to home if no state
                setCurrentRoute({ name: 'home', params: {} });
            }
        };

        window.addEventListener('popstate', handlePopState);

        // Push initial state if not already in history
        if (!window.history.state?.route) {
            window.history.replaceState({ route: 'home', params: {} }, '', '/');
        }

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    React.useEffect(() => {
        checkAuth();
    }, []);

    const navigate = (name: string, params: any = {}) => {
        // Update browser history
        if (typeof window !== 'undefined') {
            // Don't push duplicate states
            if (window.history.state?.route !== name) {
                window.history.pushState(
                    { route: name, params },
                    '',
                    name === 'home' ? '/' : `/${name}`
                );
            }
            window.scrollTo(0, 0);
        }
        setCurrentRoute({ name, params });
    };

    if (currentRoute.name === 'category') return <WebCategory onNavigate={navigate} params={currentRoute.params} />;
    if (currentRoute.name === 'multi-service-booking') return <WebMultiServiceBooking onNavigate={navigate} params={currentRoute.params} />;
    if (currentRoute.name === 'service-details') return <WebServiceDetails onNavigate={navigate} params={currentRoute.params} />;
    if (currentRoute.name === 'cart') return <WebCart onNavigate={navigate} params={currentRoute.params} />;
    if (currentRoute.name === 'checkout') return <WebCheckout onNavigate={navigate} params={currentRoute.params} />;
    if (currentRoute.name === 'bookings') return <WebBookings onNavigate={navigate} />;
    if (currentRoute.name === 'profile') return <WebProfile onNavigate={navigate} />;
    if (currentRoute.name === 'login') return <WebLogin onNavigate={navigate} />;
    if (currentRoute.name === 'track-job') return (
        <WebLayout onNavigate={navigate}>
            <TrackJobScreen
                navigation={{ goBack: () => navigate('bookings') }}
                route={{ params: currentRoute.params }}
            />
        </WebLayout>
    );
    if (currentRoute.name === 'booking-detail') return <WebBookingDetail onNavigate={navigate} params={currentRoute.params} />;
    if (currentRoute.name === 'help') return (
        <WebLayout onNavigate={navigate}>
            <View style={{ flex: 1, padding: 20 }}>
                <HelpCenterScreen navigation={{ goBack: () => navigate('home') }} />
            </View>
        </WebLayout>
    );
    if (currentRoute.name === 'static') return <WebStaticPage onNavigate={navigate} page={currentRoute.params.page} />;

    return <WebHome onNavigate={navigate} />;
};

export const AppNavigator = () => {
    const { isDark, colors } = useTheme();

    const navigationTheme = {
        ...(isDark ? DarkTheme : DefaultTheme),
        colors: {
            ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
            primary: colors.primary,
            background: colors.background,
            card: isDark ? colors.surface : colors.white,
            text: colors.text,
            border: colors.border,
            notification: colors.primary,
        },
    };

    if (Platform.OS === 'web') {
        return <WebNavigator />;
    }

    return (
        <NavigationContainer theme={navigationTheme}>
            <MobileNavigator />
        </NavigationContainer>
    );
};
