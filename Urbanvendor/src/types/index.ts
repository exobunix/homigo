// Core Types
export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  profileImage?: string;
  gender?: string;
  dob?: string;
  isOnline: boolean;
  rating: number;
  totalJobs: number;
  joinDate: string;
}

export interface Vendor extends User {
  services: ServiceCategory[];
  workingHours: WorkingHours;
  location: Location;
  kyc: KYCDetails;
  bankDetails: BankDetails;
  workingRadius: number; // in km
  experience: number; // in years
  isVerified: boolean;
  earnings: VendorEarnings;
  fcmToken?: string; // For Push Notifications
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  basePrice: number;
  variants: ServiceVariant[];
  isActive: boolean;
}

export interface ServiceVariant {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  description: string;
}

export interface WorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isWorking: boolean;
  startTime: string; // "09:00"
  endTime: string; // "18:00"
  breakStart?: string;
  breakEnd?: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface KYCDetails {
  aadharNumber: string;
  aadharFront: string; // image URL
  aadharBack: string; // image URL
  panNumber: string;
  panImage: string; // image URL
  certificates: string[]; // image URLs
  isVerified: boolean;
  verificationDate?: string;
}

export interface BankDetails {
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  bankName: string;
  isVerified: boolean;
}

export interface VendorEarnings {
  totalEarnings: number;
  todayEarnings: number;
  weekEarnings: number;
  monthEarnings: number;
  pendingAmount: number;
  lastPayoutDate?: string;
}

// Booking Types
export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerLocation: Location;
  serviceId: string;
  serviceName: string;
  serviceVariants: BookingServiceVariant[];
  scheduledDate: string;
  scheduledTime: string;
  status: BookingStatus;
  totalAmount: number;
  additionalCharges?: AdditionalCharge[];
  workImages?: string[];
  customerSignature?: string;
  rating?: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDuration: number;
  actualStartTime?: string;
  actualEndTime?: string;
  cancellationReason?: string;
  paymentStatus: PaymentStatus;
  commission: number;
  vendorEarning: number;
}

export interface BookingServiceVariant {
  variantId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface AdditionalCharge {
  id: string;
  description: string;
  amount: number;
  isApproved: boolean;
}

export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'on_the_way'
  | 'arrived'
  | 'work_started'
  | 'work_completed'
  | 'cancelled'
  | 'rejected';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';

// Real-time Booking Request
export interface BookingRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerLocation: Location;
  serviceId: string;
  serviceName: string;
  serviceVariants: BookingServiceVariant[];
  scheduledDate: string;
  scheduledTime: string;
  totalAmount: number;
  estimatedDuration: number;
  customerRating: number;
  distance: number; // in km
  expiresAt: string; // ISO string
  priority: 'normal' | 'urgent';
}

// Chat Types
export interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  senderType: 'vendor' | 'customer';
  message: string;
  messageType: 'text' | 'image' | 'location';
  timestamp: string;
  isRead: boolean;
  imageUrl?: string;
  location?: Location;
}

export interface ChatRoom {
  id: string;
  bookingId: string;
  customerId: string;
  vendorId: string;
  lastMessage: ChatMessage;
  unreadCount: number;
  isActive: boolean;
}

// Notification Types
export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: any;
  isRead: boolean;
  createdAt: string;
  imageUrl?: string;
}

export type NotificationType =
  | 'booking_request'
  | 'booking_cancelled'
  | 'payment_received'
  | 'rating_received'
  | 'admin_announcement'
  | 'chat_message'
  | 'payout_processed'
  | 'info';

// Transaction Types
export interface Transaction {
  id: string;
  bookingId?: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  description: string;
  createdAt: string;
  payoutDate?: string;
  commission?: number;
  tax?: number;
  netAmount: number;
}

export type TransactionType =
  | 'earning'
  | 'payout'
  | 'commission'
  | 'penalty'
  | 'bonus'
  | 'refund';

export type TransactionStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled';

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
  PendingApproval: undefined;
  BookingRequest: { request: BookingRequest };
  BookingDetail: { bookingId: string };
  Chat: { bookingId: string; customerName: string };
  Profile: undefined;
  Earnings: undefined;
  Settings: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  VendorSignup: undefined;
  OTPVerification: { phone: string; mode?: 'signup' | 'reset' };
  ResetPassword: { phone: string };
  ProfileSetup: { phone: string };
  KYCUpload: undefined;
  ServiceSelection: undefined;
  BankDetails: undefined;
  WorkingHours: undefined;
  OnboardingComplete: undefined;
};

export type AppTabParamList = {
  Home: undefined;
  Bookings: undefined;
  Earnings: undefined;
  Services: undefined;
  Profile: undefined;
};

// Socket Events
export interface SocketEvents {
  // Incoming events
  'booking:new': BookingRequest;
  'booking:cancelled': { bookingId: string; reason: string };
  'booking:updated': { bookingId: string; status: BookingStatus };
  'chat:message': ChatMessage;
  'vendor:status_changed': { isOnline: boolean };

  // Outgoing events
  'vendor:online': { vendorId: string; location: Location };
  'vendor:offline': { vendorId: string };
  'booking:accept': { bookingId: string; vendorId: string };
  'booking:reject': { bookingId: string; vendorId: string; reason?: string };
  'booking:status_update': { bookingId: string; status: BookingStatus; location?: Location };
  'chat:send_message': ChatMessage;
  'chat:message_read': { messageId: string };
}

// Form Types
export interface LoginForm {
  phone: string;
}

export interface OTPForm {
  otp: string;
}

export interface ProfileSetupForm {
  name: string;
  email: string;
  age: number;
  experience: number;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface ServiceSelectionForm {
  selectedServices: string[];
  customPricing: { [serviceId: string]: number };
}

export interface BankDetailsForm {
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  bankName: string;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// State Types
export interface AuthState {
  isAuthenticated: boolean;
  user: Vendor | null;
  token: string | null;
  isLoading: boolean;
  error: AppError | null;
}

export interface BookingState {
  activeBookings: Booking[];
  completedBookings: Booking[];
  currentRequest: BookingRequest | null;
  isRequestVisible: boolean;
  requestTimer: number;
  isLoading: boolean;
  error: AppError | null;
}

export interface ChatState {
  rooms: ChatRoom[];
  messages: { [roomId: string]: ChatMessage[] };
  activeRoom: string | null;
  isLoading: boolean;
  error: AppError | null;
}

export interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: AppError | null;
}

export interface LocationState {
  currentLocation: Location | null;
  isTracking: boolean;
  isLocationEnabled: boolean;
  error: AppError | null;
}
