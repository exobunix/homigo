import axios from 'axios';
import { API_URL } from '@env';
import { ApiResponse, Vendor, Service, Booking } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Your current local IP address - Updated to match your machine
const LOCAL_IP = '192.168.0.186';

// Get API URL from environment with proper fallbacks
const getBaseUrl = () => {
    // Mobile ALWAYS uses IP address (localhost won't work on physical devices)
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
        // Check @env package first for production
        if (API_URL && !API_URL.includes('localhost')) {
            return API_URL;
        }
        // Development - use local IP
        return `http://${LOCAL_IP}:3000`;
    }

    // Web - check process.env or use Production URL
    if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }

    // Default Fallback
    // If we are in development mode, use localhost. Otherwise (Production/Vercel), use live backend.
    return __DEV__ ? 'http://localhost:3000' : 'https://homigo-ubpu.onrender.com';
};

// Ensure URL doesn't have trailing /api already
let baseUrl = getBaseUrl();
// Remove trailing /api if it exists to avoid duplication
if (baseUrl.endsWith('/api')) {
    baseUrl = baseUrl.slice(0, -4);
}
const BASE_URL = baseUrl + '/api';

console.log('🌐 API Base URL:', BASE_URL);

const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Suppress 401 errors from console to avoid user confusion during skip login
        if (error.response?.status !== 401) {
            console.error('API Error:', error.response?.data || error.message);
        }
        return Promise.reject(error);
    }
);

// Helper to set auth token
export const setAuthToken = (token: string | null) => {
    if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete apiClient.defaults.headers.common['Authorization'];
    }
};

export const checkAuth = async () => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            setAuthToken(token);
            return true;
        }
    } catch (e) {
        console.error('Failed to load auth token', e);
    }
    return false;
};

