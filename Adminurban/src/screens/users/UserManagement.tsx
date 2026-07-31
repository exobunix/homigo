import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Dimensions, Alert } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../auth/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';
import { confirmAction, showAlert } from '../../utils/alert';

const { width } = Dimensions.get('window');

import { useRefresh } from '../../hooks/useRefresh';

export const UserManagement = ({ onNavigate }: { onNavigate?: (page: string) => void }) => {
    const { admin, logout } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const fetchUsers = async () => {
        // Don't set loading true if refreshing to avoid flickering
        if (!refreshing) setLoading(true);
        const response = await api.getUsers();
        if (response.success) {
            setUsers(response.data);
        }
        setLoading(false);
        setRefreshing(false);
    };

    useRefresh(
        React.useCallback(() => {
            fetchUsers();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchUsers();
    };

    const handleToggleBlock = async (user: any) => {
        confirmAction(
            user.isBlocked ? "Unblock User" : "Block User",
            `Are you sure you want to ${user.isBlocked ? "unblock" : "block"} ${user.name}?`,
            async () => {
                const response = await api.toggleUserBlock(user._id);
                if (response.success) {
                    fetchUsers();
                } else {
                    showAlert("Error", "Failed to update user status");
                }
            },
            undefined,
            "Confirm",
            "Cancel",
            !user.isBlocked
        );
    };

    const filteredUsers = users.filter(user =>
        (user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (user.phone?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    const stats = [
        { label: 'Total Users', value: users.length.toString(), icon: 'people', gradient: ['#667eea', '#764ba2'] },
        { label: 'Active', value: users.filter(u => !u.isBlocked).length.toString(), icon: 'checkmark-circle', gradient: ['#43e97b', '#38f9d7'] },
        { label: 'Blocked', value: users.filter(u => u.isBlocked).length.toString(), icon: 'ban', gradient: ['#f093fb', '#f5576c'] },
    ];

    const renderUserCard = ({ item }: { item: any }) => {
        const status = item.isBlocked ? 'Blocked' : 'Active';
        const joinedDate = new Date(item.createdAt).toLocaleDateString();
        const avatarLetter = item.name ? item.name.charAt(0).toUpperCase() : 'U';

        return (
            <TouchableOpacity style={styles.userCard} activeOpacity={0.7}>
                <View style={styles.userCardContent}>
                    <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.avatar}
                    >
                        <Text style={styles.avatarText}>{avatarLetter}</Text>
                    </LinearGradient>

                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{item.name || 'No Name'}</Text>
                        <View style={styles.userMeta}>
                            <Ionicons name="mail" size={12} color="#64748b" />
                            <Text style={styles.userEmail}>{item.email || 'No Email'}</Text>
                        </View>
                        <View style={styles.userMeta}>
                            <Ionicons name="call" size={12} color="#64748b" />
                            <Text style={styles.userPhone}>{item.phone}</Text>
                        </View>
                        <View style={styles.userFooter}>
                            <View style={[
                                styles.statusBadge,
                                { backgroundColor: !item.isBlocked ? '#d1fae5' : '#fee2e2' }
                            ]}>
                                <View style={[
                                    styles.statusDot,
                                    { backgroundColor: !item.isBlocked ? '#10b981' : '#ef4444' }
                                ]} />
                                <Text style={[
                                    styles.statusText,
                                    { color: !item.isBlocked ? '#10b981' : '#ef4444' }
                                ]}>
                                    {status}
                                </Text>
                            </View>
                            <Text style={styles.joinedText}>Joined {joinedDate}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: item.isBlocked ? '#d1fae5' : '#fef2f2' }]}
                        onPress={() => handleToggleBlock(item)}
                    >
                        <Ionicons
                            name={item.isBlocked ? "checkmark-circle" : "ban"}
                            size={18}
                            color={item.isBlocked ? "#10b981" : "#ef4444"}
                        />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ScreenWrapper
            title="User Management"
            onLogout={logout}
            adminName={admin?.name || 'Admin'}
            currentPage="users"
            onNavigate={onNavigate}
        >
            {/* Stats Row */}
            <View style={styles.statsRow}>
                {stats.map((stat, index) => (
                    <View key={index} style={styles.statCard}>
                        <LinearGradient
                            colors={stat.gradient as any}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.statIconContainer}
                        >
                            <Ionicons name={stat.icon as any} size={20} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.statValue}>{stat.value}</Text>
                        <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                ))}
            </View>

            {/* Search */}
            <View style={styles.searchSection}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search users..."
                        placeholderTextColor="#94a3b8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Users List */}
            <View style={styles.listHeader}>
                <Text style={styles.listTitle}>
                    All Users ({filteredUsers.length})
                </Text>
            </View>

            <FlatList
                data={filteredUsers}
                keyExtractor={item => item._id}
                renderItem={renderUserCard}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="people-outline" size={64} color="#cbd5e1" />
                        <Text style={styles.emptyText}>No users found</Text>
                    </View>
                }
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    statIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 3,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        color: '#64748b',
        fontWeight: '600',
    },
    searchSection: {
        marginBottom: 24,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1e293b',
        fontWeight: '500',
    },
    listHeader: {
        marginBottom: 16,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    listContent: {
        paddingBottom: 24,
    },
    userCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    userCardContent: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 6,
    },
    userMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
    },
    userPhone: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
    },
    userFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    joinedText: {
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: '600',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'flex-end',
    },
    actionBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#64748b',
        marginTop: 16,
    },
});
