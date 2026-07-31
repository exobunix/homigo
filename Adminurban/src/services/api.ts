import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use localhost for web and LAN IP for mobile devices
// Helper to get API URL
const getApiUrl = () => {
    // Check for Vercel/Web environment variable
    if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }

    // Fallback based on Platform
    return Platform.select({
        // For web dev fallback, use localhost or PROD
        web: __DEV__ ? 'http://localhost:3000/api' : 'https://urbanproxbackend.onrender.com/api',
        // For physical devices
        android: 'http://192.168.1.48:3000/api',
        ios: 'http://192.168.1.48:3000/api',
        // DEFAULT FALLBACK (Safety Net)
        default: 'https://urbanproxbackend.onrender.com/api'
    });
};

const API_URL = getApiUrl();
console.log('🌐 Admin API Base URL:', API_URL);

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token
apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const api = {
    // Auth
    login: async (email: string, password: string) => {
        const response = await apiClient.post('/admin/login', { email, password });
        return response.data;
    },

    getProfile: async () => {
        const response = await apiClient.get('/admin/me');
        return response.data;
    },

    updateProfile: async (data: { name?: string; email?: string; phone?: string }) => {
        const response = await apiClient.put('/admin/profile', data);
        return response.data;
    },

    uploadProfilePhoto: async (imageBase64: string) => {
        const response = await apiClient.post('/admin/profile/photo', { image: imageBase64 });
        return response.data;
    },

    changePassword: async (currentPassword: string, newPassword: string) => {
        const response = await apiClient.put('/admin/password', { currentPassword, newPassword });
        return response.data;
    },

    // Dashboard
    getDashboardStats: async () => {
        try {
            const response = await apiClient.get('/admin/dashboard/stats');
            return response.data;
        } catch (error) {
            console.error('Dashboard stats error:', error);
            return {
                success: true,
                data: {
                    stats: {
                        totalUsers: 0,
                        activeVendors: 0,
                        totalBookings: 0,
                        totalServices: 0,
                        revenue: 0
                    },
                    recentActivity: {
                        users: [],
                        bookings: []
                    }
                }
            };
        }
    },

    // Users
    getUsers: async () => {
        try {
            const response = await apiClient.get('/admin/users');
            return response.data;
        } catch (error) {
            console.error('Get users error:', error);
            return { success: false, data: [] };
        }
    },

    toggleUserBlock: async (id: string) => {
        try {
            const response = await apiClient.put(`/admin/users/${id}/block`);
            return response.data;
        } catch (error) {
            console.error('Toggle user block error:', error);
            return { success: false, message: 'Failed to update user status' };
        }
    },

    // Vendors
    getVendors: async () => {
        try {
            const response = await apiClient.get('/admin/vendors');
            return response.data;
        } catch (error) {
            console.error('Get vendors error:', error);
            return { success: false, data: [] };
        }
    },

    verifyVendor: async (id: string) => {
        try {
            const response = await apiClient.put(`/admin/vendors/${id}/verify`);
            return response.data;
        } catch (error) {
            console.error('Verify vendor error:', error);
            return { success: false, message: 'Failed to verify vendor' };
        }
    },

    toggleVendorBlock: async (id: string) => {
        try {
            const response = await apiClient.put(`/admin/vendors/${id}/block`);
            return response.data;
        } catch (error) {
            console.error('Toggle vendor block error:', error);
            return { success: false, message: 'Failed to update vendor status' };
        }
    },

    // Bookings
    getBookings: async () => {
        try {
            const response = await apiClient.get('/admin/bookings');
            return response.data;
        } catch (error) {
            console.error('Get bookings error:', error);
            return { success: false, data: [] };
        }
    },

    // Services
    getServices: async () => {
        try {
            const response = await apiClient.get('/admin/services');
            return response.data;
        } catch (error) {
            console.error('Get services error:', error);
            return { success: false, data: [] };
        }
    },

    createService: async (serviceData: any) => {
        try {
            const response = await apiClient.post('/admin/services', serviceData);
            return response.data;
        } catch (error) {
            console.error('Create service error:', error);
            return { success: false, message: 'Failed to create service' };
        }
    },

    updateService: async (id: string, serviceData: any) => {
        try {
            const response = await apiClient.put(`/admin/services/${id}`, serviceData);
            return response.data;
        } catch (error) {
            console.error('Update service error:', error);
            return { success: false, message: 'Failed to update service' };
        }
    },

    deleteService: async (id: string) => {
        try {
            const response = await apiClient.delete(`/admin/services/${id}`);
            return response.data;
        } catch (error) {
            console.error('Delete service error:', error);
            return { success: false, message: 'Failed to delete service' };
        }
    },

    // Content Management - Categories
    getCategories: async (level?: string, parentCategory?: string) => {
        try {
            const query = new URLSearchParams();
            if (level) query.append('level', level);
            if (parentCategory) query.append('parentCategory', parentCategory);

            const response = await apiClient.get(`/content/categories?${query.toString()}`);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to fetch categories' };
        }
    },
    createCategory: async (data: any) => {
        try {
            const response = await apiClient.post('/content/categories', data);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to create category' };
        }
    },
    updateCategory: async (id: string, data: any) => {
        try {
            const response = await apiClient.put(`/content/categories/${id}`, data);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to update category' };
        }
    },
    deleteCategory: async (id: string) => {
        try {
            const response = await apiClient.delete(`/content/categories/${id}`);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to delete category' };
        }
    },

    // Content Management - Banners
    getBanners: async () => {
        try {
            const response = await apiClient.get('/content/banners');
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to fetch banners' };
        }
    },
    createBanner: async (data: any) => {
        try {
            const response = await apiClient.post('/content/banners', data);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to create banner' };
        }
    },
    updateBanner: async (id: string, data: any) => {
        try {
            const response = await apiClient.put(`/content/banners/${id}`, data);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to update banner' };
        }
    },
    deleteBanner: async (id: string) => {
        try {
            const response = await apiClient.delete(`/content/banners/${id}`);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to delete banner' };
        }
    },

    // Content Management - Cities
    getCities: async () => {
        try {
            const response = await apiClient.get('/content/cities');
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to fetch cities' };
        }
    },
    createCity: async (data: any) => {
        try {
            const response = await apiClient.post('/content/cities', data);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to create city' };
        }
    },
    updateCity: async (id: string, data: any) => {
        try {
            const response = await apiClient.put(`/content/cities/${id}`, data);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to update city' };
        }
    },
    deleteCity: async (id: string) => {
        try {
            const response = await apiClient.delete(`/content/cities/${id}`);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to delete city' };
        }
    },

    // Content Management - Addons
    getAddons: async (categoryId?: string) => {
        try {
            const params = new URLSearchParams();
            if (categoryId) params.append('categoryId', categoryId);
            const response = await apiClient.get(`/content/addons?${params.toString()}`);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to fetch addons' };
        }
    },
    createAddon: async (data: any) => {
        try {
            const response = await apiClient.post('/content/addons', data);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to create addon' };
        }
    },
    updateAddon: async (id: string, data: any) => {
        try {
            const response = await apiClient.put(`/content/addons/${id}`, data);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to update addon' };
        }
    },
    deleteAddon: async (id: string) => {
        try {
            const response = await apiClient.delete(`/content/addons/${id}`);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to delete addon' };
        }
    },

    // Content Management - TimeSlots
    getTimeSlots: async () => {
        try {
            const response = await apiClient.get('/content/timeslots');
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to fetch time slots' };
        }
    },
    createTimeSlot: async (data: any) => {
        try {
            const response = await apiClient.post('/content/timeslots', data);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to create time slot' };
        }
    },
    updateTimeSlot: async (id: string, data: any) => {
        try {
            const response = await apiClient.put(`/content/timeslots/${id}`, data);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to update time slot' };
        }
    },
    deleteTimeSlot: async (id: string) => {
        try {
            const response = await apiClient.delete(`/content/timeslots/${id}`);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to delete time slot' };
        }
    },

    // Payouts
    getPayouts: async (status?: string, vendorId?: string) => {
        try {
            const query = new URLSearchParams();
            if (status) query.append('status', status);
            if (vendorId) query.append('vendorId', vendorId);
            const response = await apiClient.get(`/content/payouts?${query.toString()}`);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to fetch payouts' };
        }
    },
    createPayout: async (data: any) => {
        try {
            const response = await apiClient.post('/content/payouts', data);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to create payout' };
        }
    },
    updatePayout: async (id: string, data: any) => {
        try {
            const response = await apiClient.put(`/content/payouts/${id}`, data);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to update payout' };
        }
    },

    // Notifications
    getMyNotifications: async () => {
        try {
            const response = await apiClient.get('/notifications/admin');
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to fetch notifications' };
        }
    },
    markMyNotificationRead: async (id: string) => {
        try {
            const response = await apiClient.put(`/notifications/admin/${id}/read`);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to mark notification read' };
        }
    },
    getNotifications: async (target?: string) => {
        try {
            const response = await apiClient.get(`/content/notifications${target ? `?target=${target}` : ''}`);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to fetch notifications' };
        }
    },
    createNotification: async (data: any) => {
        try {
            const response = await apiClient.post('/content/notifications', data);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to create notification' };
        }
    },
    deleteNotification: async (id: string) => {
        try {
            const response = await apiClient.delete(`/content/notifications/${id}`);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to delete notification' };
        }
    },

    // Testimonials
    getTestimonials: async () => {
        try {
            const response = await apiClient.get('/content/testimonials');
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to fetch testimonials' };
        }
    },
    createTestimonial: async (data: any) => {
        try {
            const response = await apiClient.post('/content/testimonials', data);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to create testimonial' };
        }
    },
    updateTestimonial: async (id: string, data: any) => {
        try {
            const response = await apiClient.put(`/content/testimonials/${id}`, data);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to update testimonial' };
        }
    },
    deleteTestimonial: async (id: string) => {
        try {
            const response = await apiClient.delete(`/content/testimonials/${id}`);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to delete testimonial' };
        }
    },

    // Country Codes
    getCountryCodes: async () => {
        try {
            const response = await apiClient.get('/content/country-codes');
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to fetch country codes' };
        }
    },
    createCountryCode: async (data: any) => {
        try {
            const response = await apiClient.post('/content/country-codes', data);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to create country code' };
        }
    },
    updateCountryCode: async (id: string, data: any) => {
        try {
            const response = await apiClient.put(`/content/country-codes/${id}`, data);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to update country code' };
        }
    },
    deleteCountryCode: async (id: string) => {
        try {
            const response = await apiClient.delete(`/content/country-codes/${id}`);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to delete country code' };
        }
    },

    // Payment Gateways
    getPaymentGateways: async () => {
        try {
            const response = await apiClient.get('/settings/payment-gateways');
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to fetch payment gateways' };
        }
    },
    updatePaymentGateway: async (data: any) => {
        try {
            const response = await apiClient.put('/settings/payment-gateways', data);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to update payment gateway' };
        }
    },

    // Admin Management
    registerAdmin: async (data: any) => {
        try {
            const response = await apiClient.post('/admin/register', data);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to register' };
        }
    },
    getPendingAdmins: async () => {
        try {
            const response = await apiClient.get('/admin/admins/pending');
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to fetch pending admins' };
        }
    },
    getActiveAdmins: async () => {
        try {
            const response = await apiClient.get('/admin/admins/active');
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to fetch active admins' };
        }
    },
    approveAdmin: async (id: string) => {
        try {
            const response = await apiClient.put(`/admin/admins/${id}/approve`);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to approve admin' };
        }
    },
    deleteAdmin: async (id: string) => {
        try {
            const response = await apiClient.delete(`/admin/admins/${id}`);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to delete admin' };
        }
    },
    updateAdmin: async (id: string, data: any) => {
        try {
            const response = await apiClient.put(`/admin/admins/${id}`, data);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to update admin' };
        }
    },

    // Web Content
    getWebContent: async (page: string = 'home') => {
        try {
            const response = await apiClient.get(`/content/web-content?page=${page}`);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to fetch web content' };
        }
    },
    updateWebContent: async (data: any) => {
        try {
            const response = await apiClient.put('/content/web-content', data);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to update web content' };
        }
    },
};

export default api;
