import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Image, ActivityIndicator, Alert, Platform, Switch } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../auth/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';
import * as ImagePicker from 'expo-image-picker';
import { showConfirmDialog, showErrorMessage } from '../../utils/dialog';

export const BannerManagement = ({ navigation, onNavigate }: { navigation?: any, onNavigate?: (page: string) => void }) => {
    const { admin, logout } = useAuth();
    const [banners, setBanners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingBanner, setEditingBanner] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: '',
        position: 'home_top',
        linkType: 'none',
        isActive: true
    });

    const positions = [
        { id: 'home_top', label: 'Home Top Slider' },
        { id: 'home_middle', label: 'Home Middle' },
        { id: 'home_bottom', label: 'Home Bottom' },
        { id: 'category', label: 'Category Page' },
        { id: 'service', label: 'Service Page' }
    ];

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        setLoading(true);
        const response = await api.getBanners();
        if (response.success) {
            setBanners(response.data);
        }
        setLoading(false);
    };

    const handleImagePick = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            setFormData({ ...formData, image: `data:image/jpeg;base64,${result.assets[0].base64}` });
        }
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.image) {
            Alert.alert('Error', 'Title and Image are required');
            return;
        }

        let response;
        if (editingBanner) {
            response = await api.updateBanner(editingBanner._id, formData);
        } else {
            response = await api.createBanner(formData);
        }

        if (response.success) {
            setModalVisible(false);
            fetchBanners();
            setEditingBanner(null);
            setFormData({ title: '', description: '', image: '', position: 'home_top', linkType: 'none', isActive: true });
            Alert.alert('Success', `Banner ${editingBanner ? 'updated' : 'created'} successfully`);
        } else {
            Alert.alert('Error', response.message);
        }
    };

    const handleDelete = (id: string) => {
        showConfirmDialog(
            'Delete Banner',
            'Are you sure you want to delete this banner?',
            async () => {
                const response = await api.deleteBanner(id);
                if (response.success) {
                    fetchBanners();
                } else {
                    showErrorMessage(response.message || 'Failed to delete banner');
                }
            }
        );
    };

    const openModal = (banner?: any) => {
        if (banner) {
            setEditingBanner(banner);
            setFormData({
                title: banner.title,
                description: banner.description || '',
                image: banner.image,
                position: banner.position,
                linkType: banner.linkType || 'none',
                isActive: banner.isActive
            });
        } else {
            setEditingBanner(null);
            setFormData({ title: '', description: '', image: '', position: 'home_top', linkType: 'none', isActive: true });
        }
        setModalVisible(true);
    };

    const getPositionLabel = (pos: string) => {
        return positions.find(p => p.id === pos)?.label || pos;
    };

    return (
        <ScreenWrapper title="Banner Management" onLogout={logout} adminName={admin?.name} currentPage="banners" onNavigate={onNavigate}>
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <Text style={styles.headerTitle}>Promotional Banners</Text>
                    <TouchableOpacity onPress={() => openModal()}>
                        <LinearGradient
                            colors={['#8b5cf6', '#7c3aed']}
                            style={styles.addButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Ionicons name="add" size={20} color="#fff" />
                            <Text style={styles.addButtonText}>Add Banner</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#8b5cf6" style={{ marginTop: 40 }} />
                ) : (
                    <ScrollView contentContainerStyle={styles.grid}>
                        {banners.map((banner) => (
                            <View key={banner._id} style={styles.card}>
                                <View style={styles.cardImageContainer}>
                                    <Image source={{ uri: banner.image }} style={styles.cardImage} />
                                    <View style={styles.positionBadge}>
                                        <Text style={styles.positionText}>{getPositionLabel(banner.position)}</Text>
                                    </View>
                                    <View style={styles.cardOverlay}>
                                        <TouchableOpacity onPress={() => openModal(banner)} style={[styles.iconButton, styles.editButton]}>
                                            <Ionicons name="pencil" size={18} color="#fff" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDelete(banner._id)} style={[styles.iconButton, styles.deleteButton]}>
                                            <Ionicons name="trash" size={18} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={styles.cardContent}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardTitle}>{banner.title}</Text>
                                        <View style={[styles.statusBadge, banner.isActive ? styles.statusActive : styles.statusInactive]}>
                                            <Text style={[styles.statusText, banner.isActive ? styles.statusTextActive : styles.statusTextInactive]}>
                                                {banner.isActive ? 'Published' : 'Unpublished'}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.cardDescription} numberOfLines={2}>
                                        {banner.description || 'No description'}
                                    </Text>
                                </View>
                            </View>
                        ))}
                        {banners.length === 0 && (
                            <View style={styles.emptyState}>
                                <Ionicons name="images-outline" size={64} color="#cbd5e1" />
                                <Text style={styles.emptyStateText}>No banners found</Text>
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
                                    {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                                </Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.formScroll}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Title</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.title}
                                        onChangeText={(text) => setFormData({ ...formData, title: text })}
                                        placeholder="Enter banner title"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Position</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                                        {positions.map((pos) => (
                                            <TouchableOpacity
                                                key={pos.id}
                                                style={[
                                                    styles.chip,
                                                    formData.position === pos.id && styles.activeChip
                                                ]}
                                                onPress={() => setFormData({ ...formData, position: pos.id })}
                                            >
                                                <Text style={[
                                                    styles.chipText,
                                                    formData.position === pos.id && styles.activeChipText
                                                ]}>
                                                    {pos.label}
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
                                        placeholder="Enter description (optional)"
                                        multiline
                                        numberOfLines={3}
                                    />
                                </View>

                                <View style={styles.rowGroup}>
                                    <Text style={styles.label}>Active Status</Text>
                                    <Switch
                                        value={formData.isActive}
                                        onValueChange={(val) => setFormData({ ...formData, isActive: val })}
                                        trackColor={{ false: '#cbd5e1', true: '#8b5cf6' }}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Banner Image (16:9)</Text>
                                    <TouchableOpacity style={styles.imageUpload} onPress={handleImagePick}>
                                        {formData.image ? (
                                            <Image source={{ uri: formData.image }} style={styles.uploadedImage} />
                                        ) : (
                                            <View style={styles.uploadPlaceholder}>
                                                <Ionicons name="cloud-upload-outline" size={32} color="#64748b" />
                                                <Text style={styles.uploadText}>Click to upload banner</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
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
                                        colors={['#8b5cf6', '#7c3aed']}
                                        style={styles.submitButton}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        <Text style={styles.submitButtonText}>
                                            {editingBanner ? 'Update' : 'Create'}
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
        flexDirection: Platform.OS === 'web' ? 'row' : 'column',
        justifyContent: 'space-between',
        alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
        marginBottom: 16,
        gap: Platform.OS === 'web' ? 0 : 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
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
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingBottom: 16,
    },
    card: {
        width: Platform.OS === 'web' ? '48%' : '100%',
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    cardImageContainer: {
        height: 180,
        position: 'relative',
        backgroundColor: '#f8fafc',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    positionBadge: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    positionText: {
        color: '#1e293b',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    cardOverlay: {
        position: 'absolute',
        top: 16,
        right: 16,
        flexDirection: 'row',
        gap: 10,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    editButton: {
        backgroundColor: '#3b82f6',
    },
    deleteButton: {
        backgroundColor: '#ef4444',
    },
    cardContent: {
        padding: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
        gap: 12,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0f172a',
        flex: 1,
        lineHeight: 28,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    cardDescription: {
        fontSize: 15,
        color: '#64748b',
        lineHeight: 24,
        marginTop: 4,
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
        backgroundColor: '#f3e8ff',
        borderColor: '#8b5cf6',
    },
    chipText: {
        fontSize: 14,
        color: '#64748b',
    },
    activeChipText: {
        color: '#8b5cf6',
        fontWeight: '600',
    },
    imageUpload: {
        height: 180,
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
});
