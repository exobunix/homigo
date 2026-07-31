import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Image, ActivityIndicator, Alert, Platform, Switch } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../auth/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';
import * as ImagePicker from 'expo-image-picker';
import { showConfirmDialog, showErrorMessage } from '../../utils/dialog';

export const TestimonialManagement = ({ navigation, onNavigate }: { navigation?: any, onNavigate?: (page: string) => void }) => {
    const { admin, logout } = useAuth();
    const [testimonials, setTestimonials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        role: 'Customer',
        message: '',
        image: '',
        rating: '5',
        active: true
    });

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        setLoading(true);
        const response = await api.getTestimonials();
        if (response.success) {
            setTestimonials(response.data);
        }
        setLoading(false);
    };

    const handleImagePick = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            setFormData({ ...formData, image: `data:image/jpeg;base64,${result.assets[0].base64}` });
        }
    };

    const handleSubmit = async () => {
        console.log('handleSubmit called', formData);
        // Alert.alert('Debug', 'Submit button clicked'); // Temporary debug alert

        if (!formData.name || !formData.message) {
            Alert.alert('Error', 'Name and Message are required');
            return;
        }

        const data = { ...formData, rating: Number(formData.rating) };
        console.log('Sending data:', data);

        let response;
        try {
            if (editingTestimonial) {
                response = await api.updateTestimonial(editingTestimonial._id, data);
            } else {
                response = await api.createTestimonial(data);
            }
            console.log('API Response:', response);

            if (response.success) {
                setModalVisible(false);
                fetchTestimonials();
                setEditingTestimonial(null);
                setFormData({ name: '', role: 'Customer', message: '', image: '', rating: '5', active: true });
                Alert.alert('Success', `Testimonial ${editingTestimonial ? 'updated' : 'created'} successfully`);
            } else {
                Alert.alert('Error', response.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Submit error:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        }
    };

    const handleDelete = (id: string) => {
        showConfirmDialog(
            'Delete Testimonial',
            'Are you sure you want to delete this testimonial?',
            async () => {
                const response = await api.deleteTestimonial(id);
                if (response.success) {
                    fetchTestimonials();
                } else {
                    showErrorMessage(response.message || 'Failed to delete testimonial');
                }
            }
        );
    };

    const openModal = (testimonial?: any) => {
        if (testimonial) {
            setEditingTestimonial(testimonial);
            setFormData({
                name: testimonial.name,
                role: testimonial.role || 'Customer',
                message: testimonial.message,
                image: testimonial.image,
                rating: testimonial.rating.toString(),
                active: testimonial.active
            });
        } else {
            setEditingTestimonial(null);
            setFormData({ name: '', role: 'Customer', message: '', image: '', rating: '5', active: true });
        }
        setModalVisible(true);
    };

    const renderStars = (rating: number) => {
        return (
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                        key={star}
                        name={star <= rating ? 'star' : 'star-outline'}
                        size={14}
                        color="#f59e0b"
                    />
                ))}
            </View>
        );
    };

    return (
        <ScreenWrapper title="Testimonials" onLogout={logout} adminName={admin?.name} currentPage="testimonials" onNavigate={onNavigate}>
            <View style={styles.container}>
                <View style={styles.actionHeader}>
                    <Text style={styles.headerTitle}>Customer Testimonials</Text>
                    <TouchableOpacity onPress={() => openModal()}>
                        <LinearGradient
                            colors={['#ec4899', '#db2777']}
                            style={styles.addButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Ionicons name="add" size={20} color="#fff" />
                            <Text style={styles.addButtonText}>Add Testimonial</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#ec4899" style={{ marginTop: 40 }} />
                ) : (
                    <ScrollView contentContainerStyle={styles.grid}>
                        {testimonials.map((testimonial) => (
                            <View key={testimonial._id} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.userInfo}>
                                        {testimonial.image ? (
                                            <Image source={{ uri: testimonial.image }} style={styles.avatar} />
                                        ) : (
                                            <View style={styles.avatarPlaceholder}>
                                                <Text style={styles.avatarText}>{testimonial.name.charAt(0)}</Text>
                                            </View>
                                        )}
                                        <View>
                                            <Text style={styles.userName}>{testimonial.name}</Text>
                                            <Text style={styles.userRole}>{testimonial.role}</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.statusDot, { backgroundColor: testimonial.active ? '#10b981' : '#cbd5e1' }]} />
                                </View>
                                <View style={styles.cardContent}>
                                    {renderStars(testimonial.rating)}
                                    <Text style={styles.messageText} numberOfLines={4}>"{testimonial.message}"</Text>
                                </View>
                                <View style={styles.cardActions}>
                                    <TouchableOpacity onPress={() => openModal(testimonial)} style={styles.actionButton}>
                                        <Ionicons name="pencil" size={18} color="#64748b" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDelete(testimonial._id)} style={styles.actionButton}>
                                        <Ionicons name="trash" size={18} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                        {testimonials.length === 0 && (
                            <View style={styles.emptyState}>
                                <Ionicons name="chatbubbles-outline" size={64} color="#cbd5e1" />
                                <Text style={styles.emptyStateText}>No testimonials found</Text>
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
                                    {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
                                </Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.formScroll}>
                                <View style={styles.rowGroup}>
                                    <View style={{ flex: 1, marginRight: 8 }}>
                                        <Text style={styles.label}>Name</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={formData.name}
                                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                                            placeholder="John Doe"
                                        />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 8 }}>
                                        <Text style={styles.label}>Role</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={formData.role}
                                            onChangeText={(text) => setFormData({ ...formData, role: text })}
                                            placeholder="Customer"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Rating (1-5)</Text>
                                    <View style={styles.ratingContainer}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <TouchableOpacity
                                                key={star}
                                                onPress={() => setFormData({ ...formData, rating: star.toString() })}
                                            >
                                                <Ionicons
                                                    name={star <= Number(formData.rating) ? 'star' : 'star-outline'}
                                                    size={32}
                                                    color="#f59e0b"
                                                />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Message</Text>
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        value={formData.message}
                                        onChangeText={(text) => setFormData({ ...formData, message: text })}
                                        placeholder="Enter testimonial message"
                                        multiline
                                        numberOfLines={4}
                                    />
                                </View>

                                <View style={styles.rowGroup}>
                                    <Text style={styles.label}>Active Status</Text>
                                    <Switch
                                        value={formData.active}
                                        onValueChange={(val) => setFormData({ ...formData, active: val })}
                                        trackColor={{ false: '#cbd5e1', true: '#ec4899' }}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>User Image</Text>
                                    <TouchableOpacity style={styles.imageUpload} onPress={handleImagePick}>
                                        {formData.image ? (
                                            <Image source={{ uri: formData.image }} style={styles.uploadedImage} />
                                        ) : (
                                            <View style={styles.uploadPlaceholder}>
                                                <Ionicons name="camera-outline" size={32} color="#64748b" />
                                                <Text style={styles.uploadText}>Upload Photo</Text>
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
                                        colors={['#ec4899', '#db2777']}
                                        style={styles.submitButton}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        <Text style={styles.submitButtonText}>
                                            {editingTestimonial ? 'Update' : 'Create'}
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
        padding: 20,
    },
    actionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
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
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        paddingBottom: 40,
    },
    card: {
        width: Platform.OS === 'web' ? '32%' : '100%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fce7f3',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#db2777',
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    userRole: {
        fontSize: 12,
        color: '#64748b',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    cardContent: {
        marginBottom: 16,
    },
    starsContainer: {
        flexDirection: 'row',
        marginBottom: 8,
        gap: 2,
    },
    messageText: {
        fontSize: 14,
        color: '#475569',
        fontStyle: 'italic',
        lineHeight: 20,
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 12,
    },
    actionButton: {
        padding: 4,
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
        flex: 1,
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
        height: 100,
        textAlignVertical: 'top',
    },
    ratingContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    imageUpload: {
        height: 120,
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
});