export const api = {
    // Auth
    loginOrRegister: async (phone: string, location?: any) => {
        const response = await apiClient.post('/user/login', { phone, location });
        if (response.data.token) {
            setAuthToken(response.data.token);
            await AsyncStorage.setItem('userToken', response.data.token);
        }
        return response.data;
    },

    // Firebase Authentication
    firebaseAuth: async (idToken: string, phone: string, userType: 'customer' | 'vendor' = 'customer') => {
        const response = await apiClient.post('/auth/firebase-auth', {
            idToken,
            phone,
            userType
        });
        if (response.data.success && response.data.data.token) {
            setAuthToken(response.data.data.token);
            await AsyncStorage.setItem('userToken', response.data.data.token);
        }
        return response.data;
    },

    logout: async () => {
        setAuthToken(null);
        await AsyncStorage.removeItem('userToken');
    },

    // User Profile & Address
    getProfile: async () => {
        const response = await apiClient.get('/user/profile');
        return response.data;
    },

    updateProfile: async (userData: any) => {
        const response = await apiClient.put('/user/profile', userData);
        return response.data;
    },

    uploadProfileImage: async (formData: FormData) => {
        const response = await apiClient.post('/user/profile/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    addAddress: async (addressData: any) => {
        const response = await apiClient.post('/user/address', addressData);
        return response.data;
    },

    // Services
    // This matches the "User App: Reads from the Services table" requirement
    getServices: async (category?: string, subCategory?: string) => {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (subCategory) params.append('subCategory', subCategory);

        const response = await apiClient.get<ApiResponse<Service[]>>(`/services?${params.toString()}`);
        return response.data;
    },

    getServiceById: async (id: string) => {
        const response = await apiClient.get<ApiResponse<Service>>(`/services/${id}`);
        return response.data;
    },

    // Vendors
    // Assuming a public vendors endpoint will be available
    getVendors: async (category?: string) => {
        const params = new URLSearchParams();
        if (category) params.append('category', category);

        const response = await apiClient.get<ApiResponse<Vendor[]>>(`/vendors?${params.toString()}`);
        return response.data;
    },

    getVendorById: async (id: string) => {
        const response = await apiClient.get<ApiResponse<Vendor>>(`/vendors/${id}`);
        return response.data;
    },

    getAvailableVendors: async (params: { serviceId?: string, time?: string, location?: any }) => {
        const queryParams = new URLSearchParams();
        if (params.serviceId) queryParams.append('serviceId', params.serviceId);
        if (params.time) queryParams.append('time', params.time);
        if (params.location) queryParams.append('location', JSON.stringify(params.location));

        const response = await apiClient.get<ApiResponse<Vendor[]>>(`/vendors/available?${queryParams.toString()}`);
        return response.data;
    },

    checkVendorAvailability: async (vendorId: string, date: string, time: string) => {
        const response = await apiClient.get(`/vendors/${vendorId}/availability?date=${date}&time=${time}`);
        return response.data;
    },

    approveBooking: async (bookingId: string, action: 'approve' | 'reject') => {
        const response = await apiClient.post(`/bookings/${bookingId}/user-approval`, { action });
        return response.data;
    },

    approveNextVendor: async (bookingId: string) => {
        const response = await apiClient.post(`/bookings/${bookingId}/user-approval`, { action: 'approve' });
        return response.data;
    },

    rejectNextVendor: async (bookingId: string) => {
        const response = await apiClient.post(`/bookings/${bookingId}/user-approval`, { action: 'reject' });
        return response.data;
    },

    // Bookings
    createBooking: async (bookingData: Partial<Booking>) => {
        const response = await apiClient.post<ApiResponse<Booking>>('/bookings', bookingData);
        return response.data;
    },

    getUserBookings: async (userId: string) => {
        const response = await apiClient.get<ApiResponse<Booking[]>>(`/bookings/user/${userId}`);
        return response.data;
    },

    getBookingById: async (bookingId: string) => {
        const response = await apiClient.get<ApiResponse<Booking>>(`/bookings/${bookingId}`);
        return response.data;
    },

    cancelBooking: async (bookingId: string) => {
        const response = await apiClient.post(`/bookings/${bookingId}/cancel`);
        return response.data;
    },

    getBookingOtp: async (bookingId: string) => {
        const response = await apiClient.get<ApiResponse<{ otp: string, bookingId: string, fullBookingId: string }>>(`/bookings/${bookingId}/otp`);
        return response.data;
    },

    // Cart
    getCart: async () => {
        const response = await apiClient.get('/cart');
        return response.data;
    },

    addToCart: async (item: any) => {
        const response = await apiClient.post('/cart/add', item);
        return response.data;
    },

    removeFromCart: async (itemId: string) => {
        const response = await apiClient.delete(`/cart/remove/${itemId}`);
        return response.data;
    },

    updateCartItem: async (itemId: string, quantity?: number, vendorId?: string) => {
        const response = await apiClient.put(`/cart/update/${itemId}`, { quantity, vendorId });
        return response.data;
    },

    clearCart: async () => {
        const response = await apiClient.delete('/cart/clear');
        return response.data;
    },

    // Notifications
    getNotifications: async () => {
        const response = await apiClient.get('/notifications');
        return response.data;
    },

    // Banners
    getBanners: async () => {
        const response = await apiClient.get('/content/banners');
        return response.data;
    },

    getCategories: async (level?: string, parentId?: string) => {
        const params = new URLSearchParams();
        if (level) params.append('level', level);
        if (parentId) params.append('parentCategory', parentId);
        const response = await apiClient.get(`/content/categories?${params.toString()}`);
        return response.data;
    },

    getCategoryById: async (id: string) => {
        const response = await apiClient.get(`/content/categories/${id}`);
        return response.data;
    },

    // Addons
    getAddons: async (categoryId?: string) => {
        const params = new URLSearchParams();
        if (categoryId) params.append('categoryId', categoryId);
        const response = await apiClient.get(`/content/addons?${params.toString()}`);
        return response.data;
    },

    // Testimonials
    getTestimonials: async () => {
        const response = await apiClient.get('/content/testimonials');
        return response.data;
    },

    // Web Content
    getWebContent: async (page: string = 'home') => {
        const response = await apiClient.get(`/content/web-content?page=${page}`);
        return response.data;
    },
};
