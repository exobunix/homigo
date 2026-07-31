import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert, Platform, Switch } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../auth/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';

export const TimeSlotManagement = ({ navigation, onNavigate }: { navigation?: any, onNavigate?: (page: string) => void }) => {
    const { admin, logout } = useAuth();
    const [timeSlots, setTimeSlots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingSlot, setEditingSlot] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        startTime: '',
        endTime: '',
        maxBookings: '10',
        isActive: true,
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    });

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    useEffect(() => {
        fetchTimeSlots();
    }, []);

    const fetchTimeSlots = async () => {
        setLoading(true);
        const response = await api.getTimeSlots();
        if (response.success) {
            setTimeSlots(response.data);
        }
        setLoading(false);
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.startTime || !formData.endTime) {
            Alert.alert('Error', 'Name, Start Time and End Time are required');
            return;
        }

        let response;
        if (editingSlot) {
            response = await api.updateTimeSlot(editingSlot._id, formData);
        } else {
            response = await api.createTimeSlot(formData);
        }

        if (response.success) {
            setModalVisible(false);
            fetchTimeSlots();
            setEditingSlot(null);
            setFormData({
                name: '',
                startTime: '',
                endTime: '',
                maxBookings: '10',
                isActive: true,
                days: daysOfWeek
            });
            Alert.alert('Success', `Time Slot ${editingSlot ? 'updated' : 'created'} successfully`);
        } else {
            Alert.alert('Error', response.message);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            'Delete Time Slot',
            'Are you sure you want to delete this time slot?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const response = await api.deleteTimeSlot(id);
                        if (response.success) {
                            fetchTimeSlots();
                        } else {
                            Alert.alert('Error', response.message);
                        }
                    }
                }
            ]
        );
    };

    const openModal = (slot?: any) => {
        if (slot) {
            setEditingSlot(slot);
            setFormData({
                name: slot.name,
                startTime: slot.startTime,
                endTime: slot.endTime,
                maxBookings: slot.maxBookings.toString(),
                isActive: slot.isActive,
                days: slot.days || daysOfWeek
            });
        } else {
            setEditingSlot(null);
            setFormData({
                name: '',
                startTime: '',
                endTime: '',
                maxBookings: '10',
                isActive: true,
                days: daysOfWeek
            });
        }
        setModalVisible(true);
    };

    const toggleDay = (day: string) => {
        if (formData.days.includes(day)) {
            setFormData({ ...formData, days: formData.days.filter(d => d !== day) });
        } else {
            setFormData({ ...formData, days: [...formData.days, day] });
        }
    };

    return (
        <ScreenWrapper title="Time Slot Management" onLogout={logout} adminName={admin?.name} currentPage="timeslots" onNavigate={onNavigate}>
            <View style={styles.container}>
                <View style={styles.actionHeader}>
                    <Text style={styles.headerTitle}>Booking Time Slots</Text>
                    <TouchableOpacity onPress={() => openModal()}>
                        <LinearGradient
                            colors={['#6366f1', '#4f46e5']}
                            style={styles.addButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Ionicons name="add" size={20} color="#fff" />
                            <Text style={styles.addButtonText}>Add Slot</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#6366f1" style={{ marginTop: 40 }} />
                ) : (
                    <ScrollView contentContainerStyle={styles.listContainer}>
                        {timeSlots.map((slot) => (
                            <View key={slot._id} style={styles.listItem}>
                                <View style={styles.itemLeft}>
                                    <View style={styles.timeBox}>
                                        <Text style={styles.timeText}>{slot.startTime}</Text>
                                        <Ionicons name="arrow-down" size={12} color="#6366f1" />
                                        <Text style={styles.timeText}>{slot.endTime}</Text>
                                    </View>
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.itemTitle}>{slot.name}</Text>
                                        <Text style={styles.itemSubtitle}>Max Bookings: {slot.maxBookings}</Text>
                                        <View style={styles.daysRow}>
                                            {slot.days.length === 7 ? (
                                                <Text style={styles.daysText}>Every Day</Text>
                                            ) : (
                                                <Text style={styles.daysText}>{slot.days.map((d: string) => d.slice(0, 3)).join(', ')}</Text>
                                            )}
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.itemActions}>
                                    <Switch
                                        value={slot.isActive}
                                        onValueChange={() => { }}
                                        trackColor={{ false: '#cbd5e1', true: '#6366f1' }}
                                        style={{ transform: [{ scale: 0.8 }] }}
                                    />
                                    <TouchableOpacity onPress={() => openModal(slot)} style={styles.actionButton}>
                                        <Ionicons name="pencil" size={20} color="#64748b" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDelete(slot._id)} style={styles.actionButton}>
                                        <Ionicons name="trash" size={20} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                        {timeSlots.length === 0 && (
                            <View style={styles.emptyState}>
                                <Ionicons name="time-outline" size={64} color="#cbd5e1" />
                                <Text style={styles.emptyStateText}>No time slots found</Text>
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
                                    {editingSlot ? 'Edit Time Slot' : 'Add New Time Slot'}
                                </Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.formScroll}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Slot Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.name}
                                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                                        placeholder="e.g. Morning Slot"
                                    />
                                </View>

                                <View style={styles.rowGroup}>
                                    <View style={{ flex: 1, marginRight: 8 }}>
                                        <Text style={styles.label}>Start Time</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={formData.startTime}
                                            onChangeText={(text) => setFormData({ ...formData, startTime: text })}
                                            placeholder="09:00 AM"
                                        />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 8 }}>
                                        <Text style={styles.label}>End Time</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={formData.endTime}
                                            onChangeText={(text) => setFormData({ ...formData, endTime: text })}
                                            placeholder="12:00 PM"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Max Bookings</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.maxBookings}
                                        onChangeText={(text) => setFormData({ ...formData, maxBookings: text })}
                                        placeholder="10"
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Active Days</Text>
                                    <View style={styles.daysGrid}>
                                        {daysOfWeek.map((day) => (
                                            <TouchableOpacity
                                                key={day}
                                                style={[
                                                    styles.dayChip,
                                                    formData.days.includes(day) && styles.activeDayChip
                                                ]}
                                                onPress={() => toggleDay(day)}
                                            >
                                                <Text style={[
                                                    styles.dayChipText,
                                                    formData.days.includes(day) && styles.activeDayChipText
                                                ]}>
                                                    {day.slice(0, 3)}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View style={styles.rowGroup}>
                                    <Text style={styles.label}>Active Status</Text>
                                    <Switch
                                        value={formData.isActive}
                                        onValueChange={(val) => setFormData({ ...formData, isActive: val })}
                                        trackColor={{ false: '#cbd5e1', true: '#6366f1' }}
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
                                        colors={['#6366f1', '#4f46e5']}
                                        style={styles.submitButton}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        <Text style={styles.submitButtonText}>
                                            {editingSlot ? 'Update' : 'Create'}
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
    listContainer: {
        paddingBottom: 40,
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    timeBox: {
        backgroundColor: '#e0e7ff',
        padding: 8,
        borderRadius: 8,
        alignItems: 'center',
        marginRight: 16,
        width: 80,
    },
    timeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#4338ca',
    },
    itemInfo: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    itemSubtitle: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 4,
    },
    daysRow: {
        flexDirection: 'row',
    },
    daysText: {
        fontSize: 12,
        color: '#94a3b8',
        fontStyle: 'italic',
    },
    itemActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    actionButton: {
        padding: 8,
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
        maxWidth: 500,
        backgroundColor: '#fff',
        borderRadius: 20,
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
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    dayChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    activeDayChip: {
        backgroundColor: '#e0e7ff',
        borderColor: '#6366f1',
    },
    dayChipText: {
        fontSize: 12,
        color: '#64748b',
    },
    activeDayChipText: {
        color: '#4338ca',
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
