import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert, Platform, Switch, Image } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../auth/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';

export const AddonManagement = ({ navigation, onNavigate }: { navigation?: any, onNavigate?: (page: string) => void }) => {
    const { admin, logout } = useAuth();
    const [addons, setAddons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [editingAddon, setEditingAddon] = useState<any>(null);
    const [services, setServices] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        duration: '',
        image: '',
        category: '',
        isActive: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        // Refetch addons when category filter changes
        fetchAddons();
    }, [selectedCategoryFilter]);

    const fetchAddons = async () => {
        setLoading(true);
        const addonsRes = await api.getAddons(selectedCategoryFilter || undefined);
        if (addonsRes.success) setAddons(addonsRes.data);
        setLoading(false);
    };

    const fetchData = async () => {
        setLoading(true);
        const [addonsRes, servicesRes, categoriesRes] = await Promise.all([
            api.getAddons(),
            api.getServices(),
            api.getCategories()
        ]);

        if (addonsRes.success) setAddons(addonsRes.data);
        if (servicesRes.success) setServices(servicesRes.data);
        if (categoriesRes.success) setCategories(categoriesRes.data);

        setLoading(false);
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.price) {
            Alert.alert('Error', 'Name and Price are required');
            return;
        }

        const data = {
            ...formData,
            price: Number(formData.price),
            duration: Number(formData.duration) || 0
        };
        let response;

        if (editingAddon) {
            response = await api.updateAddon(editingAddon._id, data);
        } else {
            response = await api.createAddon(data);
        }

        if (response.success) {
            setModalVisible(false);
            fetchData();
            setEditingAddon(null);
            setFormData({ name: '', description: '', price: '', duration: '', image: '', category: '', isActive: true });
            Alert.alert('Success', `Add-on ${editingAddon ? 'updated' : 'created'} successfully`);
        } else {
            Alert.alert('Error', response.message);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            'Delete Add-on',
            'Are you sure you want to delete this add-on?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const response = await api.deleteAddon(id);
                        if (response.success) {
                            fetchData();
                        } else {
                            Alert.alert('Error', response.message);
                        }
                    }
                }
            ]
        );
    };

    const openModal = (addon?: any) => {
        if (addon) {
            setEditingAddon(addon);
            setFormData({
                name: addon.name,
                description: addon.description || '',
                price: addon.price.toString(),
                duration: addon.duration?.toString() || '',
                image: addon.image || '',
                category: addon.category?._id || '',
                isActive: addon.isActive
            });
        } else {
            setEditingAddon(null);
            setFormData({ name: '', description: '', price: '', duration: '', image: '', category: '', isActive: true });
        }
        setModalVisible(true);
    };

    // Group addons by category (no frontend filtering needed - backend handles it)
    const addonsByCategory = addons.reduce((acc: any, addon: any) => {
        const categoryName = addon.category?.name || 'Uncategorized';
        if (!acc[categoryName]) {
            acc[categoryName] = [];
        }
        acc[categoryName].push(addon);
        return acc;
    }, {});

    return (
        <ScreenWrapper title="Add-ons Management" onLogout={logout} adminName={admin?.name} currentPage="addons" onNavigate={onNavigate}>
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <Text style={styles.headerTitle}>Service Add-ons</Text>
                    <TouchableOpacity onPress={() => openModal()} style={{ marginTop: 12 }}>
                        <LinearGradient
                            colors={['#f59e0b', '#d97706']}
                            style={styles.addButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Ionicons name="add" size={20} color="#fff" />
                            <Text style={styles.addButtonText}>New Add-on</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Category Filter Dropdown */}
                    <View style={styles.filterContainer}>
                        <Text style={styles.filterLabel}>Filter by Category:</Text>
                        <TouchableOpacity
                            style={styles.dropdownButton}
                            onPress={() => setFilterModalVisible(true)}
                        >
                            <Text style={styles.dropdownButtonText}>
                                {selectedCategoryFilter
                                    ? categories.find(c => c._id === selectedCategoryFilter)?.name
                                    : 'All Categories'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#64748b" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Filter Selection Modal */}
                <Modal visible={filterModalVisible} animationType="fade" transparent={true}>
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setFilterModalVisible(false)}
                    >
                        <View style={styles.dropdownModalContent}>
                            <ScrollView style={styles.dropdownList}>
                                <TouchableOpacity
                                    style={[
                                        styles.dropdownItem,
                                        selectedCategoryFilter === '' && styles.dropdownItemActive
                                    ]}
                                    onPress={() => {
                                        setSelectedCategoryFilter('');
                                        setFilterModalVisible(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.dropdownItemText,
                                        selectedCategoryFilter === '' && styles.dropdownItemTextActive
                                    ]}>All Categories</Text>
                                    {selectedCategoryFilter === '' && (
                                        <Ionicons name="checkmark" size={20} color="#f59e0b" />
                                    )}
                                </TouchableOpacity>
                                {categories.filter(c => c.level === 'main').map((category) => (
                                    <TouchableOpacity
                                        key={category._id}
                                        style={[
                                            styles.dropdownItem,
                                            selectedCategoryFilter === category._id && styles.dropdownItemActive
                                        ]}
                                        onPress={() => {
                                            setSelectedCategoryFilter(category._id);
                                            setFilterModalVisible(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.dropdownItemText,
                                            selectedCategoryFilter === category._id && styles.dropdownItemTextActive
                                        ]}>{category.name}</Text>
                                        {selectedCategoryFilter === category._id && (
                                            <Ionicons name="checkmark" size={20} color="#f59e0b" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </Modal>


                {loading ? (
                    <ActivityIndicator size="large" color="#f59e0b" style={{ marginTop: 40 }} />
                ) : (
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        {Object.keys(addonsByCategory).length > 0 ? (
                            Object.keys(addonsByCategory).map((categoryName) => (
                                <View key={categoryName} style={styles.categorySection}>
                                    <Text style={styles.categoryTitle}>{categoryName}</Text>
                                    <View style={styles.cardsGrid}>
                                        {addonsByCategory[categoryName].map((addon: any) => (
                                            <View key={addon._id} style={styles.card}>
                                                {addon.image ? (
                                                    <Image source={{ uri: addon.image }} style={styles.addonImage} />
                                                ) : (
                                                    <View style={styles.addonImagePlaceholder}>
                                                        <Ionicons name="image-outline" size={40} color="#cbd5e1" />
                                                    </View>
                                                )}
                                                <View style={styles.cardBody}>
                                                    <View style={styles.cardHeader}>
                                                        <View style={styles.priceTag}>
                                                            <Text style={styles.priceText}>₹{addon.price}</Text>
                                                        </View>
                                                        {addon.duration > 0 && (
                                                            <View style={styles.durationTag}>
                                                                <Ionicons name="time-outline" size={14} color="#64748b" />
                                                                <Text style={styles.durationText}>{addon.duration} min</Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                    <View style={styles.cardContent}>
                                                        <Text style={styles.cardTitle}>{addon.name}</Text>
                                                        <Text style={styles.cardDescription} numberOfLines={2}>
                                                            {addon.description || 'No description'}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.cardActions}>
                                                        <TouchableOpacity onPress={() => openModal(addon)} style={styles.actionButton}>
                                                            <Text style={styles.actionText}>Edit</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity onPress={() => handleDelete(addon._id)} style={styles.actionButton}>
                                                            <Text style={[styles.actionText, { color: '#ef4444' }]}>Delete</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="cube-outline" size={64} color="#cbd5e1" />
                                <Text style={styles.emptyStateText}>
                                    {selectedCategoryFilter ? 'No add-ons found for this category' : 'No add-ons found'}
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                )}

                {/* Modal */}
                <Modal visible={modalVisible} animationType="slide" transparent={true}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    {editingAddon ? 'Edit Add-on' : 'Add New Add-on'}
                                </Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.formScroll}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Add-on Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.name}
                                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                                        placeholder="Enter add-on name"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Price (₹)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.price}
                                        onChangeText={(text) => setFormData({ ...formData, price: text })}
                                        placeholder="0.00"
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Duration (minutes)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.duration}
                                        onChangeText={(text) => setFormData({ ...formData, duration: text })}
                                        placeholder="30"
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Image URL</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.image}
                                        onChangeText={(text) => setFormData({ ...formData, image: text })}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Category</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                                        {categories.filter(c => c.level === 'main').map((category) => (
                                            <TouchableOpacity
                                                key={category._id}
                                                style={[
                                                    styles.chip,
                                                    formData.category === category._id && styles.activeChip
                                                ]}
                                                onPress={() => setFormData({ ...formData, category: category._id })}
                                            >
                                                <Text style={[
                                                    styles.chipText,
                                                    formData.category === category._id && styles.activeChipText
                                                ]}>
                                                    {category.name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Description</Text>
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        value={formData.description}
                                        onChangeText={(text) => setFormData({ ...formData, description: text })}
                                        placeholder="Enter description"
                                        multiline
                                        numberOfLines={3}
                                    />
                                </View>

                                <View style={styles.rowGroup}>
                                    <Text style={styles.label}>Active Status</Text>
                                    <Switch
                                        value={formData.isActive}
                                        onValueChange={(val) => setFormData({ ...formData, isActive: val })}
                                        trackColor={{ false: '#cbd5e1', true: '#f59e0b' }}
                                    />
                                </View>
                            </ScrollView>

                            <View style={styles.modalFooter}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleSubmit} style={{ flex: 1 }}>
                                    <LinearGradient
                                        colors={['#f59e0b', '#d97706']}
                                        style={styles.submitButton}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        <Text style={styles.submitButtonText}>
                                            {editingAddon ? 'Update' : 'Create'}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </ScreenWrapper >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10, // Reduced padding
    },
    headerContainer: {
        marginBottom: 16,
    },
    actionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 8,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    categorySection: {
        marginBottom: 24,
    },
    categoryTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f59e0b',
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 2,
        borderBottomColor: '#fef3c7',
    },
    filterContainer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 8,
    },
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    dropdownButtonText: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '500',
    },
    dropdownModalContent: {
        position: 'absolute',
        top: '20%',
        left: 20,
        right: 20,
        backgroundColor: '#fff',
        borderRadius: 16,
        maxHeight: '60%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
    },
    dropdownList: {
        padding: 8,
    },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    dropdownItemActive: {
        backgroundColor: '#fef3c7',
    },
    dropdownItemText: {
        fontSize: 14,
        color: '#64748b',
    },
    dropdownItemTextActive: {
        color: '#d97706',
        fontWeight: '600',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        paddingBottom: 40,
    },
    card: {
        width: Platform.OS === 'web' ? '48%' : '100%',
        backgroundColor: '#fff',
        borderRadius: 12,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 12, // Reduced margin
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    cardsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12, // Reduced gap
        justifyContent: Platform.OS === 'web' ? 'flex-start' : 'center',
    },
    cardBody: {
        flex: 1,
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fef3c7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    priceTag: {
        backgroundColor: '#f0f9ff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    priceText: {
        color: '#0284c7',
        fontWeight: 'bold',
        fontSize: 14,
    },
    durationTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    durationText: {
        color: '#64748b',
        fontSize: 12,
        fontWeight: '500',
    },
    cardContent: {
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    addonImage: {
        width: 150,
        height: 150,
        backgroundColor: '#f1f5f9',
    },
    addonImagePlaceholder: {
        width: 150,
        height: 150,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryName: {
        fontSize: 11,
        color: '#f59e0b',
        marginBottom: 4,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    serviceName: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 8,
        fontWeight: '500',
    },
    cardDescription: {
        fontSize: 12,
        color: '#94a3b8',
        lineHeight: 16,
    },
    cardActions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 12,
        gap: 16,
    },
    actionButton: {
        paddingVertical: 4,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    emptyState: {
        width: '100%',
        alignItems: 'center',
        padding: 40,
    },
    emptyStateText: {
        marginTop: 16,
        fontSize: 16,
        color: '#94a3b8',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 500,
        backgroundColor: '#fff',
        borderRadius: 20,
        maxHeight: '90%',
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    formScroll: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    rowGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#1e293b',
        backgroundColor: '#f8fafc',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    chipScroll: {
        flexDirection: 'row',
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    activeChip: {
        backgroundColor: '#fef3c7',
        borderColor: '#f59e0b',
    },
    chipText: {
        fontSize: 14,
        color: '#64748b',
    },
    activeChipText: {
        color: '#d97706',
        fontWeight: '600',
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
    },
    submitButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});
