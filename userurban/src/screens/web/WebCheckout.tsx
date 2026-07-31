import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Platform, Modal, Image } from 'react-native';
import { WebLayout } from './WebLayout';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

export const WebCheckout = ({ onNavigate, params }: { onNavigate: (route: string, params?: any) => void, params?: any }) => {
    const { items: cartItems, cartTotal, clearCart, cancelAutoClear } = useCart();
    const [vendors, setVendors] = useState<any[]>([]);
    const [selectedVendor, setSelectedVendor] = useState<any>(null);

    useEffect(() => {
        cancelAutoClear();
    }, []);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [loading, setLoading] = useState(true);
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [address, setAddress] = useState<string>('');
    const [fetchingLocation, setFetchingLocation] = useState(false);
    const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<'cod' | 'online'>('cod');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);

    // Payment Modal State
    const [modalMethod, setModalMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
    const [upiId, setUpiId] = useState('');
    const [selectedBank, setSelectedBank] = useState('');
    const [isPaymentVerified, setIsPaymentVerified] = useState(false);

    const getNextDays = () => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            days.push({
                date: date.toISOString().split('T')[0],
                label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
            });
        }
        return days;
    };

    const TIME_SLOTS = [
        '09:00 AM', '10:00 AM', '11:00 AM',
        '12:00 PM', '01:00 PM', '02:00 PM',
        '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
    ];

    useEffect(() => {
        checkAuthAndLoadVendors();
        loadUserAddress();
    }, []);

    useEffect(() => {
        if (selectedVendor && selectedDate) {
            checkVendorAvailability();
        } else {
            setAvailableSlots([]);
            setSelectedTime('');
        }
    }, [selectedVendor, selectedDate]);

    const checkAuthAndLoadVendors = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                alert('Please login to book services');
                onNavigate('login');
                return;
            }
            loadVendors();
        } catch (error) {
            console.error('Auth check failed:', error);
            onNavigate('home');
        }
    };

    const loadVendors = async () => {
        try {
            setLoading(true);
            setSelectedVendor(null);
            setSelectedDate('');
            setSelectedTime('');

            if (cartItems.length === 0) {
                setVendors([]);
                setLoading(false);
                return;
            }

            const serviceIds = cartItems.map(item => item.id);
            const vendorPromises = serviceIds.map(serviceId =>
                api.getAvailableVendors({
                    serviceId: serviceId,
                    time: undefined,
                    location: null
                })
            );

            const responses = await Promise.all(vendorPromises);
            const allVendorLists = responses
                .filter(res => res.success)
                .map(res => res.data || []);

            if (allVendorLists.length === 0) {
                setVendors([]);
                setLoading(false);
                return;
            }

            const firstVendorList = allVendorLists[0];
            const commonVendors = firstVendorList.filter((vendor: any) => {
                const vendorId = vendor._id;
                return allVendorLists.every(vendorList =>
                    vendorList.some((v: any) => v._id === vendorId)
                );
            });

            setVendors(commonVendors);
        } catch (error) {
            console.error('Failed to load vendors:', error);
            setVendors([]);
        } finally {
            setLoading(false);
        }
    };

    const checkVendorAvailability = async () => {
        if (!selectedVendor || !selectedDate) return;

        try {
            setCheckingAvailability(true);
            const availabilityPromises = TIME_SLOTS.map(async (time) => {
                try {
                    const response = await api.checkVendorAvailability(
                        selectedVendor._id,
                        selectedDate,
                        time
                    );
                    return (response && response.available) ? time : null;
                } catch (error) {
                    return null;
                }
            });

            const results = await Promise.all(availabilityPromises);
            setAvailableSlots(results.filter((slot): slot is string => slot !== null));
        } catch (error) {
            console.error('Failed to check availability:', error);
            setAvailableSlots(TIME_SLOTS);
        } finally {
            setCheckingAvailability(false);
        }
    };

    const loadUserAddress = async () => {
        try {
            const response = await api.getProfile();
            if (response.success && response.data) {
                // Check for saved addresses (same as mobile app)
                const savedAddresses = response.data.savedAddresses || response.data.addresses || [];

                // Find default address
                const defaultAddress = savedAddresses.find((addr: any) => addr.isDefault);

                if (defaultAddress) {
                    // Build full address string from saved address
                    const parts = [
                        defaultAddress.addressLine1,
                        defaultAddress.addressLine2,
                        defaultAddress.city,
                        defaultAddress.state,
                        defaultAddress.pincode
                    ].filter(Boolean);
                    setAddress(parts.join(', '));
                    console.log('📍 Loaded default address:', parts.join(', '));
                } else if (savedAddresses.length > 0) {
                    // Use first address if no default
                    const firstAddr = savedAddresses[0];
                    const parts = [
                        firstAddr.addressLine1,
                        firstAddr.addressLine2,
                        firstAddr.city,
                        firstAddr.state,
                        firstAddr.pincode
                    ].filter(Boolean);
                    setAddress(parts.join(', '));
                } else if (response.data.address) {
                    // Fallback to simple address field
                    setAddress(response.data.address);
                }
            }
        } catch (error) {
            console.error('Failed to load address:', error);
        }
    };

    // 📍 Fetch current location using expo-location + OpenStreetMap for detailed address
    const fetchCurrentLocation = async () => {
        setFetchingLocation(true);
        console.log('📍 Fetching location...');

        try {
            // Request permission
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                alert('📍 Location permission denied.\n\nPlease enable location access in your browser/device settings.');
                setFetchingLocation(false);
                return;
            }

            // Get current position with high accuracy
            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const { latitude, longitude } = location.coords;
            setCoordinates({ latitude, longitude });
            console.log('📍 Got coordinates:', { latitude, longitude });

            // Use OpenStreetMap Nominatim for detailed address with POI names
            // This gives better results like "Gaur City Center" instead of just district
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                    {
                        headers: {
                            'Accept-Language': 'en',
                            'User-Agent': 'Homigo-App/1.0'
                        }
                    }
                );
                const data = await response.json();
                console.log('📍 Nominatim response:', data);

                if (data.address) {
                    const addr = data.address;
                    const parts = [];

                    // POI/Landmark name (most specific - like "Gaur City Center")
                    if (addr.amenity) parts.push(addr.amenity);
                    else if (addr.building) parts.push(addr.building);
                    else if (addr.shop) parts.push(addr.shop);
                    else if (addr.office) parts.push(addr.office);
                    else if (addr.leisure) parts.push(addr.leisure);
                    else if (addr.tourism) parts.push(addr.tourism);

                    // Neighbourhood/Suburb (like "Gaur City")
                    if (addr.neighbourhood) parts.push(addr.neighbourhood);
                    else if (addr.suburb) parts.push(addr.suburb);
                    else if (addr.residential) parts.push(addr.residential);

                    // Road/Street
                    if (addr.road) parts.push(addr.road);

                    // City/Town (like "Greater Noida")
                    if (addr.city) parts.push(addr.city);
                    else if (addr.town) parts.push(addr.town);
                    else if (addr.village) parts.push(addr.village);
                    else if (addr.county) parts.push(addr.county);

                    // State
                    if (addr.state) parts.push(addr.state);

                    // PIN code
                    if (addr.postcode) parts.push(addr.postcode);

                    const fullAddress = parts.filter(Boolean).join(', ');
                    setAddress(fullAddress);
                    console.log('📍 Address set:', fullAddress);
                } else if (data.display_name) {
                    setAddress(data.display_name);
                } else {
                    // Fallback to expo-location
                    let addressResult = await Location.reverseGeocodeAsync({ latitude, longitude });
                    if (addressResult && addressResult.length > 0) {
                        const addr = addressResult[0];
                        const parts = [addr.name, addr.street, addr.district, addr.city, addr.region, addr.postalCode];
                        setAddress(parts.filter(Boolean).join(', '));
                    }
                }
            } catch (geoError) {
                console.log('📍 OSM failed, using expo-location:', geoError);
                // Fallback to expo-location
                let addressResult = await Location.reverseGeocodeAsync({ latitude, longitude });
                if (addressResult && addressResult.length > 0) {
                    const addr = addressResult[0];
                    const parts = [addr.name, addr.street, addr.district, addr.city, addr.region, addr.postalCode];
                    setAddress(parts.filter(Boolean).join(', '));
                }
            }
        } catch (error: any) {
            console.error('📍 Location error:', error);
            alert('📍 Could not get location.\n\nPlease try again or enter address manually.');
        } finally {
            setFetchingLocation(false);
        }
    };

    const isTimeSlotAvailable = (time: string) => {
        if (!selectedVendor || !selectedDate) return false;
        if (checkingAvailability) return false;

        const today = new Date().toISOString().split('T')[0];
        if (selectedDate === today) {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            const [timeStr, period] = time.split(' ');
            const [hourStr, minuteStr] = timeStr.split(':');
            let hour = parseInt(hourStr);
            const minute = parseInt(minuteStr);

            if (period === 'PM' && hour !== 12) hour += 12;
            else if (period === 'AM' && hour === 12) hour = 0;

            if (hour < currentHour || (hour === currentHour && minute <= currentMinute)) {
                return false;
            }
        }
        return availableSlots.includes(time);
    };

    const processBooking = async () => {
        if (bookingLoading) return; // Prevent double click

        try {
            setBookingLoading(true);
            const bookingPromises = cartItems.map(item => {
                // Calculate add-ons total
                const addonsTotal = (item.addons || []).reduce((sum: number, addon: any) => sum + (Number(addon.price) || 0), 0);
                const totalItemPrice = (item.price + addonsTotal) * (item.quantity || 1);

                // Calculate total duration (assuming service has duration and addons have duration in minutes)
                // If duration is not available, backend might handle it or it defaults
                const serviceDuration = Number((item as any).duration) || 60; // Default 60 mins if missing
                const addonsDuration = (item.addons || []).reduce((sum: number, addon: any) => sum + (Number(addon.duration) || 0), 0);
                const totalDuration = serviceDuration + addonsDuration;

                const bookingData: any = {
                    serviceId: item.id,
                    vendorId: selectedVendor._id,
                    serviceName: item.title,
                    serviceImage: item.image,
                    servicePrice: item.price,
                    scheduledDate: selectedDate,
                    scheduledTime: selectedTime,
                    address: address, // Send address at root level to ensure backend captures it
                    location: {
                        latitude: coordinates?.latitude || 0,
                        longitude: coordinates?.longitude || 0,
                        address: address
                    },
                    totalAmount: totalItemPrice,
                    addons: item.addons || [],
                    items: [{
                        serviceId: item.id,
                        name: item.title,
                        price: item.price,
                        quantity: item.quantity || 1,
                        image: item.image
                    }],
                    totalDuration: totalDuration,
                    paymentMethod: selectedPayment,
                    paymentStatus: selectedPayment === 'online' ? 'paid' : 'pending'
                };
                return api.createBooking(bookingData);
            });

            const responses = await Promise.all(bookingPromises);
            const allSuccessful = responses.every(res => res.success);

            if (allSuccessful) {
                clearCart();
                alert('All bookings confirmed!');
                onNavigate('bookings');
            } else {
                alert('Some bookings failed. Please try again.');
            }
        } catch (error: any) {
            console.error('Booking error:', error);
            if (error.response?.status === 401) {
                alert('Please login to book services');
                onNavigate('login');
            } else {
                alert('Error creating booking');
            }
        } finally {
            setBookingLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <WebLayout onNavigate={onNavigate}>
                <View style={styles.container}>
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Your cart is empty</Text>
                        <TouchableOpacity style={styles.shopButton} onPress={() => onNavigate('home')}>
                            <Text style={styles.shopButtonText}>Start Shopping</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </WebLayout>
        );
    }

    return (
        <WebLayout onNavigate={onNavigate}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => onNavigate('cart')} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={styles.pageTitle}>Book Services</Text>
                    </View>

                    <View style={styles.serviceCard}>
                        <Text style={styles.sectionTitle}>Your Services ({cartItems.length})</Text>
                        {cartItems.map((item, index) => (
                            <View key={index} style={styles.cartItemRow}>
                                <Text style={styles.serviceName}>{item.title}</Text>
                                <Text style={styles.servicePrice}>₹{item.price}</Text>
                            </View>
                        ))}
                        <View style={[styles.cartItemRow, { marginTop: spacing.m, paddingTop: spacing.m, borderTopWidth: 1, borderTopColor: colors.border }]}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>₹{cartTotal.toFixed(2)}</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Select Professional</Text>
                        <Text style={styles.helperText}>
                            {loading ? 'Loading...' : `Showing professionals who provide all ${cartItems.length} services`}
                        </Text>
                        {loading ? (
                            <ActivityIndicator size="large" color={colors.primary} />
                        ) : vendors.length === 0 ? (
                            <Text style={styles.emptyText}>No professionals available for all selected services</Text>
                        ) : (
                            <View style={styles.vendorsList}>
                                {vendors.map((vendor, index) => {
                                    const isSelected = selectedVendor && selectedVendor._id === vendor._id;
                                    return (
                                        <TouchableOpacity
                                            key={vendor._id || `vendor-${index}`}
                                            style={[
                                                styles.vendorCard,
                                                isSelected && styles.vendorCardSelected
                                            ]}
                                            onPress={() => setSelectedVendor(vendor)}
                                        >
                                            <View style={styles.vendorInfo}>
                                                <View style={styles.vendorAvatar}>
                                                    <Ionicons name="person" size={24} color={colors.white} />
                                                </View>
                                                <View style={styles.vendorDetails}>
                                                    <Text style={styles.vendorName}>{vendor.name || 'Professional'}</Text>
                                                    <View style={styles.vendorRating}>
                                                        <Ionicons name="star" size={14} color="#FFB400" />
                                                        <Text style={styles.ratingText}>{vendor.rating || 4.5}</Text>
                                                        <Text style={styles.reviewCount}>({vendor.reviewCount || 120} reviews)</Text>
                                                    </View>
                                                </View>
                                            </View>
                                            {isSelected && (
                                                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Select Date</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
                            {getNextDays().map((day) => (
                                <TouchableOpacity
                                    key={day.date}
                                    style={[
                                        styles.dateCard,
                                        selectedDate === day.date && styles.dateCardSelected
                                    ]}
                                    onPress={() => setSelectedDate(day.date)}
                                >
                                    <Text style={[
                                        styles.dateLabel,
                                        selectedDate === day.date && styles.dateLabelSelected
                                    ]}>{day.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.section}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.m }}>
                            <Text style={styles.sectionTitle}>Select Time Slot</Text>
                            {checkingAvailability && (
                                <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: spacing.s }} />
                            )}
                        </View>
                        {!selectedVendor || !selectedDate ? (
                            <Text style={styles.emptyText}>Please select a professional and date first</Text>
                        ) : (
                            <View style={styles.timeGrid}>
                                {TIME_SLOTS.map((time) => {
                                    const isAvailable = isTimeSlotAvailable(time);
                                    return (
                                        <TouchableOpacity
                                            key={time}
                                            style={[
                                                styles.timeSlot,
                                                selectedTime === time && styles.timeSlotSelected,
                                                !isAvailable && styles.timeSlotDisabled
                                            ]}
                                            onPress={() => isAvailable && setSelectedTime(time)}
                                            disabled={!isAvailable}
                                        >
                                            <Text style={[
                                                styles.timeText,
                                                selectedTime === time && styles.timeTextSelected,
                                                !isAvailable && styles.timeTextDisabled
                                            ]}>{time}</Text>
                                            {!isAvailable && !checkingAvailability && (
                                                <Text style={styles.unavailableLabel}>Not Available</Text>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                    </View>

                    <View style={styles.section}>
                        <View style={styles.addressHeader}>
                            <Text style={styles.sectionTitle}>Service Address <Text style={styles.required}>*</Text></Text>
                            <TouchableOpacity
                                style={styles.locationButton}
                                onPress={fetchCurrentLocation}
                                disabled={fetchingLocation}
                            >
                                {fetchingLocation ? (
                                    <ActivityIndicator size="small" color={colors.primary[500]} />
                                ) : (
                                    <>
                                        <Ionicons name="locate" size={18} color={colors.primary[500]} />
                                        <Text style={styles.locationButtonText}>Use Current Location</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={[
                                styles.addressInput,
                                !address && styles.addressInputError
                            ]}
                            placeholder="Enter your complete address (required)"
                            placeholderTextColor={colors.textSecondary}
                            value={address}
                            onChangeText={setAddress}
                            multiline
                            numberOfLines={3}
                        />
                        {!address && (
                            <Text style={styles.errorText}>Address is required to confirm booking</Text>
                        )}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Payment Method</Text>
                        <View style={styles.paymentMethods}>
                            <TouchableOpacity
                                style={[
                                    styles.paymentCard,
                                    selectedPayment === 'cod' && styles.paymentCardSelected
                                ]}
                                onPress={() => {
                                    setSelectedPayment('cod');
                                    setIsPaymentVerified(false);
                                }}
                            >
                                <Ionicons name="cash-outline" size={24} color={selectedPayment === 'cod' ? colors.primary : colors.text} />
                                <View style={styles.paymentInfo}>
                                    <Text style={[styles.paymentTitle, selectedPayment === 'cod' && styles.paymentTitleSelected]}>Cash on Delivery</Text>
                                    <Text style={styles.paymentDesc}>Pay with cash after service</Text>
                                </View>
                                {selectedPayment === 'cod' ? (
                                    <Ionicons name="radio-button-on" size={24} color={colors.primary} />
                                ) : (
                                    <Ionicons name="radio-button-off" size={24} color={colors.textSecondary} />
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.paymentCard,
                                    selectedPayment === 'online' && styles.paymentCardSelected
                                ]}
                                onPress={() => {
                                    setSelectedPayment('online');
                                    setShowPaymentModal(true);
                                }}
                            >
                                <Ionicons name="card-outline" size={24} color={selectedPayment === 'online' ? colors.primary : colors.text} />
                                <View style={styles.paymentInfo}>
                                    <Text style={[styles.paymentTitle, selectedPayment === 'online' && styles.paymentTitleSelected]}>Online Payment</Text>
                                    <Text style={styles.paymentDesc}>UPI, Card, Net Banking</Text>
                                </View>
                                {selectedPayment === 'online' ? (
                                    <Ionicons name="radio-button-on" size={24} color={colors.primary} />
                                ) : (
                                    <Ionicons name="radio-button-off" size={24} color={colors.textSecondary} />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.bookButton,
                            (!selectedVendor || !selectedDate || !selectedTime || !address || bookingLoading) && styles.bookButtonDisabled
                        ]}
                        onPress={() => {
                            if (bookingLoading) return;

                            if (!selectedVendor || !selectedDate || !selectedTime) {
                                alert('Please select vendor, date and time');
                                return;
                            }
                            if (!address || address.trim().length < 10) {
                                alert('Please enter a valid service address (minimum 10 characters)');
                                return;
                            }

                            if (selectedPayment === 'online' && !isPaymentVerified) {
                                alert('Please complete the online payment verification.');
                                setShowPaymentModal(true);
                                return;
                            }

                            processBooking();
                        }}
                        disabled={!selectedVendor || !selectedDate || !selectedTime || !address || bookingLoading}
                    >
                        {bookingLoading ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <ActivityIndicator size="small" color={colors.white} />
                                <Text style={styles.bookButtonText}>Processing...</Text>
                            </View>
                        ) : (
                            <Text style={styles.bookButtonText}>Confirm Booking</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Payment Gateway Mock Modal */}
            <Modal
                visible={showPaymentModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => !paymentProcessing && setShowPaymentModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.paymentModalContainer}>
                        {/* Header */}
                        <View style={styles.paymentHeader}>
                            <View>
                                <Text style={styles.paymentHeaderTitle}>Homigo Payments</Text>
                                <Text style={styles.paymentHeaderSub}>Trusted by Razorpay</Text>
                            </View>
                            <View style={styles.amountBadge}>
                                <Text style={styles.amountText}>₹{cartTotal.toFixed(2)}</Text>
                            </View>
                        </View>

                        {/* Body */}
                        <ScrollView style={styles.paymentBody}>
                            <Text style={styles.paymentLabel}>Payment Options</Text>

                            {/* Card Option */}
                            <TouchableOpacity
                                style={[styles.paymentMethodRow, modalMethod === 'card' && styles.paymentMethodRowSelected]}
                                onPress={() => setModalMethod('card')}
                            >
                                <View style={modalMethod === 'card' ? styles.radioSelected : styles.radioUnselected} />
                                <Ionicons name="card-outline" size={24} color={modalMethod === 'card' ? colors.primary : colors.textSecondary} style={{ marginRight: 12 }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.methodTitle, modalMethod === 'card' && { color: colors.primary }]}>Credit / Debit Card</Text>
                                    <Text style={styles.methodSub}>Visa, Mastercard, Rupay</Text>
                                </View>
                            </TouchableOpacity>

                            {/* Card Form */}
                            {modalMethod === 'card' && (
                                <View style={styles.cardForm}>
                                    <TextInput
                                        style={styles.cardInput}
                                        placeholder="Card Number"
                                        placeholderTextColor="#94a3b8"
                                        maxLength={19}
                                        value={cardDetails.number}
                                        onChangeText={(text) => setCardDetails({ ...cardDetails, number: text })}
                                    />
                                    <View style={{ flexDirection: 'row', gap: 12 }}>
                                        <TextInput
                                            style={[styles.cardInput, { flex: 1 }]}
                                            placeholder="MM/YY"
                                            placeholderTextColor="#94a3b8"
                                            maxLength={5}
                                            value={cardDetails.expiry}
                                            onChangeText={(text) => setCardDetails({ ...cardDetails, expiry: text })}
                                        />
                                        <TextInput
                                            style={[styles.cardInput, { flex: 1 }]}
                                            placeholder="CVV"
                                            placeholderTextColor="#94a3b8"
                                            secureTextEntry
                                            maxLength={3}
                                            value={cardDetails.cvv}
                                            onChangeText={(text) => setCardDetails({ ...cardDetails, cvv: text })}
                                        />
                                    </View>
                                    <View style={styles.saveCardRow}>
                                        <Ionicons name="checkbox" size={20} color={colors.primary} />
                                        <Text style={styles.saveCardText}>Securely save card for future</Text>
                                    </View>
                                </View>
                            )}

                            {/* UPI Option */}
                            <TouchableOpacity
                                style={[styles.paymentMethodRow, modalMethod === 'upi' && styles.paymentMethodRowSelected]}
                                onPress={() => setModalMethod('upi')}
                            >
                                <View style={modalMethod === 'upi' ? styles.radioSelected : styles.radioUnselected} />
                                <Ionicons name="qr-code-outline" size={24} color={modalMethod === 'upi' ? colors.primary : colors.textSecondary} style={{ marginRight: 12 }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.methodTitle, modalMethod === 'upi' && { color: colors.primary }]}>UPI / QR Code</Text>
                                    <Text style={styles.methodSub}>GPay, PhonePe, Paytm</Text>
                                </View>
                            </TouchableOpacity>

                            {/* UPI Form */}
                            {modalMethod === 'upi' && (
                                <View style={styles.cardForm}>
                                    <TextInput
                                        style={styles.cardInput}
                                        placeholder="Enter UPI ID (e.g. user@bank)"
                                        placeholderTextColor="#94a3b8"
                                        autoCapitalize="none"
                                        value={upiId}
                                        onChangeText={setUpiId}
                                    />
                                    <TouchableOpacity style={styles.verifyButton}>
                                        <Text style={styles.verifyButtonText}>Verify VPA</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Net Banking Option */}
                            <TouchableOpacity
                                style={[styles.paymentMethodRow, modalMethod === 'netbanking' && styles.paymentMethodRowSelected]}
                                onPress={() => setModalMethod('netbanking')}
                            >
                                <View style={modalMethod === 'netbanking' ? styles.radioSelected : styles.radioUnselected} />
                                <Ionicons name="business-outline" size={24} color={modalMethod === 'netbanking' ? colors.primary : colors.textSecondary} style={{ marginRight: 12 }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.methodTitle, modalMethod === 'netbanking' && { color: colors.primary }]}>Net Banking</Text>
                                    <Text style={styles.methodSub}>All Indian Banks</Text>
                                </View>
                            </TouchableOpacity>

                            {/* Net Banking List (Mock) */}
                            {modalMethod === 'netbanking' && (
                                <View style={styles.bankGrid}>
                                    {['SBI', 'HDFC', 'ICICI', 'Axis'].map(bank => (
                                        <TouchableOpacity
                                            key={bank}
                                            style={[styles.bankItem, selectedBank === bank && { borderColor: colors.primary, backgroundColor: '#eff6ff' }]}
                                            onPress={() => setSelectedBank(bank)}
                                        >
                                            <View style={styles.bankIcon}>
                                                <Text style={styles.bankInitial}>{bank[0]}</Text>
                                            </View>
                                            <Text style={styles.bankName}>{bank}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                        </ScrollView>

                        {/* Footer */}
                        <View style={styles.paymentFooter}>
                            <TouchableOpacity
                                style={[styles.payNowButton, paymentProcessing && { opacity: 0.7 }]}
                                onPress={() => {
                                    if (modalMethod === 'card') {
                                        if (cardDetails.number.length < 10) { alert('Please enter a valid card number'); return; }
                                        if (cardDetails.expiry.length < 4) { alert('Please enter MM/YY'); return; }
                                        if (cardDetails.cvv.length < 3) { alert('Please enter CVV'); return; }
                                    }
                                    if (modalMethod === 'upi') {
                                        if (upiId.length < 3 || !upiId.includes('@')) { alert('Please enter a valid UPI ID'); return; }
                                    }
                                    if (modalMethod === 'netbanking') {
                                        if (!selectedBank) { alert('Please select a bank'); return; }
                                    }

                                    setPaymentProcessing(true);
                                    // Simulate network delay
                                    setTimeout(() => {
                                        setPaymentProcessing(false);
                                        setIsPaymentVerified(true);
                                        setShowPaymentModal(false);
                                        alert('Payment Done for Demo!');
                                    }, 2000);
                                }}
                                disabled={paymentProcessing}
                            >
                                {paymentProcessing ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.payNowText}>Pay ₹{cartTotal.toFixed(2)}</Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.cancelPaymentButton}
                                onPress={() => !paymentProcessing && setShowPaymentModal(false)}
                                disabled={paymentProcessing}
                            >
                                <Text style={styles.cancelPaymentText}>Cancel Payment</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </WebLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingBottom: spacing.xl,
    },
    content: {
        maxWidth: 900,
        alignSelf: 'center',
        width: '100%',
        padding: spacing.xl,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    backButton: {
        marginRight: spacing.m,
    },
    pageTitle: {
        ...typography.h1,
        fontSize: 32,
    },
    serviceCard: {
        backgroundColor: colors.surface,
        padding: spacing.l,
        borderRadius: borderRadius.l,
        marginBottom: spacing.xl,
        ...shadows.small,
    },
    cartItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.s,
    },
    serviceName: {
        ...typography.body,
        flex: 1,
    },
    servicePrice: {
        ...typography.bodyBold,
        color: colors.primary,
    },
    totalLabel: {
        ...typography.h3,
    },
    totalValue: {
        ...typography.h2,
        color: colors.primary,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        ...typography.h3,
        marginBottom: spacing.m,
    },
    helperText: {
        ...typography.caption,
        color: colors.textSecondary,
        marginBottom: spacing.m,
    },
    emptyText: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        padding: spacing.l,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    shopButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.m,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.m,
        marginTop: spacing.l,
    },
    shopButtonText: {
        ...typography.bodyBold,
        color: colors.white,
    },
    vendorsList: {
        gap: spacing.m,
    },
    vendorCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.m,
        backgroundColor: colors.white,
        borderRadius: borderRadius.m,
        borderWidth: 2,
        borderColor: colors.border,
        ...shadows.small,
    },
    vendorCardSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '10',
    },
    vendorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    vendorAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.m,
    },
    vendorDetails: {
        flex: 1,
    },
    vendorName: {
        ...typography.bodyBold,
        fontSize: 16,
        marginBottom: 4,
    },
    vendorRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        ...typography.caption,
        fontWeight: '600',
    },
    reviewCount: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    dateScroll: {
        marginBottom: spacing.m,
    },
    dateCard: {
        padding: spacing.m,
        paddingHorizontal: spacing.l,
        backgroundColor: colors.white,
        borderRadius: borderRadius.m,
        borderWidth: 2,
        borderColor: colors.border,
        marginRight: spacing.m,
        minWidth: 120,
        alignItems: 'center',
    },
    dateCardSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '10',
    },
    dateLabel: {
        ...typography.body,
        color: colors.text,
    },
    dateLabelSelected: {
        ...typography.bodyBold,
        color: colors.primary,
    },
    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.m,
    },
    timeSlot: {
        paddingVertical: spacing.s,
        paddingHorizontal: spacing.m,
        backgroundColor: colors.white,
        borderRadius: borderRadius.m,
        borderWidth: 2,
        borderColor: colors.border,
        minWidth: 100,
        alignItems: 'center',
    },
    timeSlotSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '10',
    },
    timeSlotDisabled: {
        backgroundColor: colors.border + '30',
        borderColor: colors.border,
        opacity: 0.5,
    },
    timeText: {
        ...typography.body,
        color: colors.text,
    },
    timeTextSelected: {
        ...typography.bodyBold,
        color: colors.primary,
    },
    timeTextDisabled: {
        color: colors.textSecondary,
        textDecorationLine: 'line-through',
    },
    unavailableLabel: {
        ...typography.caption,
        color: colors.error,
        fontSize: 10,
        marginTop: 2,
    },
    addressInput: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.m,
        padding: spacing.m,
        ...typography.body,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    addressInputError: {
        borderColor: colors.error,
        borderWidth: 2,
    },
    paymentMethods: {
        gap: spacing.m,
    },
    paymentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.m,
        backgroundColor: colors.white,
        borderRadius: borderRadius.m,
        borderWidth: 2,
        borderColor: colors.border,
        ...shadows.small,
    },
    paymentCardSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '10',
    },
    paymentInfo: {
        flex: 1,
        marginLeft: spacing.m,
    },
    paymentTitle: {
        ...typography.bodyBold,
        color: colors.text,
        marginBottom: 2,
    },
    paymentTitleSelected: {
        color: colors.primary,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    otherMethodText: {
        color: '#334155',
        fontSize: 14,
    },
    paymentFooter: {
        padding: spacing.m,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        backgroundColor: '#f8fafc',
        gap: 8,
    },
    payNowButton: {
        backgroundColor: '#10b981', // Green for success/pay
        paddingVertical: 12,
        borderRadius: 4,
        alignItems: 'center',
    },
    payNowText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelPaymentButton: {
        paddingVertical: 8,
        alignItems: 'center',
    },
    cancelPaymentText: {
        color: '#64748b',
        fontSize: 14,
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.s,
    },
    required: {
        color: colors.error,
        fontWeight: 'bold',
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.s,
        backgroundColor: colors.primary + '15',
        borderRadius: borderRadius.m,
    },
    locationButtonText: {
        ...typography.caption,
        color: colors.primary,
        marginLeft: spacing.xs,
        fontWeight: '600',
    },
    errorText: {
        ...typography.caption,
        color: colors.error,
        marginTop: spacing.xs,
    },
    bookButton: {
        backgroundColor: colors.primary,
        padding: spacing.m,
        borderRadius: borderRadius.m,
        alignItems: 'center',
        ...shadows.medium,
    },
    bookButtonDisabled: {
        backgroundColor: colors.textSecondary,
        opacity: 0.5,
    },
    bookButtonText: {
        ...typography.h3,
        color: colors.white,
    },
    paymentDesc: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paymentModalContainer: {
        width: 400,
        backgroundColor: 'white',
        borderRadius: 8,
        overflow: 'hidden',
        ...shadows.medium,
    },
    paymentHeader: {
        backgroundColor: '#1e3a8a',
        padding: spacing.m,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    paymentHeaderTitle: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
    paymentHeaderSub: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
    },
    amountBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    amountText: {
        color: 'white',
        fontWeight: 'bold',
    },
    paymentBody: {
        padding: spacing.l,
    },
    paymentLabel: {
        color: colors.textSecondary,
        fontSize: 12,
        marginBottom: spacing.m,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    paymentMethodRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
        padding: spacing.m,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        backgroundColor: '#fff',
    },
    paymentMethodRowSelected: {
        borderColor: colors.primary,
        backgroundColor: '#eff6ff',
    },
    radioSelected: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 5,
        borderColor: colors.primary,
        marginRight: 12,
    },
    radioUnselected: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: colors.textSecondary,
        marginRight: 12,
    },
    methodTitle: {
        ...typography.bodyBold,
        color: '#1e293b',
    },
    methodSub: {
        fontSize: 11,
        color: '#64748b',
    },
    cardForm: {
        marginBottom: spacing.m,
        paddingHorizontal: spacing.s,
        gap: 12,
        backgroundColor: '#f8fafc',
        padding: spacing.m,
        borderRadius: 8,
    },
    cardInput: {
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 4,
        padding: 12,
        backgroundColor: '#fff',
        fontSize: 14,
        color: '#334155',
    },
    saveCardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 8,
    },
    saveCardText: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    verifyButton: {
        backgroundColor: colors.primary,
        padding: 8,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    verifyButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    bankGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        padding: spacing.s,
        backgroundColor: '#f8fafc',
        marginBottom: spacing.m,
        borderRadius: 8,
    },
    bankItem: {
        width: '45%',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        backgroundColor: 'white',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    bankIcon: {
        width: 24,
        height: 24,
        backgroundColor: '#e2e8f0',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    bankInitial: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#475569',
    },
    bankName: {
        fontSize: 12,
        color: '#334155',
        fontWeight: '600',
    },
});
