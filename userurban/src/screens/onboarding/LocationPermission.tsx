import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity, Modal, FlatList, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/ui/AppButton';
import { useTheme } from '../../context/ThemeContext';
import { useLocation } from '../../context/LocationContext';
import { spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

const CITIES = [
    'New Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'
];

export const LocationPermission = ({ navigation }: any) => {
    const { colors, isDark } = useTheme();
    const { setLocation, setCity, setFullAddress, addAddress } = useLocation();
    const [pulseAnim] = useState(new Animated.Value(1));
    const [isLocating, setIsLocating] = useState(false);
    const [fetchedAddress, setFetchedAddress] = useState<string | null>(null);
    const [locationCoords, setLocationCoords] = useState<{ latitude: number, longitude: number } | null>(null);
    const [isCityModalVisible, setIsCityModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const startPulse = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 1000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        startPulse();
    }, []);



    const handleGetCurrentLocation = async () => {
        setIsLocating(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                alert('Permission to access location was denied');
                setIsLocating(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            let address = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            if (address && address.length > 0) {
                const currentAddress = address[0];
                // Create a shorter address format: "Area, City"
                // Priority: name (often building name), street, district, subregion
                const area = currentAddress.name || currentAddress.street || currentAddress.district || currentAddress.subregion || '';
                const cityVal = currentAddress.city || currentAddress.region || '';

                const formattedAddress = area ? `${area}, ${cityVal}` : cityVal;
                const fullAddressStr = `${currentAddress.street || ''} ${currentAddress.city || ''}, ${currentAddress.region || ''}, ${currentAddress.country || ''}`;
                const city = currentAddress.city || currentAddress.subregion || "Unknown City";

                setFetchedAddress(fullAddressStr); // Show full address on this screen
                setLocation(formattedAddress); // Save short address for header
                setFullAddress(fullAddressStr); // Save full address for details
                setCity(city);
                setLocationCoords({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                });

                // Add to saved addresses in Context
                addAddress({
                    id: 'current-loc',
                    type: 'Current Location',
                    address: fullAddressStr,
                    city: city,
                    isDefault: true
                });

                // Save to Backend
                try {
                    const { api } = require('../../services/api');
                    const street = currentAddress.street || currentAddress.name || 'Current Location';
                    await api.addAddress({
                        type: 'Current Location',
                        addressLine1: street,
                        addressLine2: currentAddress.district || currentAddress.subregion || '',
                        city: city,
                        state: currentAddress.region || city,
                        pincode: currentAddress.postalCode || '000000',
                        isDefault: true
                    });
                    console.log('Address saved to backend');
                } catch (err: any) {
                    // Suppress errors for unauthenticated users
                    if (err.response?.status === 401) {
                        console.log('User skipped login, address not saved to backend');
                    } else {
                        console.log('Failed to save address to backend (ignoring)');
                    }
                }

            } else {
                setFetchedAddress("Location found but address unavailable");
                setLocation("Unknown Location");
            }
        } catch (error) {
            console.log(error);
            alert('Error fetching location');
        } finally {
            setIsLocating(false);
        }
    };

    const handleContinue = () => {
        navigation.replace('MainTabs');
    };

    const handleSelectCity = async (city: string) => {
        setCity(city);
        setLocation(city); // Use just the city name for the header
        setFullAddress(`${city}, India`);
        setIsCityModalVisible(false);

        // Save manual city selection to backend as a default address
        try {
            const { api } = require('../../services/api');
            await api.addAddress({
                type: 'Home',
                addressLine1: city,
                addressLine2: 'India',
                city: city,
                state: 'India',
                pincode: '000000',
                isDefault: true
            });
            console.log('Manual city saved to backend');
        } catch (err: any) {
            if (err.response?.status === 401) {
                console.log('User skipped login, city not saved to backend');
            } else {
                console.log('Failed to save manual city to backend (ignoring)');
            }
        }

        navigation.replace('MainTabs');
    };

    const filteredCities = CITIES.filter(city => city.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    {locationCoords ? (
                        <View style={styles.mapContainer}>
                            <MapView
                                style={styles.map}
                                initialRegion={{
                                    latitude: locationCoords.latitude,
                                    longitude: locationCoords.longitude,
                                    latitudeDelta: 0.005,
                                    longitudeDelta: 0.005,
                                }}
                            >
                                <Marker coordinate={locationCoords} />
                            </MapView>
                        </View>
                    ) : (
                        <>
                            <Animated.View
                                style={[
                                    styles.pulseRing,
                                    {
                                        transform: [{ scale: pulseAnim }],
                                        backgroundColor: colors.primary + '20',
                                    },
                                ]}
                            />
                            <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
                                <Ionicons name="location" size={40} color="#FFFFFF" />
                            </View>
                        </>
                    )}
                </View>

                {!locationCoords && (
                    <>
                        <Text style={[styles.title, { color: colors.text }]}>
                            {fetchedAddress ? "Location Fetched" : "Find services near you"}
                        </Text>
                        <Text style={[styles.description, { color: colors.textSecondary }]}>
                            {fetchedAddress
                                ? `We found you at:\n${fetchedAddress}`
                                : "By allowing location access, you can search for services and providers near your location."}
                        </Text>
                    </>
                )}

                <View style={styles.buttonContainer}>
                    {!fetchedAddress ? (
                        <>
                            <AppButton
                                title={isLocating ? "Fetching Location..." : "Use Current Location"}
                                onPress={handleGetCurrentLocation}
                                style={styles.primaryButton}
                                disabled={isLocating}
                            />
                            <TouchableOpacity
                                style={[styles.secondaryButton, { borderColor: colors.border }]}
                                onPress={() => setIsCityModalVisible(true)}
                            >
                                <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Select City Manually</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <AppButton
                            title="Continue to Dashboard"
                            onPress={handleContinue}
                            style={styles.primaryButton}
                        />
                    )}
                </View>
            </View>

            <Modal
                visible={isCityModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsCityModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? colors.surface : colors.white }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Select City</Text>
                            <TouchableOpacity onPress={() => setIsCityModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.searchContainer, { backgroundColor: isDark ? colors.background : '#F5F5F5' }]}>
                            <Ionicons name="search" size={20} color={colors.textSecondary} />
                            <TextInput
                                style={[styles.searchInput, { color: colors.text }]}
                                placeholder="Search for your city"
                                placeholderTextColor={colors.textSecondary}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>

                        <FlatList
                            data={filteredCities}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.cityItem, { borderBottomColor: colors.border }]}
                                    onPress={() => handleSelectCity(item)}
                                >
                                    <Ionicons name="location-outline" size={20} color={colors.textSecondary} style={{ marginRight: spacing.s }} />
                                    <Text style={[styles.cityText, { color: colors.text }]}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
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
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.l,
        width: '100%',
    },
    pulseRing: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.medium,
    },
    title: {
        ...typography.h1,
        textAlign: 'center',
        marginBottom: spacing.m,
    },
    description: {
        ...typography.body,
        textAlign: 'center',
        marginBottom: spacing.xxl,
        paddingHorizontal: spacing.m,
    },
    buttonContainer: {
        width: '100%',
        gap: spacing.m,
    },
    primaryButton: {
        width: '100%',
    },
    secondaryButton: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: borderRadius.m,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        ...typography.bodyBold,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        padding: spacing.l,
        height: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.m,
    },
    modalTitle: {
        ...typography.h2,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.s,
        borderRadius: borderRadius.m,
        marginBottom: spacing.m,
    },
    searchInput: {
        flex: 1,
        marginLeft: spacing.s,
        fontSize: 16,
    },
    cityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.m,
        borderBottomWidth: 1,
    },
    cityText: {
        ...typography.body,
    },
    mapContainer: {
        marginTop: -spacing.l,
        width: '120%',
        height: 500,
        borderRadius: borderRadius.m,
        overflow: 'hidden',
        ...shadows.medium,
        marginBottom: spacing.m,
    },
    map: {
        width: '100%',
        height: '100%',
    },
});
