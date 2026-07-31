import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, Platform } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { api } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../auth/AuthContext';

export const AdminManagement = (props: any) => {
    const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');
    const [pendingAdmins, setPendingAdmins] = useState<any[]>([]);
    const [activeAdmins, setActiveAdmins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { admin } = useAuth();

    // Edit State
    const [modalVisible, setModalVisible] = useState(false);
    const [currentAdmin, setCurrentAdmin] = useState<any>(null);
    const [editForm, setEditForm] = useState({ name: '', phone: '', email: '' });

    const fetchAdmins = async () => {
        setLoading(true);
        const [resPending, resActive] = await Promise.all([
            api.getPendingAdmins(),
            api.getActiveAdmins()
        ]);

        if (resPending.success) setPendingAdmins(resPending.data);
        if (resActive.success) setActiveAdmins(resActive.data);
        setLoading(false);
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleApprove = async (id: string, name: string) => {
        if (Platform.OS === 'web') {
            if (window.confirm(`Are you sure you want to approve ${name}?`)) {
                const res = await api.approveAdmin(id);
                if (res.success) {
                    window.alert("Success: Admin approved successfully.");
                    fetchAdmins();
                } else {
                    window.alert("Error: " + res.message);
                }
            }
            return;
        }

        Alert.alert(
            "Approve Admin",
            `Are you sure you want to approve ${name}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Approve",
                    onPress: async () => {
                        const res = await api.approveAdmin(id);
                        if (res.success) {
                            Alert.alert("Success", "Admin approved successfully.");
                            fetchAdmins();
                        } else {
                            Alert.alert("Error", res.message);
                        }
                    }
                }
            ]
        );
    };

    const handleDelete = async (id: string, name: string, isActive: boolean) => {
        const action = isActive ? 'delete' : 'reject';
        if (Platform.OS === 'web') {
            if (window.confirm(`Are you sure you want to ${action} ${name}?`)) {
                const res = await api.deleteAdmin(id);
                if (res.success) {
                    fetchAdmins();
                } else {
                    window.alert("Error: " + res.message);
                }
            }
            return;
        }

        Alert.alert(
            `${isActive ? 'Delete' : 'Reject'} Admin`,
            `Are you sure you want to ${action} ${name}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const res = await api.deleteAdmin(id);
                        if (res.success) {
                            fetchAdmins();
                        } else {
                            Alert.alert("Error", res.message);
                        }
                    }
                }
            ]
        );
    };

    const openEditModal = (adminData: any) => {
        setCurrentAdmin(adminData);
        setEditForm({
            name: adminData.name,
            email: adminData.email,
            phone: adminData.phone || ''
        });
        setModalVisible(true);
    };

    const handleUpdate = async () => {
        if (!currentAdmin) return;
        const res = await api.updateAdmin(currentAdmin._id, editForm);
        if (res.success) {
            setModalVisible(false);
            fetchAdmins();
        } else {
            if (Platform.OS === 'web') {
                window.alert("Error: " + res.message);
            } else {
                Alert.alert("Error", res.message);
            }
        }
    };

    if (admin?.role !== 'super_admin' && admin?.email !== 'masteradmin@urban.com') {
        return (
            <ScreenWrapper title="Admin Management" {...props}>
                <View style={styles.center}>
                    <Ionicons name="lock-closed-outline" size={48} color="#ef4444" />
                    <Text style={styles.errorText}>Access Denied</Text>
                    <Text style={styles.subText}>Only Master Admin can view this page.</Text>
                </View>
            </ScreenWrapper>
        );
    }

    const renderList = (data: any[], isActive: boolean) => {
        if (data.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Ionicons
                        name={isActive ? "people-outline" : "checkmark-circle-outline"}
                        size={48}
                        color="#64748b"
                    />
                    <Text style={styles.emptyText}>
                        {isActive ? "No active admins found" : "No pending requests"}
                    </Text>
                </View>
            );
        }

        return data.map((item) => (
            <View key={item._id} style={styles.card}>
                <View style={styles.cardContent}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.email}>{item.email}</Text>
                        <Text style={{ fontSize: 14, color: '#64748b' }}>{item.phone || 'No phone'}</Text>
                        <View style={[styles.badge, isActive ? styles.badgeActive : styles.badgePending]}>
                            <Text style={[styles.badgeText, isActive ? styles.badgeTextActive : styles.badgeTextPending]}>
                                {isActive ? 'Active' : 'Pending'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.actions}>
                    {!isActive && (
                        <TouchableOpacity
                            style={styles.approveBtn}
                            onPress={() => handleApprove(item._id, item.name)}
                        >
                            <Ionicons name="checkmark" size={18} color="#fff" />
                            <Text style={styles.btnText}>Approve</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => openEditModal(item)}
                    >
                        <Ionicons name="pencil" size={18} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDelete(item._id, item.name, isActive)}
                    >
                        <Ionicons name="trash" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        ));
    };

    return (
        <ScreenWrapper title="Admin Management" {...props}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Admin Management</Text>
                    <TouchableOpacity onPress={fetchAdmins} style={styles.refreshBtn}>
                        <Ionicons name="refresh" size={20} color="#3b82f6" />
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
                        onPress={() => setActiveTab('pending')}
                    >
                        <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
                            Pending ({pendingAdmins.length})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'active' && styles.tabActive]}
                        onPress={() => setActiveTab('active')}
                    >
                        <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
                            Active Admins ({activeAdmins.length})
                        </Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
                ) : (
                    <ScrollView contentContainerStyle={styles.list}>
                        {activeTab === 'pending'
                            ? renderList(pendingAdmins, false)
                            : renderList(activeAdmins, true)
                        }
                    </ScrollView>
                )}

                {/* Edit Modal - Reused */}
                <Modal
                    visible={modalVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Edit Admin</Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editForm.name}
                                    onChangeText={(t) => setEditForm({ ...editForm, name: t })}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email (Read-only)</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: '#f1f5f9' }]}
                                    value={editForm.email}
                                    editable={false}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Phone</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editForm.phone}
                                    onChangeText={(t) => setEditForm({ ...editForm, phone: t })}
                                />
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
                                    <Text style={styles.saveBtnText}>Save Changes</Text>
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
    container: { padding: 24 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
    refreshBtn: { padding: 8, backgroundColor: '#eeffff', borderRadius: 8 },
    list: { gap: 16 },
    card: {
        backgroundColor: '#fff', borderRadius: 12, padding: 20,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
    },
    cardContent: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
    avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    info: { gap: 4 },
    name: { fontSize: 18, fontWeight: '600', color: '#1e293b' },
    email: { fontSize: 14, color: '#64748b' },

    badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
    badgePending: { backgroundColor: '#fef3c7' },
    badgeActive: { backgroundColor: '#dcfce7' },
    badgeText: { fontSize: 12, fontWeight: '500' },
    badgeTextPending: { color: '#d97706' },
    badgeTextActive: { color: '#166534' },

    actions: { flexDirection: 'row', gap: 8 },
    approveBtn: { backgroundColor: '#10b981', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
    editBtn: { backgroundColor: '#3b82f6', padding: 10, borderRadius: 8 },
    deleteBtn: { backgroundColor: '#ef4444', padding: 10, borderRadius: 8 },
    btnText: { color: '#fff', fontWeight: '600' },

    tabs: { flexDirection: 'row', gap: 12, marginBottom: 24, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
    tabActive: { backgroundColor: '#e0f2fe' },
    tabText: { fontSize: 16, color: '#64748b', fontWeight: '500' },
    tabTextActive: { color: '#0284c7', fontWeight: '600' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#fff', width: '90%', maxWidth: 400, borderRadius: 12, padding: 24, gap: 16 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
    inputGroup: { gap: 8 },
    label: { fontSize: 14, fontWeight: '500', color: '#64748b' },
    input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 12, fontSize: 16 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
    cancelBtn: { padding: 12 },
    cancelBtnText: { color: '#64748b', fontWeight: '600' },
    saveBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
    saveBtnText: { color: '#fff', fontWeight: '600' },

    center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100, gap: 16 },
    errorText: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
    subText: { fontSize: 16, color: '#64748b' },
    emptyState: { alignItems: 'center', justifyContent: 'center', padding: 48, gap: 16 },
    emptyText: { fontSize: 18, color: '#64748b' },
});
