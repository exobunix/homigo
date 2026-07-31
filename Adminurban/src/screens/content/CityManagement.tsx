import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert, Platform } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../auth/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';
import { showConfirmDialog, showErrorMessage } from '../../utils/dialog';

export const CityManagement = ({ navigation, onNavigate }: { navigation?: any, onNavigate?: (page: string) => void }) => {
    const { admin, logout } = useAuth();
    const [countries, setCountries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCountry, setEditingCountry] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        state: '',
        isActive: true
    });

    useEffect(() => {
        fetchCountries();
    }, []);

    const fetchCountries = async () => {
        setLoading(true);
        const response = await api.getCities();
        if (response.success) {
            setCountries(response.data);
        }
        setLoading(false);
    };

    const handleOpenModal = (country?: any) => {
        if (country) {
            setEditingCountry(country);
            setFormData({
                name: country.name,
                state: country.state,
                isActive: country.isActive
            });
        } else {
            setEditingCountry(null);
            setFormData({
                name: '',
                state: '',
                isActive: true
            });
        }
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.state) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        let response;
        if (editingCountry) {
            response = await api.updateCity(editingCountry._id, formData);
        } else {
            response = await api.createCity(formData);
        }

        if (response.success) {
            setModalVisible(false);
            fetchCountries();
        } else {
            Alert.alert('Error', response.message);
        }
    };

    const handleDelete = (id: string) => {
        showConfirmDialog(
            'Delete Country',
            'Are you sure you want to delete this country?',
            async () => {
                const response = await api.deleteCity(id);
                if (response.success) {
                    fetchCountries();
                } else {
                    showErrorMessage(response.message || 'Failed to delete country');
                }
            }
        );
    };

    return (
        <ScreenWrapper
            title="Country Management"
            onLogout={logout}
            adminName={admin?.name || 'Admin'}
            currentPage="cities"
            onNavigate={onNavigate}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Countries & States</Text>
                    <TouchableOpacity style={styles.addButton} onPress={() => handleOpenModal()}>
                        <Ionicons name="add" size={20} color="#fff" />
                        <Text style={styles.addButtonText}>Add Country</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
                ) : (
                    <ScrollView style={styles.listContainer}>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderText, { flex: 2 }]}>Country Name</Text>
                                <Text style={[styles.tableHeaderText, { flex: 2 }]}>State</Text>
                                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Status</Text>
                                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Actions</Text>
                            </View>

                            {countries.map((country) => (
                                <View key={country._id} style={styles.tableRow}>
                                    <Text style={[styles.tableCell, { flex: 2 }]}>{country.name}</Text>
                                    <Text style={[styles.tableCell, { flex: 2 }]}>{country.state}</Text>
                                    <View style={[styles.tableCell, { flex: 1 }]}>
                                        <View style={[styles.statusBadge, country.isActive ? styles.statusActive : styles.statusInactive]}>
                                            <Text style={styles.statusText}>{country.isActive ? 'Active' : 'Inactive'}</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.tableCell, { flex: 1, flexDirection: 'row', gap: 8 }]}>
                                        <TouchableOpacity onPress={() => handleOpenModal(country)} style={styles.actionButton}>
                                            <Ionicons name="pencil" size={16} color="#3b82f6" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDelete(country._id)} style={styles.actionButton}>
                                            <Ionicons name="trash" size={16} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                )}

                {/* Modal */}
                <Modal visible={modalVisible} animationType="slide" transparent={true}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{editingCountry ? 'Edit Country' : 'Add Country'}</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.formContainer}>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Country Name *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter country name"
                                        value={formData.name}
                                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>State *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter state"
                                        value={formData.state}
                                        onChangeText={(text) => setFormData({ ...formData, state: text })}
                                    />
                                </View>
                            </View>

                            <View style={styles.modalFooter}>
                                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                                    <LinearGradient
                                        colors={['#3b82f6', '#2563eb']}
                                        style={styles.submitGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        <Text style={styles.submitButtonText}>{editingCountry ? 'Update' : 'Create'}</Text>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3b82f6',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 8,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    listContainer: {
        flex: 1,
    },
    table: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    tableHeaderText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
        textTransform: 'uppercase',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        alignItems: 'center',
    },
    tableCell: {
        fontSize: 14,
        color: '#1e293b',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    statusActive: {
        backgroundColor: '#dcfce7',
    },
    statusInactive: {
        backgroundColor: '#fee2e2',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    actionButton: {
        padding: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 500,
        backgroundColor: '#fff',
        borderRadius: 16,
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
    formContainer: {
        padding: 20,
    },
    formGroup: {
        marginBottom: 16,
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
    modalFooter: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    submitButton: {
        flex: 1,
        borderRadius: 8,
        overflow: 'hidden',
    },
    submitGradient: {
        padding: 14,
        alignItems: 'center',
    },
    submitButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
});
