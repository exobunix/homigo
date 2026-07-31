import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { useLocation } from '../../context/LocationContext';
import { spacing, typography, shadows, borderRadius, colors } from '../../theme/tokens';
import { AppButton } from '../../components/ui/AppButton';
import { api } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

export const CheckoutScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const { items: cartItems, cartTotal, clearCart, cancelAutoClear } = useCart();
    const { location, fullAddress } = useLocation();

    useEffect(() => {
        cancelAutoClear();
    }, []);

    const [vendors, setVendors] = useState<any[]>([]);
    const [selectedVendor, setSelectedVendor] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [loading, setLoading] = useState(true);
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [address, setAddress] = useState<string>(fullAddress || '');
    const [bookingLoading, setBookingLoading] = useState(false);
    const [fetchingLocation, setFetchingLocation] = useState(false);
    const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<'cod' | 'online'>('cod');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentProcessing, setPaymentProcessing] = useState(false);

    // Payment Modal State
    const [modalMethod, setModalMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
    const [selectedBank, setSelectedBank] = useState('');
    const [isPaymentVerified, setIsPaymentVerified] = useState(false);
    const [upiId, setUpiId] = useState('');

    // Generate next 7 days
    const getNextDays = () => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            days.push({
                date: date.toISOString().split('T')[0],
                label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
                dayNumber: date.getDate()
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
        if (fullAddress) setAddress(fullAddress);
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
                Alert.alert(
                    'Login Required',
                    'Please login to book services',
                    [
                        { text: 'Cancel', onPress: () => navigation.goBack(), style: 'cancel' },
                        { text: 'Login', onPress: () => navigation.navigate('Login') }
                    ]
                );
                return;
            }
            loadVendors();
        } catch (error) {
            console.error('Auth check failed:', error);
            navigation.goBack();
        }
    };

    const loadVendors = async () => {
        try {
            setLoading(true);
            if (cartItems.length === 0) {
                setVendors([]);
                return;
            }

            const serviceIds = cartItems.map(item => item.id);
            const vendorPromises = serviceIds.map(serviceId =>
                api.getAvailableVendors({ serviceId, time: undefined, location: null })
            );

            const responses = await Promise.all(vendorPromises);
            const allVendorLists = responses
                .filter(res => res.success)
                .map(res => res.data || []);

            if (allVendorLists.length === 0) {
                setVendors([]);
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
            setAvailableSlots(TIME_SLOTS); // Fallback
        } finally {
            setCheckingAvailability(false);
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

    // 📍 Fetch current location using expo-location
    const fetchCurrentLocation = async () => {
        setFetchingLocation(true);
        console.log('📍 Fetching location...');

        try {
            // Request permission
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Please enable location access to use this feature.');
                setFetchingLocation(false);
                return;
            }

            // Get current position
            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const { latitude, longitude } = location.coords;
            setCoordinates({ latitude, longitude });
            console.log('📍 Got coordinates:', { latitude, longitude });

            // Reverse geocode to get address
            let addressResult = await Location.reverseGeocodeAsync({ latitude, longitude });
            console.log('📍 Address result:', addressResult);

            if (addressResult && addressResult.length > 0) {
                const addr = addressResult[0];
                const parts = [
                    addr.name,
                    addr.street,
                    addr.district,
                    addr.city,
                    addr.region,
                    addr.postalCode
                ].filter(Boolean);
                setAddress(parts.join(', '));
                console.log('📍 Address set:', parts.join(', '));
            }
        } catch (error: any) {
            console.error('📍 Location error:', error);
            Alert.alert('Error', 'Could not get location. Please try again or enter address manually.');
        } finally {
            setFetchingLocation(false);
        }
    };

    const performBooking = async () => {
        try {
            setBookingLoading(true);
            const bookingPromises = cartItems.map(item => {
                // Calculate add-ons total
                const addonsTotal = (item.addons || []).reduce((sum: number, addon: any) => sum + (Number(addon.price) || 0), 0);
                const totalItemPrice = (item.price + addonsTotal) * (item.quantity || 1);

                // Calculate total duration
                const serviceDuration = Number((item as any).duration) || 60;
                const addonsDuration = (item.addons || []).reduce((sum: number, addon: any) => sum + (Number(addon.duration) || 0), 0);
                const totalDuration = serviceDuration + addonsDuration;

                const bookingData = {
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
                    totalDuration: totalDuration,
                    paymentMethod: selectedPayment,
                    paymentStatus: selectedPayment === 'online' ? 'paid' : 'pending' // Mock payment success
                };
                return api.createBooking(bookingData as any);
            });

            const responses = await Promise.all(bookingPromises);
            const allSuccessful = responses.every(res => res.success);

            if (allSuccessful) {
                clearCart();
                Alert.alert(
                    'Order Placed!',
                    'Your bookings have been confirmed.',
                    [{ text: 'OK', onPress: () => navigation.navigate('MainTabs', { screen: 'Bookings' }) }]
                );
            } else {
                Alert.alert('Error', 'Some bookings failed. Please try again.');
            }
        } catch (error) {
            console.error('Booking error:', error);
            Alert.alert('Error', 'Failed to place order.');
        } finally {
            setBookingLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (bookingLoading) return; // Prevent double click

        if (!selectedVendor || !selectedDate || !selectedTime) {
            Alert.alert('Missing Information', 'Please select a professional, date, and time.');
            return;
        }

        // ✅ Address is required
        if (!address || address.trim().length < 10) {
            Alert.alert('Missing Address', 'Please enter a valid service address (minimum 10 characters).');
            return;
        }

        if (selectedPayment === 'online' && !isPaymentVerified) {
            Alert.alert('Payment Required', 'Please complete the online payment verification.');
            setShowPaymentModal(true);
            return;
        }

        performBooking();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Checkout</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Order Summary */}
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Summary</Text>
                    {cartItems.map((item) => (
                        <View key={item.id} style={styles.orderItem}>
                            <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
                            <Text style={[styles.itemPrice, { color: colors.primary }]}>₹{item.price}</Text>
                        </View>
                    ))}
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <View style={styles.totalRow}>
                        <Text style={[styles.totalLabel, { color: colors.text }]}>Total Amount</Text>
                        <Text style={[styles.totalAmount, { color: colors.primary }]}>₹{cartTotal.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Vendor Selection */}
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Professional</Text>
                    <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                        Showing professionals who provide all services
                    </Text>

                    {loading ? (
                        <ActivityIndicator size="large" color={colors.primary} />
                    ) : vendors.length === 0 ? (
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No professionals available for all selected services</Text>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vendorScroll}>
                            {vendors.map((vendor) => {
                                const isSelected = selectedVendor && selectedVendor._id === vendor._id;
                                return (
                                    <TouchableOpacity
                                        key={vendor._id}
                                        style={[
                                            styles.vendorCard,
                                            { backgroundColor: colors.background, borderColor: isSelected ? colors.primary : colors.border },
                                            isSelected && { backgroundColor: colors.primary + '10' }
                                        ]}
                                        onPress={() => setSelectedVendor(vendor)}
                                    >
                                        <View style={[styles.vendorAvatar, { backgroundColor: colors.primary }]}>
                                            <Ionicons name="person" size={20} color="#fff" />
                                        </View>
                                        <Text style={[styles.vendorName, { color: colors.text }]}>{vendor.name}</Text>
                                        <View style={styles.ratingContainer}>
                                            <Ionicons name="star" size={12} color="#FFB400" />
                                            <Text style={[styles.ratingText, { color: colors.text }]}>{vendor.rating || 4.5}</Text>
                                        </View>
                                        {isSelected && (
                                            <View style={styles.checkIcon}>
                                                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    )}
                </View>

                {/* Date Selection */}
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Date</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {getNextDays().map((day) => {
                            const isSelected = selectedDate === day.date;
                            return (
                                <TouchableOpacity
                                    key={day.date}
                                    style={[
                                        styles.dateCard,
                                        { backgroundColor: colors.background, borderColor: isSelected ? colors.primary : colors.border },
                                        isSelected && { backgroundColor: colors.primary + '10' }
                                    ]}
                                    onPress={() => setSelectedDate(day.date)}
                                >
                                    <Text style={[styles.dayName, { color: isSelected ? colors.primary : colors.textSecondary }]}>{day.dayName}</Text>
                                    <Text style={[styles.dayNumber, { color: isSelected ? colors.primary : colors.text }]}>{day.dayNumber}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Time Selection */}
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <View style={styles.timeHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Time</Text>
                        {checkingAvailability && <ActivityIndicator size="small" color={colors.primary} />}
                    </View>

                    {!selectedVendor || !selectedDate ? (
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Please select professional and date first</Text>
                    ) : (
                        <View style={styles.timeGrid}>
                            {TIME_SLOTS.map((time) => {
                                const isAvailable = isTimeSlotAvailable(time);
                                const isSelected = selectedTime === time;
                                return (
                                    <TouchableOpacity
                                        key={time}
                                        style={[
                                            styles.timeSlot,
                                            { backgroundColor: colors.background, borderColor: isSelected ? colors.primary : colors.border },
                                            !isAvailable && { opacity: 0.5, backgroundColor: colors.border + '30' },
                                            isSelected && { backgroundColor: colors.primary + '10' }
                                        ]}
                                        onPress={() => isAvailable && setSelectedTime(time)}
                                        disabled={!isAvailable}
                                    >
                                        <Text style={[
                                            styles.timeText,
                                            { color: isSelected ? colors.primary : colors.text },
                                            !isAvailable && { textDecorationLine: 'line-through', color: colors.textSecondary }
                                        ]}>{time}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* Address */}
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <View style={styles.addressHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Service Address <Text style={{ color: colors.error }}>*</Text></Text>
                        <TouchableOpacity
                            style={[styles.locationButton, { backgroundColor: colors.primary + '15' }]}
                            onPress={fetchCurrentLocation}
                            disabled={fetchingLocation}
                        >
                            {fetchingLocation ? (
                                <ActivityIndicator size="small" color={colors.primary} />
                            ) : (
                                <>
                                    <Ionicons name="locate" size={18} color={colors.primary} />
                                    <Text style={[styles.locationButtonText, { color: colors.primary }]}>Use Current Location</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={[styles.addressInput, { color: colors.text, borderColor: address ? colors.border : colors.error, backgroundColor: colors.background }]}
                        value={address}
                        onChangeText={setAddress}
                        placeholder="Enter your complete address (required)"
                        placeholderTextColor={colors.textSecondary}
                        multiline
                    />
                    {!address && (
                        <Text style={[styles.errorText, { color: colors.error }]}>Address is required to confirm booking</Text>
                    )}
                </View>

                {/* Payment Method */}
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>

                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            {
                                borderColor: selectedPayment === 'cod' ? colors.primary : colors.border,
                                backgroundColor: selectedPayment === 'cod' ? colors.primary + '10' : colors.background
                            }
                        ]}
                        onPress={() => {
                            setSelectedPayment('cod');
                            setIsPaymentVerified(false);
                        }}
                    >
                        <View style={styles.paymentIconContainer}>
                            <Ionicons name="cash-outline" size={24} color={selectedPayment === 'cod' ? colors.primary : colors.text} />
                        </View>
                        <View style={styles.paymentInfo}>
                            <Text style={[styles.paymentTitle, { color: colors.text }]}>Cash on Delivery</Text>
                            <Text style={[styles.paymentSub, { color: colors.textSecondary }]}>Pay with cash after service</Text>
                        </View>
                        {selectedPayment === 'cod' && (
                            <Ionicons name="radio-button-on" size={24} color={colors.primary} />
                        )}
                        {selectedPayment !== 'cod' && (
                            <Ionicons name="radio-button-off" size={24} color={colors.textSecondary} />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            {
                                borderColor: selectedPayment === 'online' ? colors.primary : colors.border,
                                backgroundColor: selectedPayment === 'online' ? colors.primary + '10' : colors.background,
                                marginTop: 12
                            }
                        ]}
                        onPress={() => {
                            setSelectedPayment('online');
                            // Only open modal if not already verified (or if user wants to change?)
                            // For simplicity, always open if they tap card, but check verification status
                            setShowPaymentModal(true);
                        }}
                    >
                        <View style={styles.paymentIconContainer}>
                            <Ionicons name="card-outline" size={24} color={selectedPayment === 'online' ? colors.primary : colors.text} />
                        </View>
                        <View style={styles.paymentInfo}>
                            <Text style={[styles.paymentTitle, { color: colors.text }]}>Online Payment</Text>
                            <Text style={[styles.paymentSub, { color: colors.textSecondary }]}>UPI, Card, Net Banking</Text>
                        </View>
                        {selectedPayment === 'online' && (
                            <Ionicons name="radio-button-on" size={24} color={colors.primary} />
                        )}
                        {selectedPayment !== 'online' && (
                            <Ionicons name="radio-button-off" size={24} color={colors.textSecondary} />
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                <AppButton
                    title={bookingLoading ? "Processing..." : "Confirm Booking"}
                    onPress={handlePlaceOrder}
                    disabled={bookingLoading || !selectedVendor || !selectedDate || !selectedTime}
                />
            </View>

            {/* Simulated Payment Gateway Modal */}
            <Modal
                visible={showPaymentModal}
                transparent={true}
                animationType="slide"
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
                                        keyboardType="numeric"
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
                                            keyboardType="numeric"
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
                                    // Validation
                                    if (modalMethod === 'card') {
                                        if (cardDetails.number.length < 10) { Alert.alert('Invalid Card', 'Please enter a valid card number'); return; }
                                        if (cardDetails.expiry.length < 4) { Alert.alert('Invalid Expiry', 'Please enter MM/YY'); return; }
                                        if (cardDetails.cvv.length < 3) { Alert.alert('Invalid CVV', 'Please enter CVV'); return; }
                                    }
                                    if (modalMethod === 'upi') {
                                        if (upiId.length < 3 || !upiId.includes('@')) { Alert.alert('Invalid UPI', 'Please enter a valid UPI ID'); return; }
                                    }
                                    if (modalMethod === 'netbanking') {
                                        if (!selectedBank) { Alert.alert('Select Bank', 'Please select a bank'); return; }
                                    }

                                    setPaymentProcessing(true);
                                    // Simulate network delay
                                    setTimeout(() => {
                                        setPaymentProcessing(false);
                                        setIsPaymentVerified(true);
                                        setShowPaymentModal(false);
                                        Alert.alert('Payment Done', 'Payment Done for Demo!');
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
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.m,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: spacing.xs,
    },
    headerTitle: {
        ...typography.h2,
    },
    content: {
        padding: spacing.m,
    },
    section: {
        padding: spacing.m,
        borderRadius: borderRadius.m,
        marginBottom: spacing.m,
        ...shadows.small,
    },
    sectionTitle: {
        ...typography.h3,
        marginBottom: spacing.s,
    },
    helperText: {
        ...typography.caption,
        marginBottom: spacing.m,
    },
    orderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.s,
    },
    itemTitle: {
        ...typography.body,
        flex: 1,
    },
    itemPrice: {
        ...typography.bodyBold,
    },
    divider: {
        height: 1,
        marginVertical: spacing.m,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        ...typography.h3,
    },
    totalAmount: {
        ...typography.h2,
    },
    vendorScroll: {
        flexDirection: 'row',
    },
    vendorCard: {
        width: 120,
        padding: spacing.m,
        borderRadius: borderRadius.m,
        borderWidth: 2,
        marginRight: spacing.m,
        alignItems: 'center',
    },
    vendorAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.s,
    },
    vendorName: {
        ...typography.bodyBold,
        textAlign: 'center',
        marginBottom: 4,
        fontSize: 12,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        ...typography.caption,
        fontWeight: '600',
    },
    checkIcon: {
        position: 'absolute',
        top: 4,
        right: 4,
    },
    dateCard: {
        padding: spacing.m,
        borderRadius: borderRadius.m,
        borderWidth: 2,
        marginRight: spacing.m,
        alignItems: 'center',
        minWidth: 70,
    },
    dayName: {
        ...typography.caption,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    dayNumber: {
        ...typography.h3,
    },
    timeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.m,
    },
    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.s,
    },
    timeSlot: {
        paddingVertical: spacing.s,
        paddingHorizontal: spacing.m,
        borderRadius: borderRadius.m,
        borderWidth: 1,
        minWidth: '30%',
        alignItems: 'center',
        marginBottom: spacing.s,
    },
    timeText: {
        ...typography.caption,
        fontWeight: '600',
    },
    addressInput: {
        borderWidth: 1,
        borderRadius: borderRadius.m,
        padding: spacing.m,
        minHeight: 80,
        textAlignVertical: 'top',
        ...typography.body,
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.s,
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.s,
        borderRadius: borderRadius.m,
    },
    locationButtonText: {
        ...typography.caption,
        marginLeft: spacing.xs,
        fontWeight: '600',
    },
    errorText: {
        ...typography.caption,
        marginTop: spacing.xs,
    },
    emptyText: {
        ...typography.body,
        textAlign: 'center',
        padding: spacing.m,
    },
    footer: {
        padding: spacing.m,
        borderTopWidth: 1,
        ...shadows.medium,
    },
    placeOrderButton: {
        width: '100%',
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.m,
        borderRadius: borderRadius.m,
        borderWidth: 2,
    },
    paymentIconContainer: {
        marginRight: spacing.m,
    },
    paymentInfo: {
        flex: 1,
    },
    paymentTitle: {
        ...typography.bodyBold,
        marginBottom: 2,
    },
    paymentSub: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paymentModalContainer: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 8,
        overflow: 'hidden',
        ...shadows.medium,
    },
    paymentHeader: {
        backgroundColor: '#1e3a8a', // Dark blue like generic gateway
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
});
