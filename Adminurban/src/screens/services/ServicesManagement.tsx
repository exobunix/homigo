import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Modal, ScrollView, RefreshControl } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../auth/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';
import { confirmAction, showAlert } from '../../utils/alert';
import { useRefresh } from '../../hooks/useRefresh';

export const ServicesManagement = ({ onNavigate }: { onNavigate?: (page: string) => void }) => {
    const { admin, logout } = useAuth();
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingService, setEditingService] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        basePrice: '',
        description: '',
        color: '#3b82f6',
        icon: 'construct'
    });
    const [refreshing, setRefreshing] = useState(false);

    const fetchServices = async () => {
        if (!refreshing) setLoading(true);
        const response = await api.getServices();
        if (response.success) {
            setServices(response.data);
        }
        setLoading(false);
        setRefreshing(false);
    };

    useRefresh(
        React.useCallback(() => {
            fetchServices();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchServices();
    };

    const handleSave = async () => {
        if (!formData.name || !formData.basePrice) {
            showAlert("Error", "Please fill in all required fields");
            return;
        }

        const serviceData = {
            ...formData,
            id: editingService ? editingService.id : formData.name.toLowerCase().replace(/\s+/g, '-'),
            basePrice: Number(formData.basePrice)
        };

        let response;
        if (editingService) {
            response = await api.updateService(editingService._id, serviceData);
        } else {
            response = await api.createService(serviceData);
        }

        if (response.success) {
            setModalVisible(false);
            setEditingService(null);
            setFormData({ name: '', basePrice: '', description: '', color: '#3b82f6', icon: 'construct' });
            fetchServices();
        } else {
            showAlert("Error", response.message || "Failed to save service");
        }
    };

    const handleDelete = async (service: any) => {
        confirmAction(
            "Delete Service",
            `Are you sure you want to delete ${service.name}?`,
            async () => {
                const response = await api.deleteService(service._id);
                if (response.success) {
                    fetchServices();
                } else {
                    showAlert("Error", "Failed to delete service");
                }
            },
            undefined,
            "Delete",
            "Cancel",
            true
        );
    };

    const openModal = (service: any = null) => {
        if (service) {
            setEditingService(service);
            setFormData({
                name: service.name,
                basePrice: service.basePrice.toString(),
                description: service.description || '',
                color: service.color || '#3b82f6',
                icon: service.icon || 'construct'
            });
        } else {
            setEditingService(null);
            setFormData({ name: '', basePrice: '', description: '', color: '#3b82f6', icon: 'construct' });
        }
        setModalVisible(true);
    };

    const filteredServices = services.filter(service =>
        (service.name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    const renderServiceCard = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.serviceCard} activeOpacity={0.7} onPress={() => openModal(item)}>
            <LinearGradient
                colors={[item.color || '#3b82f6', '#000000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.serviceIcon}
            >
                <Ionicons name={item.icon as any || 'construct'} size={24} color="#fff" />
            </LinearGradient>

            <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{item.name}</Text>
                <Text style={styles.servicePrice}>Starting at ₹{item.basePrice}</Text>
            </View>

            <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item)}
            >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper
            title="Services Management"
            onLogout={logout}
            adminName={admin?.name || 'Admin'}
            currentPage="services"
            onNavigate={onNavigate}
        >
            <View style={styles.header}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search services..."
                        placeholderTextColor="#94a3b8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
                    <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.addGradient}
                    >
                        <Ionicons name="add" size={24} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredServices}
                keyExtractor={item => item._id}
                renderItem={renderServiceCard}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshing={refreshing}
                onRefresh={onRefresh}
            />

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editingService ? 'Edit Service' : 'Add New Service'}</Text>

                        <ScrollView>
                            <Text style={styles.label}>Service Name</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholder="e.g. House Cleaning"
                            />

                            <Text style={styles.label}>Base Price (₹)</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.basePrice}
                                onChangeText={(text) => setFormData({ ...formData, basePrice: text })}
                                keyboardType="numeric"
                                placeholder="e.g. 500"
                            />

                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={formData.description}
                                onChangeText={(text) => setFormData({ ...formData, description: text })}
                                multiline
                                numberOfLines={3}
                                placeholder="Service description..."
                            />
                        </ScrollView>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.cancelBtn]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.saveBtn]}
                                onPress={handleSave}
                            >
                                <Text style={styles.saveBtnText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1e293b',
    },
    addButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    addGradient: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: 24,
    },
    serviceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    serviceIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    serviceInfo: {
        flex: 1,
    },
    serviceName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    servicePrice: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    deleteBtn: {
        padding: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 24,
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: '#1e293b',
        marginBottom: 20,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    modalBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelBtn: {
        backgroundColor: '#f1f5f9',
    },
    saveBtn: {
        backgroundColor: '#3b82f6',
    },
    cancelBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
    },
    saveBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
});
