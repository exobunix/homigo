import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { useAuth } from '../../auth/AuthContext';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';

export const ProfileScreen = ({ onNavigate }: { onNavigate?: (page: string) => void }) => {
    const { admin, logout } = useAuth();

    const handleNavigate = (page: string) => {
        if (onNavigate) {
            onNavigate(page);
        }
    };

    return (
        <ScreenWrapper
            title="My Profile"
            onLogout={logout}
            adminName={admin?.name || 'Admin'}
            currentPage="profile"
            onNavigate={onNavigate}
        >
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.contentContainer}>
                    {/* Profile Card */}
                    <View style={styles.card}>
                        <View style={styles.headerGradient} />
                        <View style={styles.profileContent}>
                            <View style={styles.avatarContainer}>
                                {admin?.profileImage ? (
                                    <Image source={{ uri: admin.profileImage }} style={styles.avatar} />
                                ) : (
                                    <View style={styles.avatarPlaceholder}>
                                        <Text style={styles.avatarText}>
                                            {admin?.name?.charAt(0).toUpperCase() || 'A'}
                                        </Text>
                                    </View>
                                )}
                                <TouchableOpacity style={styles.editBadge} onPress={() => handleNavigate('editProfile')}>
                                    <Ionicons name="pencil" size={14} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.name}>{admin?.name || 'Admin User'}</Text>
                            <Text style={styles.email}>{admin?.email || 'admin@urbanprox.com'}</Text>

                            <View style={styles.roleContainer}>
                                <Ionicons name="shield-checkmark" size={14} color="#3b82f6" />
                                <Text style={styles.role}>{admin?.role || 'Super Admin'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Actions Grid */}
                    <View style={styles.grid}>
                        <Text style={styles.sectionTitle}>Account Settings</Text>

                        <TouchableOpacity style={styles.actionCard} onPress={() => handleNavigate('editProfile')}>
                            <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
                                <Ionicons name="person-outline" size={22} color="#3b82f6" />
                            </View>
                            <View style={styles.actionInfo}>
                                <Text style={styles.actionTitle}>Edit Profile</Text>
                                <Text style={styles.actionDesc}>Update your personal details and photo</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionCard} onPress={() => handleNavigate('settings')}>
                            <View style={[styles.iconBox, { backgroundColor: '#f0fdf4' }]}>
                                <Ionicons name="settings-outline" size={22} color="#22c55e" />
                            </View>
                            <View style={styles.actionInfo}>
                                <Text style={styles.actionTitle}>Settings</Text>
                                <Text style={styles.actionDesc}>Manage app preferences and security</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.actionCard, styles.logoutCard]} onPress={logout}>
                            <View style={[styles.iconBox, { backgroundColor: '#fef2f2' }]}>
                                <Ionicons name="log-out-outline" size={22} color="#ef4444" />
                            </View>
                            <View style={styles.actionInfo}>
                                <Text style={[styles.actionTitle, { color: '#ef4444' }]}>Logout</Text>
                                <Text style={styles.actionDesc}>Sign out of your account</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    contentContainer: {
        maxWidth: 800,
        width: '100%',
        alignSelf: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 32,
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
    },
    headerGradient: {
        height: 100,
        backgroundColor: '#1e293b',
        width: '100%',
    },
    profileContent: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 32,
        marginTop: -50,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#fff',
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#fff',
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#64748b',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#3b82f6',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 16,
    },
    roleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eff6ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    role: {
        fontSize: 12,
        fontWeight: '600',
        color: '#3b82f6',
    },
    grid: {
        gap: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 8,
        marginLeft: 4,
    },
    actionCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    actionInfo: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: 2,
    },
    actionDesc: {
        fontSize: 13,
        color: '#64748b',
    },
    logoutCard: {
        marginTop: 8,
        borderColor: '#fef2f2',
    },
});
