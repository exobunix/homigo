import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../auth/AuthContext';
import { AdminLogin } from '../screens/auth/AdminLogin';
import { EnhancedDashboard } from '../screens/dashboard/EnhancedDashboard';
import { UserManagement } from '../screens/users/UserManagement';
import { VendorManagement } from '../screens/vendors/VendorManagement';
import { BookingManagement } from '../screens/bookings/BookingManagement';
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { CategoryManagement } from '../screens/content/CategoryManagement';
import { BannerManagement } from '../screens/content/BannerManagement';
import { CityManagement } from '../screens/content/CityManagement';
import { AddonManagement } from '../screens/content/AddonManagement';
import { TimeSlotManagement } from '../screens/content/TimeSlotManagement';
import { PayoutManagement } from '../screens/finance/PayoutManagement';
import { NotificationManagement } from '../screens/content/NotificationManagement';
import { TestimonialManagement } from '../screens/content/TestimonialManagement';
import { CountryCodeManagement } from '../screens/content/CountryCodeManagement';
import { WebContentManager } from '../screens/content/WebContentManager';
import { AdminManagement } from '../screens/admin/AdminManagement';
import { BottomTabNavigator } from './BottomTabNavigator';
import { ActivityIndicator, View, Platform } from 'react-native';

const Stack = createStackNavigator();

export const AppNavigator = () => {
    const { admin, loading, logout } = useAuth();
    const [currentScreen, setCurrentScreen] = useState('dashboard');

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    // For web, use custom navigation
    if (Platform.OS === 'web' && admin) {
        const renderScreen = () => {
            const props = {
                onNavigate: setCurrentScreen,
                onLogout: logout,
                adminName: admin?.name || 'Admin',
                currentPage: currentScreen,
                logout: logout // Just in case, but onLogout is the standard
            };

            switch (currentScreen) {
                case 'users':
                    return <UserManagement {...props} />;
                case 'vendors':
                    return <VendorManagement {...props} />;
                case 'bookings':
                    return <BookingManagement {...props} />;
                case 'analytics':
                    return <AnalyticsScreen {...props} />;
                case 'profile':
                    return <ProfileScreen {...props} />;
                case 'editProfile':
                    return <EditProfileScreen {...props} />;
                case 'settings':
                    return <SettingsScreen {...props} />;
                case 'categories':
                    return <CategoryManagement {...props} />;
                case 'banners':
                    return <BannerManagement {...props} />;
                case 'cities':
                    return <CityManagement {...props} />;
                case 'addons':
                    return <AddonManagement {...props} />;
                case 'timeslots':
                    return <TimeSlotManagement {...props} />;
                case 'payouts':
                    return <PayoutManagement {...props} />;
                case 'notifications':
                    return <NotificationManagement {...props} />;
                case 'testimonials':
                    return <TestimonialManagement {...props} />;
                case 'country-codes':
                    return <CountryCodeManagement {...props} />;
                case 'web-content':
                    return <WebContentManager {...props} />;
                case 'admins':
                    return <AdminManagement {...props} />;
                default:
                    return <EnhancedDashboard {...props} />;
            }
        };

        return renderScreen();
    }

    // For mobile, use Bottom Tab Navigation
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {admin ? (
                    <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
                ) : (
                    <Stack.Screen
                        name="Login"
                        component={AdminLogin}
                        options={{ headerShown: false }}
                    />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};
