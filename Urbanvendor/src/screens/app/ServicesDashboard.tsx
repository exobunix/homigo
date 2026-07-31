import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Platform, Image } from 'react-native';
import { Card, Title, Text, Button, Chip, Portal, Modal, TextInput, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { useAppSelector, useAppDispatch } from '@/store';
import { updateVendorServices } from '@/store/slices/authSlice';
import { authAPI } from '@/services/api';

export default function ServicesDashboard({ navigation }: any) {
  const { width: windowWidth } = useWindowDimensions();
  const isLargeScreen = Platform.OS === 'web' && windowWidth >= 900;
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);

  const currentServices = user?.services || [];

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [newPrice, setNewPrice] = useState('');
  const [newImage, setNewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const toggleService = (serviceId: string, currentStatus: boolean) => {
    const updatedServices = currentServices.map((s: any) =>
      s.id === serviceId ? { ...s, active: !currentStatus } : s
    );
    dispatch(updateVendorServices(updatedServices));
  };

  const deleteService = (serviceId: string) => {
    const updatedServices = currentServices.filter((s: any) => s.id !== serviceId);
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
    if (newImage && newImage !== editingService.image && !newImage.startsWith('http')) {
      // Upload image
      const formData = new FormData();
      formData.append('image', {
        uri: newImage,
        name: 'service.jpg',
        type: 'image/jpeg',
      } as any);

      try {
        const response = await authAPI.uploadImage(formData);
        if (response.data.success) {
          imageUrl = response.data.data.url;
        }
      } catch (error) {
        console.error('Failed to upload image', error);
      }
    }

    const updatedServices = currentServices.map((s: any) =>
      s.id === editingService.id ? { ...s, price: `₹${newPrice}`, image: imageUrl } : s
    );

    dispatch(updateVendorServices(updatedServices));
    setIsUploading(false);
    setEditModalVisible(false);
    setEditingService(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.innerContent, isLargeScreen && styles.innerContentLarge]}>
          {/* Header */}
          <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerTextBlock}>
                <Text style={styles.headerTitle}>Your Services</Text>
                <Text style={styles.headerSubtitle}>
                  Manage what you offer and keep your catalog up to date.
                </Text>
              </View>
              <View style={styles.headerIconBlock}>
                <View style={styles.headerIconCircle}>
                  <MaterialCommunityIcons name="briefcase" size={28} color="#ffffff" />
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Add Services */}
          <Card style={styles.sectionCard}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Title style={styles.sectionTitle}>Add Services</Title>
                <Text style={styles.sectionSubtitle}>Grow your business with more categories</Text>
              </View>

              <TouchableOpacity
                style={styles.addServiceCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('ServiceSelection')}
              >
                <View style={styles.addServiceIconWrapper}>
                  <MaterialCommunityIcons name="plus-circle" size={28} color="#6366f1" />
                </View>
                <View style={styles.addServiceTextBlock}>
                  <Text style={styles.addServiceTitle}>Add new services</Text>
                  <Text style={styles.addServiceSubtitle}>
                    Tap to choose more categories you want to provide.
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#64748b" />
              </TouchableOpacity>
            </Card.Content>
          </Card>

          {/* Current Services */}
          <Card style={styles.sectionCard}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Title style={styles.sectionTitle}>Current Services</Title>
                <Chip style={styles.countChip} textStyle={{ color: 'white' }}>{currentServices.length}</Chip>
              </View>

              {currentServices.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons
                    name="briefcase-outline"
                    size={60}
                    color="#94a3b8"
                  />
                  <Text style={styles.emptyTitle}>No services added yet</Text>
                  <Text style={styles.emptyText}>
                    Tap "Add Services" above to start adding categories you provide.
                  </Text>
                </View>
              ) : (
                <View style={styles.servicesList}>
                  {currentServices.map((service: any) => {
                    const color = service.color || '#6366f1';
                    return (
                      <TouchableOpacity
                        key={service.id}
                        style={styles.serviceItem}
                        activeOpacity={0.85}
                      >
                        <View style={styles.serviceLeft}>
                          <View
                            style={[
                              styles.serviceIconCircle,
                              { backgroundColor: `${color}20`, overflow: 'hidden' },
                            ]}
                          >
                            {service.image ? (
                              <Image
                                source={{ uri: service.image }}
                                style={{ width: '100%', height: '100%' }}
                                resizeMode="cover"
                              />
                            ) : (
                              <MaterialCommunityIcons
                                name={service.icon as any}
                                size={22}
                                color={color}
                              />
                            )}
                          </View>
                          <View style={styles.serviceTextBlock}>
                            <Text style={styles.serviceName}>{service.name}</Text>
                            <Text style={styles.serviceMeta}>{service.price ? `Price: ${service.price}` : 'Price not set'}</Text>
                          </View>
                        </View>
                        <View style={styles.serviceRight}>
                          <TouchableOpacity onPress={() => toggleService(service.id, service.active)}>
                            <Chip
                              style={[
                                styles.statusChip,
                                service.active ? styles.activeChip : styles.inactiveChip,
                              ]}
                              textStyle={
                                service.active ? styles.activeChipText : styles.inactiveChipText
                              }
                            >
                              {service.active ? 'Active' : 'Inactive'}
                            </Chip>
                          </TouchableOpacity>
                          <View style={{ flexDirection: 'row' }}>
                            <Button
                              mode="text"
                              compact
                              onPress={() => openEditModal(service)}
                              labelStyle={styles.editLabel}
                            >
                              Edit
                            </Button>
                            <Button
                              mode="text"
                              compact
                              onPress={() => deleteService(service.id)}
                              labelStyle={styles.deleteLabel}
                              textColor="#ef4444"
                            >
                              Remove
                            </Button>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </Card.Content>
          </Card>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  innerContent: {
    width: '100%',
  },
  innerContentLarge: {
    maxWidth: 960,
    alignSelf: 'center',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextBlock: {
    flex: 1,
    paddingRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e5e7eb',
    lineHeight: 20,
  },
  headerIconBlock: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#a5b4fc',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#818cf8',
  },
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 3,
    borderRadius: 12,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  addServiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  addServiceIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addServiceTextBlock: {
    flex: 1,
  },
  addServiceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  addServiceSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  servicesList: {
    gap: 10,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  serviceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  serviceTextBlock: {
    flex: 1,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  serviceMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  serviceRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  statusChip: {
    marginBottom: 4,
  },
  activeChip: {
    backgroundColor: '#dcfce7',
  },
  inactiveChip: {
    backgroundColor: '#fee2e2',
  },
  activeChipText: {
    color: '#16a34a',
    fontSize: 11,
    fontWeight: '600',
  },
  inactiveChipText: {
    color: '#b91c1c',
    fontSize: 11,
    fontWeight: '600',
  },
  editLabel: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
  },
  deleteLabel: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
  },
  countChip: {
    backgroundColor: '#6366f1',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1e293b',
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: '#6366f1',
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


