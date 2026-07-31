import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, TextInput, ScrollView, Alert } from 'react-native';
import { WebLayout } from './WebLayout';
import { colors, spacing, typography, borderRadius, shadows, palette } from '../../theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';

export const WebProfile = ({ onNavigate }: { onNavigate: (route: string) => void }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState<any>({});

    const [stats, setStats] = useState({
        bookings: 0,
        rating: 0,
        reviews: 0
    });

    useEffect(() => {
        loadProfile();
        loadStats();
    }, []);

    const loadProfile = async () => {
        try {
            const response = await api.getProfile();
            if (response.success && response.data) {
                setUser(response.data);
                setEditedUser(response.data);
            }
        } catch (error) {
            console.error('Failed to load profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const bookingsResponse = await api.getUserBookings(user?.id || '');
            if (bookingsResponse.success && bookingsResponse.data) {
                setStats({
                    bookings: bookingsResponse.data.length || 0,
                    rating: 4.8,
                    reviews: 2
                });
            }
        } catch (error) {
            console.log('Could not load stats');
        }
    };

    const handleSaveProfile = async () => {
        try {
            const response = await api.updateProfile(editedUser);
            if (response.success) {
                setUser(editedUser);
                setIsEditing(false);
                alert('Profile updated successfully!');
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Failed to update profile');
        }
    };

    const handleLogout = async () => {
        try {
            await api.logout();
            onNavigate('login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (loading) {
        return (
            <WebLayout onNavigate={onNavigate}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </WebLayout>
        );
    }

    if (!user) {
        return (
            <WebLayout onNavigate={onNavigate}>
                <View style={styles.emptyContainer}>
                    <Ionicons name="person-circle-outline" size={100} color={colors.textSecondary} />
                    <Text style={styles.emptyText}>Please login to view your profile</Text>
                    <TouchableOpacity style={styles.loginButton} onPress={() => onNavigate('login')}>
                        <Text style={styles.loginButtonText}>Go to Login</Text>
                    </TouchableOpacity>
                </View>
            </WebLayout>
        );
    }

    return (
        <WebLayout onNavigate={onNavigate}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
                {/* Profile Header Card */}
                <View style={styles.headerCard}>
                    <View style={styles.profileRow}>
                        <View style={styles.avatarContainer}>
                            {user.profileImage ? (
                                <Image source={{ uri: user.profileImage }} style={styles.avatarImage} />
                            ) : (
                                <Text style={styles.avatarText}>
                                    {user.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                                </Text>
                            )}
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.userName}>{user.name || 'User'}</Text>
                            <Text style={styles.userPhone}>{user.phone || 'No phone number'}</Text>
                            <Text style={styles.userEmail}>{user.email || 'No email set'}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.editIconButton}
                            onPress={() => setIsEditing(!isEditing)}
                        >
                            <Ionicons name={isEditing ? "close" : "create-outline"} size={24} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.bookings}</Text>
                            <Text style={styles.statLabel}>Bookings</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.rating}</Text>
                            <Text style={styles.statLabel}>Rating</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.reviews}</Text>
                            <Text style={styles.statLabel}>Reviews</Text>
                        </View>
                    </View>
                </View>

                {/* Edit Profile Form */}
                {isEditing && (
                    <View style={styles.editCard}>
                        <Text style={styles.sectionTitle}>Edit Profile</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                value={editedUser.name || ''}
                                onChangeText={(text) => setEditedUser({ ...editedUser, name: text })}
                                placeholder="Enter your name"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Email</Text>
                            <TextInput
                                style={styles.input}
                                value={editedUser.email || ''}
                                onChangeText={(text) => setEditedUser({ ...editedUser, email: text })}
                                placeholder="Enter your email"
                                keyboardType="email-address"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Phone</Text>
                            <TextInput
                                style={styles.input}
                                value={editedUser.phone || ''}
                                onChangeText={(text) => setEditedUser({ ...editedUser, phone: text })}
                                placeholder="Enter your phone"
                                keyboardType="phone-pad"
                                editable={false}
                            />
                            <Text style={styles.inputHint}>Phone number cannot be changed</Text>
                        </View>

                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Premium Banner */}
                <TouchableOpacity style={styles.premiumBanner}>
                    <View style={styles.premiumContent}>
                        <View style={styles.crownIcon}>
                            <Ionicons name="ribbon" size={24} color="#FFD700" />
                        </View>
                        <View>
                            <Text style={styles.premiumTitle}>Urban Prox Plus</Text>
                            <Text style={styles.premiumSubtitle}>Save 15% on every order</Text>
                        </View>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color={colors.white} />
                </TouchableOpacity>

                {/* Account Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Account Settings</Text>

                    <TouchableOpacity style={styles.menuItem} onPress={() => onNavigate('bookings')}>
                        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                            <Ionicons name="calendar-outline" size={22} color={colors.primary} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>My Bookings</Text>
                            <Text style={styles.menuSubtitle}>View all your bookings</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={[styles.iconContainer, { backgroundColor: colors.secondary + '15' }]}>
                            <Ionicons name="location-outline" size={22} color={colors.secondary} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>Manage Addresses</Text>
                            <Text style={styles.menuSubtitle}>Home, Office</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={[styles.iconContainer, { backgroundColor: colors.accent + '15' }]}>
                            <Ionicons name="card-outline" size={22} color={colors.accent} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>Payment Methods</Text>
                            <Text style={styles.menuSubtitle}>Manage your cards</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Support & Legal */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Support & Legal</Text>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={[styles.iconContainer, { backgroundColor: colors.success + '15' }]}>
                            <Ionicons name="help-circle-outline" size={22} color={colors.success} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>Help Center</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={[styles.iconContainer, { backgroundColor: colors.textSecondary + '15' }]}>
                            <Ionicons name="document-text-outline" size={22} color={colors.textSecondary} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>Terms & Conditions</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                        <View style={[styles.iconContainer, { backgroundColor: colors.error + '15' }]}>
                            <Ionicons name="log-out-outline" size={22} color={colors.error} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={[styles.menuTitle, { color: colors.error }]}>Logout</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <Text style={styles.versionText}>Version 1.0.0</Text>
            </ScrollView>
        </WebLayout>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        maxWidth: 900,
        alignSelf: 'center',
        width: '100%',
        padding: spacing.xl,
        paddingBottom: spacing.xxl,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 400,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xxl,
        minHeight: 400,
    },
    emptyText: {
        ...typography.h3,
        color: colors.textSecondary,
        marginTop: spacing.l,
        marginBottom: spacing.xl,
    },
    loginButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.m,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.m,
    },
    loginButtonText: {
        ...typography.bodyBold,
        color: colors.white,
    },
    headerCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        marginBottom: spacing.l,
        ...shadows.medium,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.l,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    avatarText: {
        fontSize: 36,
        color: colors.white,
        fontWeight: 'bold',
    },
    profileInfo: {
        flex: 1,
    },
    userName: {
        ...typography.h2,
        fontSize: 28,
        marginBottom: spacing.xs,
    },
    userPhone: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    userEmail: {
        ...typography.body,
        color: colors.textSecondary,
    },
    editIconButton: {
        padding: spacing.s,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: spacing.l,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        ...typography.h2,
        fontSize: 32,
        color: colors.text,
    },
    statLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: colors.border,
    },
    editCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        marginBottom: spacing.l,
        ...shadows.medium,
    },
    sectionTitle: {
        ...typography.h3,
        fontSize: 24,
        marginBottom: spacing.l,
    },
    inputGroup: {
        marginBottom: spacing.l,
    },
    inputLabel: {
        ...typography.bodyBold,
        marginBottom: spacing.s,
        color: colors.text,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.m,
        padding: spacing.m,
        fontSize: 16,
        backgroundColor: colors.white,
    },
    inputHint: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    saveButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.m,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.m,
        alignItems: 'center',
        marginTop: spacing.m,
    },
    saveButtonText: {
        ...typography.bodyBold,
        color: colors.white,
        fontSize: 16,
    },
    premiumBanner: {
        backgroundColor: '#1A1A1A',
        borderRadius: borderRadius.xl,
        padding: spacing.l,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.l,
        ...shadows.large,
    },
    premiumContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    crownIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.m,
    },
    premiumTitle: {
        ...typography.h3,
        color: colors.white,
        fontSize: 20,
    },
    premiumSubtitle: {
        ...typography.body,
        color: palette.gray300,
    },
    section: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        padding: spacing.l,
        marginBottom: spacing.l,
        ...shadows.small,
    },
    sectionHeader: {
        ...typography.h3,
        fontSize: 20,
        marginBottom: spacing.m,
        color: colors.text,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.m,
        paddingHorizontal: spacing.s,
        borderRadius: borderRadius.m,
        marginBottom: spacing.xs,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.m,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        ...typography.body,
        fontWeight: '600',
        fontSize: 16,
        color: colors.text,
    },
    menuSubtitle: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 2,
    },
    versionText: {
        ...typography.caption,
        textAlign: 'center',
        color: colors.textSecondary,
        marginTop: spacing.l,
    },
});
