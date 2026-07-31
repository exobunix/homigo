import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../auth/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export const SettingsScreen = ({ onNavigate }: { onNavigate?: (page: string) => void }) => {
    const { admin, logout } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        // Validation
        if (!currentPassword.trim()) {
            Alert.alert('Error', 'Please enter your current password');
            return;
        }

        if (!newPassword.trim()) {
            Alert.alert('Error', 'Please enter a new password');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'New password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        if (currentPassword === newPassword) {
            Alert.alert('Error', 'New password must be different from current password');
            return;
        }

        setLoading(true);
        try {
            const response = await api.changePassword(currentPassword, newPassword);
            if (response.success) {
                Alert.alert('Success', 'Password changed successfully', [
                    {
                        text: 'OK',
                        onPress: () => {
                            setCurrentPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                        }
                    }
                ]);
            } else {
                Alert.alert('Error', response.message || 'Failed to change password');
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const settingsOptions = [
        {
            title: 'Account',
            items: [
                { icon: 'person-outline', label: 'Edit Profile', color: '#3b82f6', onPress: () => onNavigate && onNavigate('editProfile') },
                { icon: 'mail-outline', label: 'Email', value: admin?.email, color: '#10b981', onPress: undefined },
                { icon: 'call-outline', label: 'Phone', value: admin?.phone || 'Not set', color: '#f59e0b', onPress: undefined },
            ]
        },
        {
            title: 'Preferences',
            items: [
                { icon: 'notifications-outline', label: 'Notifications', color: '#8b5cf6', toggle: true, onPress: undefined },
                { icon: 'moon-outline', label: 'Dark Mode', color: '#6366f1', toggle: true, onPress: undefined },
                { icon: 'language-outline', label: 'Language', value: 'English', color: '#06b6d4', onPress: undefined },
            ]
        }
    ];

    return (
        <ScreenWrapper
            title="Settings"
            onLogout={logout}
            adminName={admin?.name || 'Admin'}
            currentPage="profile"
            onNavigate={onNavigate}
        >
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Change Password Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="lock-closed" size={24} color="#3b82f6" />
                        <Text style={styles.sectionTitle}>Change Password</Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Current Password</Text>
                            <View style={styles.passwordContainer}>
                                <Ionicons name="lock-closed-outline" size={20} color="#64748b" />
                                <TextInput
                                    style={styles.input}
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    placeholder="Enter current password"
                                    placeholderTextColor="#94a3b8"
                                    secureTextEntry={!showCurrentPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                                    <Ionicons
                                        name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color="#64748b"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>New Password</Text>
                            <View style={styles.passwordContainer}>
                                <Ionicons name="key-outline" size={20} color="#64748b" />
                                <TextInput
                                    style={styles.input}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholder="Enter new password"
                                    placeholderTextColor="#94a3b8"
                                    secureTextEntry={!showNewPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                                    <Ionicons
                                        name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color="#64748b"
                                    />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.hint}>Must be at least 6 characters</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Confirm New Password</Text>
                            <View style={styles.passwordContainer}>
                                <Ionicons name="checkmark-circle-outline" size={20} color="#64748b" />
                                <TextInput
                                    style={styles.input}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Confirm new password"
                                    placeholderTextColor="#94a3b8"
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <Ionicons
                                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color="#64748b"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.changePasswordBtn}
                            onPress={handleChangePassword}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="shield-checkmark" size={20} color="#fff" />
                                    <Text style={styles.changePasswordText}>Update Password</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Settings Options */}
                {settingsOptions.map((section, index) => (
                    <View key={index} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <View style={styles.card}>
                            {section.items.map((item, itemIndex) => (
                                <TouchableOpacity
                                    key={itemIndex}
                                    style={[
                                        styles.settingItem,
                                        itemIndex !== section.items.length - 1 && styles.settingItemBorder
                                    ]}
                                    onPress={item.onPress}
                                    disabled={!item.onPress}
                                >
                                    <View style={styles.settingLeft}>
                                        <View style={[styles.settingIcon, { backgroundColor: `${item.color}15` }]}>
                                            <Ionicons name={item.icon as any} size={20} color={item.color} />
                                        </View>
                                        <Text style={styles.settingLabel}>{item.label}</Text>
                                    </View>
                                    {item.value && (
                                        <Text style={styles.settingValue}>{item.value}</Text>
                                    )}
                                    {item.onPress && (
                                        <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Danger Zone */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Danger Zone</Text>
                    <View style={styles.card}>
                        <TouchableOpacity style={styles.dangerItem} onPress={logout}>
                            <View style={styles.settingLeft}>
                                <View style={[styles.settingIcon, { backgroundColor: '#fee2e2' }]}>
                                    <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                                </View>
                                <Text style={[styles.settingLabel, { color: '#ef4444' }]}>Logout</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
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
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 12,
        fontSize: 15,
        color: '#1e293b',
    },
    hint: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 6,
    },
    changePasswordBtn: {
        flexDirection: 'row',
        backgroundColor: '#3b82f6',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 8,
    },
    changePasswordText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
    },
    settingItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingLabel: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1e293b',
    },
    settingValue: {
        fontSize: 14,
        color: '#64748b',
        marginRight: 8,
    },
    dangerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
});
