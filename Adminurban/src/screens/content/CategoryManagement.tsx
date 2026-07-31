import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../auth/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';
import * as ImagePicker from 'expo-image-picker';
import { showConfirmDialog, showErrorMessage } from '../../utils/dialog';

export const CategoryManagement = ({ navigation, onNavigate }: { navigation?: any, onNavigate?: (page: string) => void }) => {
    const { admin, logout } = useAuth();
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Navigation State
    const [viewLevel, setViewLevel] = useState<'main' | 'sub' | 'child'>('main');
    const [currentPath, setCurrentPath] = useState<any[]>([]); // Breadcrumb path

    const [modalVisible, setModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        level: 'main',
        parentCategory: '',
        price: '',
        duration: '',
        isActive: true
    });

    useEffect(() => {
        fetchCategories();
    }, [viewLevel, currentPath]);

    const fetchCategories = async () => {
        setLoading(true);
        // Determine parent ID from current path
        const parentId = currentPath.length > 0 ? currentPath[currentPath.length - 1]._id : undefined;

        const response = await api.getCategories(viewLevel, parentId);
        if (response.success) {
            setCategories(response.data);
        }
        setLoading(false);
    };

    const handleDrillDown = (category: any) => {
        if (category.level === 'main') {
            setViewLevel('sub');
            setCurrentPath([...currentPath, category]);
        } else if (category.level === 'sub') {
            setViewLevel('child');
            setCurrentPath([...currentPath, category]);
        }
    };

    const handleBack = () => {
        const newPath = [...currentPath];
        newPath.pop();
        setCurrentPath(newPath);

        if (newPath.length === 0) setViewLevel('main');
        else if (newPath.length === 1) setViewLevel('sub');
    };

    const handleImagePick = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            setFormData({ ...formData, image: `data:image/jpeg;base64,${result.assets[0].base64}` });
        }
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        const parentId = currentPath.length > 0 ? currentPath[currentPath.length - 1]._id : undefined;
        const data = {
            ...formData,
            level: viewLevel,
            parentCategory: parentId // Automatically set parent based on current view
        };

        let response;
        if (editingCategory) {
            response = await api.updateCategory(editingCategory._id, data);
        } else {
            response = await api.createCategory(data);
        }

        if (response.success) {
            setModalVisible(false);
            fetchCategories();
            setEditingCategory(null);
            setFormData({ name: '', description: '', image: '', level: 'main', parentCategory: '', price: '', duration: '', isActive: true });
            Alert.alert('Success', `Category ${editingCategory ? 'updated' : 'created'} successfully`);
        } else {
            Alert.alert('Error', response.message);
        }
    };

    const handleDelete = (id: string) => {
        showConfirmDialog(
            'Delete Category',
            'Are you sure you want to delete this category? This will also delete all sub-categories and services under it.',
            async () => {
                const response = await api.deleteCategory(id);
                if (response.success) {
                    fetchCategories();
                } else {
                    showErrorMessage(response.message || 'Failed to delete category');
                }
            }
        );
    };

    const openModal = (category?: any) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                description: category.description || '',
                image: category.image || '',
                level: category.level,
                parentCategory: category.parentCategory?._id || '',
                price: category.price?.toString() || '',
                duration: category.duration?.toString() || '',
                isActive: category.isActive !== undefined ? category.isActive : true
            });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', description: '', image: '', level: viewLevel, parentCategory: '', price: '', duration: '', isActive: true });
        }
        setModalVisible(true);
    };

    return (
        <ScreenWrapper title="Category Management" onLogout={logout} adminName={admin?.name} currentPage="categories" onNavigate={onNavigate}>
            <View style={styles.container}>
                {/* ... (Breadcrumbs & Header remain same) */}
                <View style={styles.headerContainer}>
                    <View style={styles.breadcrumbContainer}>
                        <TouchableOpacity onPress={() => {
                            setCurrentPath([]);
                            setViewLevel('main');
                        }}>
                            <Text style={[styles.breadcrumbText, currentPath.length === 0 && styles.activeBreadcrumb]}>Categories</Text>
                        </TouchableOpacity>

                        {currentPath.map((item, index) => (
                            <View key={item._id} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                                <TouchableOpacity onPress={() => {
                                    // Navigate to this level
                                    const newPath = currentPath.slice(0, index + 1);
                                    setCurrentPath(newPath);
                                    setViewLevel(index === 0 ? 'sub' : 'child');
                                }}>
                                    <Text style={[styles.breadcrumbText, index === currentPath.length - 1 && styles.activeBreadcrumb]}>
                                        {item.name}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    <View style={styles.actionRow}>
                        {currentPath.length > 0 && (
                            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                                <Ionicons name="arrow-back" size={20} color="#64748b" />
                                <Text style={styles.backButtonText}>Back</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity onPress={() => openModal()}>
                            <LinearGradient
                                colors={['#3b82f6', '#2563eb']}
                                style={styles.addButton}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Ionicons name="add" size={20} color="#fff" />
                                <Text style={styles.addButtonText}>
                                    Add {viewLevel === 'main' ? 'Main Category' : viewLevel === 'sub' ? 'Sub Category' : 'Child Category'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Content */}
                {loading ? (
                    <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
                ) : (
                    <ScrollView contentContainerStyle={styles.grid}>
                        {categories.map((category) => (
                            <TouchableOpacity
                                key={category._id}
                                style={styles.card}
                                onPress={() => handleDrillDown(category)}
                                disabled={category.level === 'child'}
                            >
                                <View style={styles.cardImageContainer}>
                                    {category.image ? (
                                        <Image source={{ uri: category.image }} style={styles.cardImage} />
                                    ) : (
                                        <View style={[styles.cardImage, styles.placeholderImage]}>
                                            <Ionicons name="image-outline" size={32} color="#cbd5e1" />
                                        </View>
                                    )}
                                    <View style={styles.cardOverlay}>
                                        <TouchableOpacity onPress={() => openModal(category)} style={styles.iconButton}>
                                            <Ionicons name="pencil" size={18} color="#fff" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDelete(category._id)} style={[styles.iconButton, styles.deleteButton]}>
                                            <Ionicons name="trash" size={18} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={styles.cardContent}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardTitle}>{category.name}</Text>
                                        <View style={[styles.statusBadge, category.isActive ? styles.statusActive : styles.statusInactive]}>
                                            <Text style={[styles.statusText, category.isActive ? styles.statusTextActive : styles.statusTextInactive]}>
                                                {category.isActive ? 'Published' : 'Unpublished'}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.cardDescription} numberOfLines={2}>
                                        {category.description || 'No description'}
                                    </Text>
                                    {category.price > 0 && (
                                        <View style={styles.priceContainer}>
                                            <Ionicons name="pricetag" size={14} color="#10b981" />
                                            <Text style={styles.priceText}>₹{category.price}</Text>
                                        </View>
                                    )}
                                    {category.duration > 0 && (
                                        <View style={styles.priceContainer}>
                                            <Ionicons name="time-outline" size={14} color="#64748b" />
                                            <Text style={[styles.priceText, { color: '#64748b' }]}>{category.duration} min</Text>
                                        </View>
                                    )}
                                    {category.level !== 'child' && (
                                        <View style={styles.drillDownHint}>
                                            <Text style={styles.drillDownText}>
                                                View {category.level === 'main' ? 'Sub Categories' : 'Child Categories'}
                                            </Text>
                                            <Ionicons name="arrow-forward" size={14} color="#3b82f6" />
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                        {categories.length === 0 && (
                            <View style={styles.emptyState}>
                                <Ionicons name="albums-outline" size={64} color="#cbd5e1" />
                                <Text style={styles.emptyStateText}>
                                    No {viewLevel} categories found
                                    {currentPath.length > 0 ? ` in ${currentPath[currentPath.length - 1].name}` : ''}
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
                                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                                </Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.formScroll}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Category Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.name}
                                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                                        placeholder="Enter category name"
                                    />
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

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Image</Text>
                                    <TouchableOpacity style={styles.imageUpload} onPress={handleImagePick}>
                                        {formData.image ? (
                                            <Image source={{ uri: formData.image }} style={styles.uploadedImage} />
                                        ) : (
                                            <View style={styles.uploadPlaceholder}>
                                                <Ionicons name="cloud-upload-outline" size={32} color="#64748b" />
                                                <Text style={styles.uploadText}>Click to upload image</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Price (₹)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.price}
                                        onChangeText={(text) => setFormData({ ...formData, price: text })}
                                        placeholder="Enter price (e.g., 299)"
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Duration (min)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.duration}
                                        onChangeText={(text) => setFormData({ ...formData, duration: text })}
                                        placeholder="Enter duration in minutes"
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <View style={styles.toggleContainer}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.label}>Publish Status</Text>
                                            <Text style={styles.toggleHint}>
                                                {formData.isActive ? 'Published - Visible to users' : 'Unpublished - Hidden from users'}
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            style={[styles.toggleButton, formData.isActive && styles.toggleButtonActive]}
                                            onPress={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                        >
                                            <View style={[styles.toggleCircle, formData.isActive && styles.toggleCircleActive]}>
                                                <Ionicons
                                                    name={formData.isActive ? "checkmark" : "close"}
                                                    size={16}
                                                    color="#fff"
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {currentPath.length > 0 && (
                                    <View style={styles.contextInfo}>
                                        <Ionicons name="information-circle-outline" size={20} color="#3b82f6" />
                                        <Text style={styles.contextText}>
                                            Adding to: <Text style={{ fontWeight: 'bold' }}>{currentPath[currentPath.length - 1].name}</Text>
                                        </Text>
                                    </View>
                                )}
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
                                        colors={['#3b82f6', '#2563eb']}
                                        style={styles.submitButton}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        <Text style={styles.submitButtonText}>
                                            {editingCategory ? 'Update' : 'Create'}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 8,
    },
    headerContainer: {
        marginBottom: 12,
    },
    breadcrumbContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    breadcrumbText: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '500',
    },
    activeBreadcrumb: {
        color: '#3b82f6',
        fontWeight: '700',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        gap: 4,
    },
    backButtonText: {
        color: '#64748b',
        fontWeight: '600',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 8,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingBottom: 16,
    },
    card: {
        width: Platform.OS === 'web' ? '23%' : '100%',
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 16,
    },
    cardImageContainer: {
        height: 140,
        position: 'relative',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderImage: {
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.9)',
    },
    cardContent: {
        padding: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 12,
        color: '#94a3b8',
        lineHeight: 16,
        marginBottom: 8,
    },
    drillDownHint: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    drillDownText: {
        fontSize: 12,
        color: '#3b82f6',
        fontWeight: '600',
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
        textAlign: 'center',
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
        maxHeight: '80%',
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
    imageUpload: {
        height: 160,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: '#f8fafc',
    },
    uploadedImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    uploadPlaceholder: {
        alignItems: 'center',
    },
    uploadText: {
        marginTop: 8,
        fontSize: 14,
        color: '#64748b',
    },
    contextInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eff6ff',
        padding: 12,
        borderRadius: 8,
        gap: 8,
        marginBottom: 20,
    },
    contextText: {
        fontSize: 14,
        color: '#1e40af',
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
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    toggleHint: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 4,
    },
    toggleButton: {
        width: 60,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#e2e8f0',
        padding: 2,
        justifyContent: 'center',
    },
    toggleButtonActive: {
        backgroundColor: '#10b981',
    },
    toggleCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    toggleCircleActive: {
        alignSelf: 'flex-end',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
        gap: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        flexShrink: 0,
    },
    statusActive: {
        backgroundColor: '#d1fae5',
    },
    statusInactive: {
        backgroundColor: '#fee2e2',
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
    },
    statusTextActive: {
        color: '#065f46',
    },
    statusTextInactive: {
        color: '#991b1b',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 8,
    },
    priceText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#10b981',
    },
});
