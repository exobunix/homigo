import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert, Platform } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../auth/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';

export const NotificationManagement = ({ navigation, onNavigate }: { navigation?: any, onNavigate?: (page: string) => void }) => {
    const { admin, logout } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        body: '',
        target: 'all', // all, vendor, user
        type: 'admin_announcement'
    });

    const targets = [
        { id: 'all', label: 'All Users & Vendors' },
        { id: 'user', label: 'All Users' },
        { id: 'vendor', label: 'All Vendors' }
    ];

    const types = [
        { id: 'admin_announcement', label: 'Announcement' },
        { id: 'info', label: 'Information' },
        { id: 'warning', label: 'Warning' },
        { id: 'success', label: 'Success' }
    ];

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        const response = await api.getNotifications();
        if (response.success) {
            setNotifications(response.data);
        }
        setLoading(false);
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.body) {
            if (Platform.OS === 'web') {
                window.alert('Title and Body are required');
            } else {
                Alert.alert('Error', 'Title and Body are required');
            }
            return;
        }

        const response = await api.createNotification(formData);

        if (response.success) {
            setModalVisible(false);
            fetchNotifications();
            setFormData({ title: '', body: '', target: 'all', type: 'admin_announcement' });
            if (Platform.OS === 'web') {
                window.alert('Notification sent successfully');
            } else {
                Alert.alert('Success', 'Notification sent successfully');
            }
        } else {
            if (Platform.OS === 'web') {
                window.alert(response.message);
            } else {
                Alert.alert('Error', response.message);
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to delete this notification?')) {
                await deleteNotificationApi(id);
            }
        } else {
            Alert.alert(
                'Delete Notification',
                'Are you sure you want to delete this notification?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => deleteNotificationApi(id)
                    }
                ]
            );
        }
    };

    const deleteNotificationApi = async (id: string) => {
        const response = await api.deleteNotification(id);
        if (response.success) {
            fetchNotifications();
        } else {
            if (Platform.OS === 'web') {
                window.alert(response.message);
            } else {
                Alert.alert('Error', response.message);
            }
        }
    };

    const getTargetLabel = (target: string) => {
        return targets.find(t => t.id === target)?.label || target;
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'warning': return '#f59e0b';
            case 'success': return '#10b981';
            case 'admin_announcement': return '#8b5cf6';
            default: return '#3b82f6';
        }
    };

    return (
        <ScreenWrapper title="Notifications" onLogout={logout} adminName={admin?.name} currentPage="notifications" onNavigate={onNavigate}>
            <View style={styles.container}>
                <View style={styles.actionHeader}>
                    <Text style={styles.headerTitle}>Push Notifications</Text>
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <LinearGradient
                            colors={['#8b5cf6', '#7c3aed']}
                            style={styles.addButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Ionicons name="paper-plane" size={20} color="#fff" />
                            <Text style={styles.addButtonText}>Send Notification</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#8b5cf6" style={{ marginTop: 40 }} />
                ) : (
                    <ScrollView contentContainerStyle={styles.listContainer}>
                        {notifications.map((notification) => (
                            <View key={notification._id} style={styles.card}>
                                <View style={[styles.typeStrip, { backgroundColor: getTypeColor(notification.type) }]} />
                                <View style={styles.cardContent}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardTitle}>{notification.title}</Text>
                                        <View style={styles.targetBadge}>
                                            <Text style={styles.targetText}>{getTargetLabel(notification.target)}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.cardBody}>{notification.body}</Text>
                                    <View style={styles.cardFooter}>
                                        <Text style={styles.dateText}>
                                            {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString()}
                                        </Text>
                                        <TouchableOpacity onPress={() => handleDelete(notification._id)} style={styles.deleteButton}>
                                            <Ionicons name="trash-outline" size={18} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                        {notifications.length === 0 && (
                            <View style={styles.emptyState}>
                                <Ionicons name="notifications-off-outline" size={64} color="#cbd5e1" />
                                <Text style={styles.emptyStateText}>No notifications found</Text>
                            </View>
                        )}
                    </ScrollView>
                )}

                {/* Modal */}
                <Modal visible={modalVisible} animationType="slide" transparent={true}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Send New Notification</Text>
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
                                        placeholder="Enter notification title"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Target Audience</Text>
                                    <View style={styles.chipContainer}>
                                        {targets.map((target) => (
                                            <TouchableOpacity
                                                key={target.id}
                                                style={[
                                                    styles.chip,
                                                    formData.target === target.id && styles.activeChip
                                                ]}
                                                onPress={() => setFormData({ ...formData, target: target.id })}
                                            >
                                                <Text style={[
                                                    styles.chipText,
                                                    formData.target === target.id && styles.activeChipText
                                                ]}>
                                                    {target.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Notification Type</Text>
                                    <View style={styles.chipContainer}>
                                        {types.map((type) => (
                                            <TouchableOpacity
                                                key={type.id}
                                                style={[
                                                    styles.chip,
                                                    formData.type === type.id && styles.activeChip
                                                ]}
                                                onPress={() => setFormData({ ...formData, type: type.id })}
                                            >
                                                <Text style={[
                                                    styles.chipText,
                                                    formData.type === type.id && styles.activeChipText
                                                ]}>
                                                    {type.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Message Body</Text>
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        value={formData.body}
                                        onChangeText={(text) => setFormData({ ...formData, body: text })}
                                        placeholder="Enter notification message"
                                        multiline
                                        numberOfLines={4}
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
                                        colors={['#8b5cf6', '#7c3aed']}
                                        style={styles.submitButton}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        <Text style={styles.submitButtonText}>Send Now</Text>
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
    listContainer: {
        paddingBottom: 40,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    typeStrip: {
        width: 6,
    },
    cardContent: {
        flex: 1,
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        flex: 1,
    },
    targetBadge: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    targetText: {
        fontSize: 10,
        color: '#64748b',
        fontWeight: '600',
    },
    cardBody: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 12,
    },
    dateText: {
        fontSize: 12,
        color: '#94a3b8',
    },
    deleteButton: {
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
        height: 100,
        textAlignVertical: 'top',
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
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
