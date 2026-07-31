import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppTabParamList } from '@/types';

// App Screens
import VendorDashboard from '@/screens/app/VendorDashboard';
import BookingList from '@/screens/app/BookingList';
import BookingDetail from '@/screens/app/BookingDetail';
import ServicesDashboard from '@/screens/app/ServicesDashboard';
import EarningsDashboard from '@/screens/app/EarningsDashboard';
import VendorProfile from '@/screens/app/VendorProfile';
import ProfileSetupScreen from '@/screens/auth/ProfileSetupScreen';
import KYCUploadScreen from '@/screens/auth/KYCUploadScreen';
import BankDetailsScreen from '@/screens/auth/BankDetailsScreen';
import NotificationsScreen from '@/screens/app/NotificationsScreen';
import ChatList from '@/screens/app/ChatList';
import ChatScreen from '@/screens/app/ChatScreen';
import ServiceAreaScreen from '@/screens/app/ServiceAreaScreen';
import HelpSupportScreen from '@/screens/app/HelpSupportScreen';
import ServiceSelectionScreen from '@/screens/auth/ServiceSelectionScreen';
import { Platform } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#6366f1',
                tabBarInactiveTintColor: '#94a3b8',
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: '#e2e8f0',
                    paddingBottom: 0,
                    paddingTop: 10,
                    height: 80,
                    display: Platform.OS === 'web' ? 'none' : 'flex',
                },
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={VendorDashboard}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Bookings"
                component={BookingList}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="calendar-check" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Services"
                component={ServicesDashboard}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="tools" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Earnings"
                component={EarningsDashboard}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="cash-multiple" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={VendorProfile}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="account" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="BookingDetail" component={BookingDetail} />
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
            <Stack.Screen name="KYCUpload" component={KYCUploadScreen} />
            <Stack.Screen name="BankDetails" component={BankDetailsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="ChatList" component={ChatList} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="ServiceArea" component={ServiceAreaScreen} />
            <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
            <Stack.Screen name="ServiceSelection" component={ServiceSelectionScreen} />
        </Stack.Navigator>
    );
}
