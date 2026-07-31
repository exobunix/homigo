export interface Location {
    latitude: number;
    longitude: number;
    address: string;
    city?: string;
    state?: string;
    pincode?: string;
}

export interface Service {
    id: string;
    vendorId?: string;
    title: string;
    description?: string;
    price: number;
    image?: string;
    category: string;
    subCategory?: string;
    duration?: number; // in minutes
    rating?: number;
    reviewCount?: number;
}

export interface Vendor {
    _id: string;
    name: string;
    phone: string;
    email?: string;
    profileImage?: string;
    rating: number;
    totalJobs: number;
    location: Location;
    services: Service[];
    isOnline: boolean;
    workingRadius: number;
    about?: string;
    reviews?: Review[];
}

export interface Review {
    id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
}

export interface Booking {
    _id: string;
    userId: string;
    vendorId: string;
    serviceId: string;
    status: 'pending' | 'accepted' | 'ongoing' | 'completed' | 'cancelled';
    date: string;
    time: string;
    totalAmount: number;
    address: Location;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}
