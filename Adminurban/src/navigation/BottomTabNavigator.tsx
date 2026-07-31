import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet } from 'react-native';
import { MobileDashboard } from '../screens/dashboard/MobileDashboard';
import { UserManagement } from '../screens/users/UserManagement';
import { VendorManagement } from '../screens/vendors/VendorManagement';
import { BookingManagement } from '../screens/bookings/BookingManagement';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen';

// Content Screens
import { ContentMenuScreen } from '../screens/content/ContentMenuScreen';
import { CategoryManagement } from '../screens/content/CategoryManagement';
import { BannerManagement } from '../screens/content/BannerManagement';
import { CityManagement } from '../screens/content/CityManagement';
import { AddonManagement } from '../screens/content/AddonManagement';
import { TimeSlotManagement } from '../screens/content/TimeSlotManagement';
import { PayoutManagement } from '../screens/finance/PayoutManagement';
import { NotificationManagement } from '../screens/content/NotificationManagement';
import { TestimonialManagement } from '../screens/content/TestimonialManagement';
import { CountryCodeManagement } from '../screens/content/CountryCodeManagement';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Profile Stack Navigator
const ProfileStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: '#8b5cf6' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
            }}
        >
            <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'Analytics Overview' }} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
        </Stack.Navigator>
    );
};

// Content Stack Navigator
const ContentStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: '#3b82f6' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
            }}
        >
            <Stack.Screen name="ContentMenu" component={ContentMenuScreen} options={{ title: 'Content Management' }} />
            <Stack.Screen name="CategoryManagement" component={CategoryManagement} options={{ title: 'Categories' }} />
            <Stack.Screen name="BannerManagement" component={BannerManagement} options={{ title: 'Banners' }} />
            <Stack.Screen name="CityManagement" component={CityManagement} options={{ title: 'Cities' }} />
            <Stack.Screen name="AddonManagement" component={AddonManagement} options={{ title: 'Add-ons' }} />
            <Stack.Screen name="TimeSlotManagement" component={TimeSlotManagement} options={{ title: 'Time Slots' }} />
            <Stack.Screen name="PayoutManagement" component={PayoutManagement} options={{ title: 'Payouts' }} />
            <Stack.Screen name="NotificationManagement" component={NotificationManagement} options={{ title: 'Notifications' }} />
            <Stack.Screen name="TestimonialManagement" component={TestimonialManagement} options={{ title: 'Testimonials' }} />
            <Stack.Screen name="CountryCodeManagement" component={CountryCodeManagement} options={{ title: 'Country Codes' }} />
        </Stack.Navigator>
    );
};

export const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    switch (route.name) {
                        case 'Dashboard':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'Bookings':
                            iconName = focused ? 'calendar' : 'calendar-outline';
                            break;
                        case 'Vendors':
                            iconName = focused ? 'briefcase' : 'briefcase-outline';
                            break;
                        case 'Content':
                            iconName = focused ? 'layers' : 'layers-outline';
                            break;
                        case 'Profile':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                        default:
                            iconName = 'home-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#3b82f6',
                tabBarInactiveTintColor: '#94a3b8',
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: '#e2e8f0',
                    height: Platform.OS === 'ios' ? 95 : 75,
                    paddingBottom: Platform.OS === 'ios' ? 35 : 20,
                    paddingTop: 10,
                    elevation: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                    marginBottom: Platform.OS === 'android' ? 4 : 0,
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                    fontSize: 18,
                },
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={MobileDashboard}
                options={{
                    title: 'Home',
                    headerTitle: 'Admin Dashboard',
                    headerStyle: { backgroundColor: '#667eea' },
                }}
            />
            <Tab.Screen
                name="Bookings"
                component={BookingManagement}
                options={{
                    title: 'Bookings',
                    headerTitle: 'Booking Management',
                    headerStyle: { backgroundColor: '#43e97b' },
                }}
            />
            <Tab.Screen
                name="Vendors"
                component={VendorManagement}
                options={{
                    title: 'Vendors',
                    headerTitle: 'Vendor Management',
                    headerStyle: { backgroundColor: '#4facfe' },
                }}
            />
            <Tab.Screen
                name="Content"
                component={ContentStack}
                options={{
                    title: 'Content',
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileStack}
                options={{
                    title: 'Profile',
                    headerShown: false
                }}
            />
        </Tab.Navigator>
    );
};
