import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import * as Location from 'expo-location';
import { AppButton } from '../../components/ui/AppButton';
import { AppInput } from '../../components/ui/AppInput';
import { api } from '../../services/api';

export const ManageAddressesScreen = ({ navigation }: any) => {
    const { colors, isDark } = useTheme();
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    const [newAddress, setNewAddress] = useState({
        type: 'Home',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const response = await api.getProfile();
            if (response.success && response.data) {
                const userAddresses = response.data.savedAddresses || response.data.addresses || [];
                console.log('ManageAddresses - Fetched addresses:', JSON.stringify(userAddresses, null, 2));
                setAddresses(userAddresses);
            }
        } catch (error) {
            console.error('Failed to fetch addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGetCurrentLocation = async () => {
        setIsLocating(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Allow location access to detect your address.');
                setIsLocating(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            let address = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            if (address && address.length > 0) {
                const current = address[0];
                const street = `${current.street || ''} ${current.name || ''}`.trim();

                setNewAddress({
                    type: 'Current Location',
                    addressLine1: street || 'Current Location',
                    addressLine2: current.district || '',
                    city: current.city || current.region || '',
                    state: current.region || current.city || '',
                    pincode: current.postalCode || '000000',
                    isDefault: false
                });
                setIsEditing(false);
                setEditingId(null);
                setIsModalVisible(true);
            }
        } catch (error) {
            Alert.alert('Error', 'Could not fetch location');
        } finally {
            setIsLocating(false);
        }
    };

    const handleSaveAddress = async () => {
        if (!newAddress.addressLine1 || !newAddress.city || !newAddress.pincode) {
            Alert.alert('Error', 'Please fill all required fields (Address, City, Pincode)');
            return;
        }

        try {
            if (isEditing && editingId) {
                // Update existing address
                const updatedAddresses = addresses.map(addr =>
                    addr._id === editingId
                        ? { ...addr, ...newAddress }
                        : newAddress.isDefault ? { ...addr, isDefault: false } : addr
                );

                const response = await api.updateProfile({ savedAddresses: updatedAddresses });

                if (response.success) {
                    Alert.alert('Success', 'Address updated successfully');
                    await fetchAddresses();
                }
            } else {
                // Add new address
                const response = await api.addAddress({
                    type: newAddress.type,
                    addressLine1: newAddress.addressLine1,
                    addressLine2: newAddress.addressLine2,
                    city: newAddress.city,
                    state: newAddress.state,
                    pincode: newAddress.pincode,
                    isDefault: addresses.length === 0 || newAddress.isDefault
                });

                if (response.success) {
                    Alert.alert('Success', 'Address saved successfully');
                    await fetchAddresses();
                }
            }

            setIsModalVisible(false);
            setIsEditing(false);
            setEditingId(null);
            setNewAddress({ type: 'Home', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', isDefault: false });
        } catch (error) {
            console.error('Failed to save address:', error);
            Alert.alert('Error', 'Failed to save address. Please try again.');
        }
    };

    const handleSetDefault = async (addressId: string) => {
        try {
            const updatedAddresses = addresses.map(addr => ({
                ...addr,
                isDefault: addr._id === addressId
            }));

            const response = await api.updateProfile({ savedAddresses: updatedAddresses });

            if (response.success) {
                await fetchAddresses();
            }
        } catch (error) {
            console.error('Failed to set default address:', error);
        }
    };

    const handleEdit = (item: any) => {
        setNewAddress({
            type: item.type,
            addressLine1: item.addressLine1 || '',
            addressLine2: item.addressLine2 || '',
            city: item.city,
            state: item.state || '',
            pincode: item.pincode || '',
            isDefault: item.isDefault
        });
        setEditingId(item._id);
        setIsEditing(true);
        setIsModalVisible(true);
    };

    const handleDelete = async (addressId: string) => {
        try {
            const updatedAddresses = addresses.filter(addr => addr._id !== addressId);
            const response = await api.updateProfile({ savedAddresses: updatedAddresses });

            if (response.success) {
                Alert.alert('Success', 'Address deleted');
                await fetchAddresses();
            }
        } catch (error) {
            console.error('Failed to delete address:', error);
            Alert.alert('Error', 'Failed to delete address');
        }
    };

    const handleAddNew = () => {
        setIsEditing(false);
        setEditingId(null);
        setNewAddress({ type: 'Home', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', isDefault: false });
        setIsModalVisible(true);
    };

    const getIconName = (type: string) => {
        switch (type) {
            case 'Home': return 'home';
            case 'Office': return 'briefcase';
            case 'Current Location': return 'navigate-circle';
            default: return 'location';
        }
    };

    const renderItem = ({ item }: any) => (
        <TouchableOpacity
            style={[
                styles.addressCard,
                {
                    backgroundColor: colors.surface,
                    borderColor: item.isDefault ? colors.primary : colors.border,
                    borderWidth: item.isDefault ? 2 : 1
                }
            ]}
            onPress={() => handleSetDefault(item._id)}
        >
            <View style={styles.cardHeader}>
                <View style={styles.typeContainer}>
                    <Ionicons
                        name={getIconName(item.type)}
                        size={20}
                        color={colors.primary}
                    />
                    <Text style={[styles.addressType, { color: colors.text }]}>{item.type || 'Address'}</Text>
                </View>
                {item.isDefault && (
                    <View style={[styles.defaultBadge, { backgroundColor: colors.primary + '20' }]}>
                        <Text style={[styles.defaultText, { color: colors.primary }]}>Selected</Text>
                    </View>
                )}
            </View>

            <Text style={[styles.addressText, { color: colors.textSecondary }]}>{item.addressLine1}</Text>
            {item.addressLine2 ? <Text style={[styles.addressText, { color: colors.textSecondary, fontSize: 13 }]}>{item.addressLine2}</Text> : null}
            <Text style={[styles.cityText, { color: colors.textSecondary }]}>{item.city}, {item.state} - {item.pincode}</Text>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEdit(item)}
                >
                    <Ionicons name="create-outline" size={20} color={colors.primary} />
                    <Text style={[styles.actionText, { color: colors.primary }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                        Alert.alert(
                            "Delete Address",
                            "Are you sure you want to delete this address?",
                            [
                                { text: "Cancel", style: "cancel" },
                                { text: "Delete", style: "destructive", onPress: () => handleDelete(item._id) }
                            ]
                        );
                    }}
                >
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                    <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Manage Addresses</Text>
                <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
                    <Ionicons name="add" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.container}>
                <View style={styles.currentLocationSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Detect Current Location</Text>
                    <View style={[styles.currentLocationCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
                        <View style={styles.locationRow}>
                            <Ionicons name="navigate-circle" size={24} color={colors.primary} />
                            <View style={styles.locationTextContainer}>
                                <Text style={[styles.addressText, { color: colors.text }]}>
                                    {isLocating ? 'Detecting location...' : 'Tap button to detect and save your current location'}
                                </Text>
                            </View>
                        </View>
                        <AppButton
                            title={isLocating ? "Detecting..." : "Detect & Save Location"}
                            onPress={handleGetCurrentLocation}
                            variant="outline"
                            style={{ marginTop: spacing.s }}
                            disabled={isLocating}
                            icon={<Ionicons name="locate" size={20} color={colors.primary} />}
                        />
                    </View>
                </View>

                <View style={styles.savedAddressesSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Saved Addresses</Text>
                    {loading ? (
                        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
                    ) : (
                        <FlatList
                            data={addresses}
                            keyExtractor={(item) => item._id || item.id || Math.random().toString()}
                            scrollEnabled={false}
                            contentContainerStyle={styles.listContent}
                            renderItem={renderItem}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <Ionicons name="location-outline" size={64} color={colors.textSecondary} />
                                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No addresses saved yet</Text>
                                </View>
                            }
                        />
                    )}
                </View>
            </ScrollView>

            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? colors.surface : colors.white }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                {isEditing ? 'Edit Address' : 'Add New Address'}
                            </Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <View style={styles.typeSelector}>
                                {['Current Location', 'Home', 'Office', 'Other'].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.typeOption,
                                            {
                                                backgroundColor: newAddress.type === type ? colors.primary : colors.background,
                                                borderColor: colors.border
                                            }
                                        ]}
                                        onPress={() => setNewAddress({ ...newAddress, type })}
                                    >
                                        <Text style={[
                                            styles.typeOptionText,
                                            { color: newAddress.type === type ? colors.white : colors.text }
                                        ]}>{type}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <AppInput
                                label="Address Line 1 *"
                                value={newAddress.addressLine1}
                                onChangeText={(text) => setNewAddress({ ...newAddress, addressLine1: text })}
                                placeholder="Street, Building name"
                            />

                            <AppInput
                                label="Address Line 2"
                                value={newAddress.addressLine2}
                                onChangeText={(text) => setNewAddress({ ...newAddress, addressLine2: text })}
                                placeholder="Area, Landmark"
                            />

                            <AppInput
                                label="City *"
                                value={newAddress.city}
                                onChangeText={(text) => setNewAddress({ ...newAddress, city: text })}
                                placeholder="Enter city"
                            />

                            <AppInput
                                label="State"
                                value={newAddress.state}
                                onChangeText={(text) => setNewAddress({ ...newAddress, state: text })}
                                placeholder="Enter state"
                            />

                            <AppInput
                                label="Pincode *"
                                value={newAddress.pincode}
                                onChangeText={(text) => setNewAddress({ ...newAddress, pincode: text })}
                                placeholder="Enter pincode"
                                keyboardType="number-pad"
                                maxLength={6}
                            />

                            <AppButton
                                title={isEditing ? "Update Address" : "Save Address"}
                                onPress={handleSaveAddress}
                                style={{ marginTop: spacing.l }}
                            />
                        </ScrollView>
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
    addButton: {
        padding: spacing.xs,
    },
    listContent: {
        padding: spacing.m,
    },
    addressCard: {
        borderRadius: borderRadius.m,
        padding: spacing.m,
        marginBottom: spacing.m,
        ...shadows.small,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.s,
    },
    typeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addressType: {
        ...typography.bodyBold,
        marginLeft: spacing.s,
    },
    defaultBadge: {
        paddingHorizontal: spacing.s,
        paddingVertical: 2,
        borderRadius: borderRadius.s,
    },
    defaultText: {
        ...typography.caption,
        fontWeight: 'bold',
    },
    addressText: {
        ...typography.body,
        marginBottom: 4,
    },
    cityText: {
        ...typography.caption,
        marginBottom: spacing.m,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: spacing.s,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: spacing.l,
    },
    actionText: {
        ...typography.caption,
        fontWeight: '600',
        marginLeft: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
        marginTop: spacing.xl,
    },
    emptyText: {
        ...typography.body,
        marginTop: spacing.m,
        marginBottom: spacing.m,
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
        marginBottom: spacing.l,
    },
    modalTitle: {
        ...typography.h2,
    },
    modalBody: {
        flex: 1,
    },
    typeSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: spacing.m,
        gap: spacing.s,
    },
    typeOption: {
        paddingVertical: spacing.s,
        paddingHorizontal: spacing.m,
        borderRadius: borderRadius.m,
        borderWidth: 1,
    },
    typeOptionText: {
        ...typography.caption,
        fontWeight: 'bold',
    },
    currentLocationSection: {
        padding: spacing.m,
    },
    sectionTitle: {
        ...typography.h3,
        marginBottom: spacing.s,
    },
    currentLocationCard: {
        padding: spacing.m,
        borderRadius: borderRadius.m,
        borderWidth: 1,
        ...shadows.small,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.m,
    },
    locationTextContainer: {
        flex: 1,
        marginLeft: spacing.m,
    },
    savedAddressesSection: {
        flex: 1,
        padding: spacing.m,
    },
});
