import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert, Platform, Switch } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../auth/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';

export const CountryCodeManagement = ({ navigation, onNavigate }: { navigation?: any, onNavigate?: (page: string) => void }) => {
    const { admin, logout } = useAuth();
    const [countryCodes, setCountryCodes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCode, setEditingCode] = useState<any>(null);
    const [formData, setFormData] = useState({
        code: '',
        countryName: '',
        flag: '',
        active: true
    });

    useEffect(() => {
        fetchCountryCodes();
    }, []);

    const fetchCountryCodes = async () => {
        setLoading(true);
        const response = await api.getCountryCodes();
        if (response.success) {
            setCountryCodes(response.data);
        }
        setLoading(false);
    };

    const handleSubmit = async () => {
        if (!formData.code || !formData.countryName) {
            Alert.alert('Error', 'Code and Country Name are required');
            return;
        }

        let response;
        if (editingCode) {
            response = await api.updateCountryCode(editingCode._id, formData);
        } else {
            response = await api.createCountryCode(formData);
        }

        if (response.success) {
            setModalVisible(false);
            fetchCountryCodes();
            setEditingCode(null);
            setFormData({ code: '', countryName: '', flag: '', active: true });
            Alert.alert('Success', `Country Code ${editingCode ? 'updated' : 'created'} successfully`);
        } else {
            Alert.alert('Error', response.message);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            'Delete Country Code',
            'Are you sure you want to delete this country code?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const response = await api.deleteCountryCode(id);
                        if (response.success) {
                            fetchCountryCodes();
                        } else {
                            Alert.alert('Error', response.message);
                        }
                    }
                }
            ]
        );
    };

    const openModal = (code?: any) => {
        if (code) {
            setEditingCode(code);
            setFormData({
                code: code.code,
                countryName: code.countryName,
                flag: code.flag || '',
                active: code.active
            });
        } else {
            setEditingCode(null);
            setFormData({ code: '', countryName: '', flag: '', active: true });
        }
        setModalVisible(true);
    };

    return (
        <ScreenWrapper title="Country Codes" onLogout={logout} adminName={admin?.name} currentPage="country-codes" onNavigate={onNavigate}>
            <View style={styles.container}>
                <View style={styles.actionHeader}>
                    <Text style={styles.headerTitle}>International Codes</Text>
                    <TouchableOpacity onPress={() => openModal()}>
                        <LinearGradient
                            colors={['#64748b', '#475569']}
                            style={styles.addButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Ionicons name="add" size={20} color="#fff" />
                            <Text style={styles.addButtonText}>Add Code</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#64748b" style={{ marginTop: 40 }} />
                ) : (
                    <ScrollView contentContainerStyle={styles.grid}>
                        {countryCodes.map((item) => (
                            <View key={item._id} style={styles.card}>
                                <View style={styles.flagContainer}>
                                    <Text style={styles.flagText}>{item.flag || '🏳️'}</Text>
                                </View>
                                <View style={styles.cardContent}>
                                    <Text style={styles.codeText}>{item.code}</Text>
                                    <Text style={styles.countryName}>{item.countryName}</Text>
                                </View>
                                <View style={styles.cardActions}>
                                    <Switch
                                        value={item.active}
                                        onValueChange={() => { }}
                                        trackColor={{ false: '#cbd5e1', true: '#64748b' }}
                                        style={{ transform: [{ scale: 0.7 }] }}
                                    />
                                    <TouchableOpacity onPress={() => openModal(item)} style={styles.actionButton}>
                                        <Ionicons name="pencil" size={18} color="#64748b" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.actionButton}>
                                        <Ionicons name="trash" size={18} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                        {countryCodes.length === 0 && (
                            <View style={styles.emptyState}>
                                <Ionicons name="globe-outline" size={64} color="#cbd5e1" />
                                <Text style={styles.emptyStateText}>No country codes found</Text>
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
                                    {editingCode ? 'Edit Country Code' : 'Add New Country Code'}
                                </Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.formScroll}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Country Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.countryName}
                                        onChangeText={(text) => setFormData({ ...formData, countryName: text })}
                                        placeholder="e.g. India"
                                    />
                                </View>

                                <View style={styles.rowGroup}>
                                    <View style={{ flex: 1, marginRight: 8 }}>
                                        <Text style={styles.label}>Dial Code</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={formData.code}
                                            onChangeText={(text) => setFormData({ ...formData, code: text })}
                                            placeholder="e.g. +91"
                                            keyboardType="phone-pad"
                                        />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 8 }}>
                                        <Text style={styles.label}>Flag Emoji</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={formData.flag}
                                            onChangeText={(text) => setFormData({ ...formData, flag: text })}
                                            placeholder="e.g. 🇮🇳"
                                        />
                                    </View>
                                </View>

                                <View style={styles.rowGroup}>
                                    <Text style={styles.label}>Active Status</Text>
                                    <Switch
                                        value={formData.active}
                                        onValueChange={(val) => setFormData({ ...formData, active: val })}
                                        trackColor={{ false: '#cbd5e1', true: '#64748b' }}
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
                                        colors={['#64748b', '#475569']}
                                        style={styles.submitButton}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        <Text style={styles.submitButtonText}>
                                            {editingCode ? 'Update' : 'Create'}
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
        width: Platform.OS === 'web' ? '23%' : '47%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 16,
        alignItems: 'center',
    },
    flagContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    flagText: {
        fontSize: 32,
    },
    cardContent: {
        alignItems: 'center',
        marginBottom: 16,
    },
    codeText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    countryName: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
    },
    cardActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        justifyContent: 'center',
    },
    actionButton: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: '#f8fafc',
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
        maxWidth: 400,
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
