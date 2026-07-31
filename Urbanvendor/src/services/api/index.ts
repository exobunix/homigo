import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { ApiResponse, Vendor, Booking, BookingStatus, Location } from '@/types';

// Your current local IP address - CHANGE THIS when your IP changes
const LOCAL_IP = '192.168.1.38';

// Base API configuration
// Get API URL from environment with proper fallbacks
const getBaseUrl = () => {
  // Mobile ALWAYS uses IP address (localhost won't work on physical devices)
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    // Development - use local IP
    return `http://${LOCAL_IP}:3000/api`;
  }

  // Check web environment first (Vercel deployment)
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Web fallback (Always Prod as per request)
  return 'https://urbanproxbackend.onrender.com/api';
};

// Ensure URL doesn't have trailing /api already
let baseUrl = getBaseUrl();
// Remove trailing /api if it exists to avoid duplication
if (baseUrl.endsWith('/api')) {
  baseUrl = baseUrl.slice(0, -4);
}
export const BASE_URL = baseUrl + '/api';

console.log('🌐 Vendor API Base URL:', BASE_URL);

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, clear storage and redirect to login
          await AsyncStorage.removeItem('authToken');
          // You can emit an event here to redirect to login
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.get(url);
  }

  async post<T>(url: string, data?: any, config?: any): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.post(url, data, config);
  }

  async put<T>(url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.put(url, data);
  }

  async delete<T>(url: string): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.delete(url);
  }

  async patch<T>(url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.patch(url, data);
  }
}

const apiClient = new ApiClient();

// Auth API
export const authAPI = {
  sendOTP: (phone: string) =>
    apiClient.post<null>('/auth/send-otp', { phone }),

  verifyOTP: (phone: string, otp: string) =>
    apiClient.post<{ token: string; user: Vendor }>('/auth/verify-otp', { phone, otp }),

  loginWithPassword: (phone: string, password: string) =>
    apiClient.post<{ token: string; user: Vendor }>('/auth/login', { phone, password }),

  getProfile: () =>
    apiClient.get<Vendor>('/auth/profile'),


  updateProfile: (data: Partial<Vendor> & { password?: string }) =>
    apiClient.put<Vendor>('/auth/profile', data),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post<Vendor>('/auth/change-password', { currentPassword, newPassword }),

  uploadProfileImage: (data: FormData) =>
    apiClient.post<Vendor>('/auth/profile-image', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  uploadImage: (data: FormData) =>
    apiClient.post<{ url: string }>('/auth/upload-image', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateOnlineStatus: (isOnline: boolean) =>
    apiClient.patch<Vendor>('/auth/online-status', { isOnline }),

  updateNotifications: (enabled: boolean) =>
    apiClient.patch<Vendor>('/auth/notifications', { enabled }),

  updateServiceArea: (data: { workingRadius?: number; location?: Partial<Location> }) =>
    apiClient.put<Vendor>('/auth/service-area', data),

  logout: () =>
    apiClient.post<null>('/auth/logout'),

  uploadKYC: (data: FormData) =>
    apiClient.post<Vendor>('/auth/kyc', data),

  updateBankDetails: (data: any) =>
    apiClient.put<Vendor>('/auth/bank-details', data),

  updateServices: (services: any[]) =>
    apiClient.put<Vendor>('/auth/services', { services }),

  updateWorkingHours: (workingHours: any) =>
    apiClient.put<Vendor>('/auth/working-hours', workingHours),
};

// Booking API
export const bookingAPI = {
  getActiveBookings: () =>
    apiClient.get<Booking[]>('/bookings/active'),

  getCompletedBookings: (page: number = 1, limit: number = 20) =>
    apiClient.get(`/bookings/completed?page=${page}&limit=${limit}`),

  getBookingDetails: (bookingId: string) =>
    apiClient.get<Booking>(`/bookings/${bookingId}`),

  acceptBooking: (bookingId: string) =>
    apiClient.post<Booking>(`/bookings/${bookingId}/accept`),

  rejectBooking: (bookingId: string, reason?: string) =>
    apiClient.post(`/bookings/${bookingId}/reject`, { reason }),

  updateBookingStatus: (bookingId: string, status: BookingStatus, location?: Location) =>
    apiClient.patch<Booking>(`/bookings/${bookingId}/status`, { status, location }),

  addAdditionalCharges: (bookingId: string, charges: any[]) =>
    apiClient.post<Booking>(`/bookings/${bookingId}/additional-charges`, { charges }),

  uploadWorkImages: (bookingId: string, images: string[]) =>
    apiClient.post<Booking>(`/bookings/${bookingId}/work-images`, { images }),

  addCustomerSignature: (bookingId: string, signature: string) =>
    apiClient.post<Booking>(`/bookings/${bookingId}/signature`, { signature }),

  verifyCompletionOtp: (bookingId: string, otp: string) =>
    apiClient.post<Booking>(`/bookings/${bookingId}/verify-otp`, { otp }),
};

// Chat API
export const chatAPI = {
  getChatRooms: () =>
    apiClient.get('/chat/rooms'),

  getMessages: (roomId: string, page: number = 1) =>
    apiClient.get(`/chat/rooms/${roomId}/messages?page=${page}`),

  sendMessage: (roomId: string, message: any) =>
    apiClient.post(`/chat/rooms/${roomId}/messages`, message),

  markMessagesAsRead: (roomId: string) =>
    apiClient.patch(`/chat/rooms/${roomId}/read`),
};

// Earnings API
export const earningsAPI = {
  getDashboard: () =>
    apiClient.get('/earnings/dashboard'),

  getTransactions: (page: number = 1, type?: string) =>
    apiClient.get(`/earnings/transactions?page=${page}${type ? `&type=${type}` : ''}`),

  requestPayout: (amount: number) =>
    apiClient.post('/earnings/payout', { amount }),

  getPayoutHistory: (page: number = 1) =>
    apiClient.get(`/earnings/payouts?page=${page}`),
};

// Notification API
export const notificationAPI = {
  getNotifications: (page: number = 1) =>
    apiClient.get(`/notifications?page=${page}`),

  markAsRead: (notificationId: string) =>
    apiClient.patch(`/notifications/${notificationId}/read`),

  markAllAsRead: () =>
    apiClient.patch('/notifications/read-all'),

  updateFCMToken: (token: string) =>
    apiClient.post('/notifications/fcm-token', { token }),
};

// Service API
export const serviceAPI = {
  // Hierarchical Categories
  getCategories: (level?: string, parentId?: string) => {
    const params = new URLSearchParams();
    if (level) params.append('level', level);
    if (parentId) params.append('parentCategory', parentId);
    return apiClient.get(`/content/categories?${params.toString()}`);
  },

  getCategoryById: (id: string) =>
    apiClient.get(`/content/categories/${id}`),

  // Legacy methods (kept for backward compatibility)
  getMasterServices: () =>
    apiClient.get<any[]>('/services/master'),

  updateServicePricing: (serviceId: string, pricing: any) =>
    apiClient.put(`/services/${serviceId}/pricing`, pricing),
};

// Location API
export const locationAPI = {
  updateLocation: (location: Location) =>
    apiClient.post('/location/update', location),

  getNearbyBookings: (location: Location, radius: number = 10) =>
    apiClient.post('/location/nearby-bookings', { location, radius }),
};

export default apiClient;
