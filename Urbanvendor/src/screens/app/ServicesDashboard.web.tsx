import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, Image, TouchableOpacity } from 'react-native';
import { Card, Text, Button, Switch, IconButton, Portal, Modal, TextInput } from 'react-native-paper';
import WebLayout from '@/components/WebLayout';
import { theme } from '@/theme/theme';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '@/store';
import { updateVendorServices } from '@/store/slices/authSlice';
import * as ImagePicker from 'expo-image-picker';
import { authAPI } from '@/services/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ServicesDashboard() {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);

    const myServices = user?.services || [];

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingService, setEditingService] = useState<any>(null);
    const [newPrice, setNewPrice] = useState('');
    const [newImage, setNewImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const toggleService = (serviceId: string, currentStatus: boolean) => {
        const updatedServices = myServices.map((s: any) =>
            s.id === serviceId ? { ...s, active: !currentStatus } : s
        );
        dispatch(updateVendorServices(updatedServices));
    };

    const deleteService = (serviceId: string) => {
        const updatedServices = myServices.filter((s: any) => s.id !== serviceId);
        dispatch(updateVendorServices(updatedServices));
    };

    const openEditModal = (service: any) => {
        setEditingService(service);
        setNewPrice(service.price ? service.price.replace(/[^0-9]/g, '') : (service.basePrice ? String(service.basePrice) : ''));
        setNewImage(service.image);
        setEditModalVisible(true);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setNewImage(result.assets[0].uri);
        }
    };

    const saveServiceChanges = async () => {
        if (!editingService) return;
        setIsUploading(true);

        let imageUrl = newImage;
        if (newImage && newImage !== editingService.image && newImage && !newImage.startsWith('http')) {
            // Upload image
            const formData = new FormData();

            if (Platform.OS === 'web') {
                const res = await fetch(newImage);
                const blob = await res.blob();
                formData.append('image', blob, 'service.jpg');
            } else {
                formData.append('image', {
                    uri: newImage,
                    name: 'service.jpg',
                    type: 'image/jpeg',
                } as any);
            }

            try {
                const response = await authAPI.uploadImage(formData);
                if (response.data.success) {
                    imageUrl = response.data.data.url;
                }
            } catch (error) {
                console.error('Failed to upload image', error);
            }
        }

        const updatedServices = myServices.map((s: any) =>
            s.id === editingService.id ? { ...s, price: `₹${newPrice}`, image: imageUrl } : s
        );

        dispatch(updateVendorServices(updatedServices));
        setIsUploading(false);
        setEditModalVisible(false);
        setEditingService(null);
    };

    return (
        <WebLayout
            title="Services"
            subtitle="Manage your service offerings and pricing."
            actions={
                <Button mode="contained" icon="plus" buttonColor={theme.colors.primary} onPress={() => (navigation as any).navigate('ServiceSelection')}>
                    Add Service
                </Button>
            }
        >
            <ScrollView style={styles.container}>
                <View style={styles.grid}>
                    {myServices.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No services added yet.</Text>
                            <Button mode="outlined" onPress={() => (navigation as any).navigate('ServiceSelection')}>
                                Add your first service
                            </Button>
                        </View>
                    ) : (
                        myServices.map((service: any) => (
                            <Card key={service.id} style={styles.card}>
                                <Card.Cover source={{ uri: service.image }} style={styles.cardImage} />
                                <Card.Content style={styles.cardContent}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.serviceName}>{service.name}</Text>
                                        <Switch
                                            value={service.active}
                                            onValueChange={() => toggleService(service.id, service.active)}
                                            color={theme.colors.primary}
                                        />
                                    </View>
                                    <Text style={styles.price}>{service.price || `₹${service.basePrice}`}</Text>
                                    <View style={styles.actions}>
                                        <Button mode="outlined" style={styles.editButton} onPress={() => openEditModal(service)}>Edit</Button>
                                        <IconButton
                                            icon="delete-outline"
                                            iconColor="#ef4444"
                                            size={20}
                                            onPress={() => deleteService(service.id)}
                                        />
                                    </View>
                                </Card.Content>
                            </Card>
                        ))
                    )}
                </View>
            </ScrollView>

            <Portal>
                <Modal visible={editModalVisible} onDismiss={() => setEditModalVisible(false)} contentContainerStyle={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Edit Service</Text>

                    <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                        {newImage ? (
                            <Image source={{ uri: newImage }} style={styles.previewImage} />
                        ) : (
                            <View style={styles.placeholderImage}>
                                <MaterialCommunityIcons name="camera" size={32} color="#94a3b8" />
                                <Text style={styles.placeholderText}>Change Image</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TextInput
                        label="Price (₹)"
                        value={newPrice}
                        onChangeText={setNewPrice}
                        keyboardType="numeric"
                        style={styles.input}
                        mode="outlined"
                    />
                    <Button
                        mode="contained"
                        onPress={saveServiceChanges}
                        style={styles.saveButton}
                        loading={isUploading}
                        disabled={isUploading}
                    >
                        Save Changes
                    </Button>
                </Modal>
            </Portal>
        </WebLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 32,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 24,
    },
    card: {
        width: 300,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        overflow: 'hidden',
    },
    cardImage: {
        height: 160,
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    serviceName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
    },
    price: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: 16,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    editButton: {
        flex: 1,
        marginRight: 8,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        color: '#64748b',
        marginBottom: 16,
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 8,
        maxWidth: 400,
        alignSelf: 'center',
        width: '100%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#1e293b',
    },
    input: {
        marginBottom: 16,
        backgroundColor: 'white',
    },
    saveButton: {
        marginTop: 8,
        backgroundColor: theme.colors.primary,
    },
    imagePicker: {
        width: '100%',
        height: 150,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        marginBottom: 16,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderImage: {
        alignItems: 'center',
    },
    placeholderText: {
        marginTop: 8,
        color: '#94a3b8',
        fontSize: 14,
    },
});
