import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Switch, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../../components/ui/AppButton';
import { AppInput } from '../../components/ui/AppInput';
import { useTheme } from '../../context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';

import AsyncStorage from '@react-native-async-storage/async-storage';

export const ProfileScreen = ({ navigation }: any) => {
    const { isDark, toggleTheme, colors } = useTheme();
    const [user, setUser] = useState({
        name: 'New User',
        phone: '',
        email: '',
        profileImage: '',
    });
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editedUser, setEditedUser] = useState(user);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const checkAuthAndFetchProfile = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) {
                    // Navigate to Login and reset stack so user can't go back
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                    });
                    return;
                }

                const { api } = require('../../services/api');
                const response = await api.getProfile();
                if (response.success) {
                    setUser({
                        name: response.data.name || 'New User',
                        phone: response.data.phone || '',
                        email: response.data.email || '',
                        profileImage: response.data.profileImage || '',
                    });
                }
            } catch (error) {
                console.log('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };
        checkAuthAndFetchProfile();
    }, []);

    const handlePickImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permissionResult.granted === false) {
                Alert.alert('Permission to access camera roll is required!');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                const { api } = require('../../services/api');
                const formData = new FormData();
                const uri = result.assets[0].uri;
                const filename = uri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename as string);
                const type = match ? `image/${match[1]}` : `image`;

                // @ts-ignore
                formData.append('image', { uri, name: filename, type });

                const response = await api.uploadProfileImage(formData);
                if (response.success) {
                    setUser(prev => ({ ...prev, profileImage: response.data.profileImage }));
                    Alert.alert('Success', 'Profile photo updated');
                }
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Error', 'Failed to upload image');
        }
    };

    const handleSaveProfile = async () => {
        if (!editedUser.name || !editedUser.phone) {
            Alert.alert('Error', 'Name and Phone are required');
            return;
        }

        try {
            const { api } = require('../../services/api');
            const response = await api.updateProfile(editedUser);

            if (response.success) {
                setUser(prev => ({ ...prev, ...editedUser }));
                setIsEditModalVisible(false);
                Alert.alert('Success', 'Profile updated successfully');
            } else {
                Alert.alert('Error', 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile');
        }
    };

    const renderMenuItem = (icon: any, title: string, subtitle?: string, showChevron = true, iconColor = colors.text, onPress?: () => void) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
                <Ionicons name={icon} size={22} color={iconColor} />
            </View>
            <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: colors.text }]}>{title}</Text>
                {subtitle && <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
            </View>
            {showChevron && <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
        </TouchableOpacity>
    );

    const handleLogout = async () => {
        try {
            const { api } = require('../../services/api');
            await api.logout();
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            console.error('Logout failed:', error);
            navigation.replace('Login');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header Profile Card */}
                <View style={[styles.headerCard, { backgroundColor: colors.surface }]}>
                    <View style={styles.profileRow}>
                        <TouchableOpacity
                            style={styles.avatarContainer}
                            onPress={handlePickImage}
                        >
                            {user.profileImage ? (
                                <Image source={{ uri: user.profileImage }} style={styles.avatarImage} />
                            ) : (
                                <Text style={styles.avatarText}>{user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</Text>
                            )}
                            <View style={[styles.editBadge, { borderColor: colors.surface }]}>
                                <Ionicons name="camera" size={12} color={colors.white} />
                            </View>
                        </TouchableOpacity>
                        <View style={styles.profileInfo}>
                            <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
                            <Text style={[styles.userPhone, { color: colors.textSecondary }]}>{user.phone}</Text>
                            <TouchableOpacity onPress={() => {
                                setEditedUser(user);
                                setIsEditModalVisible(true);
                            }}>
                                <Text style={{ color: colors.primary, marginTop: 4 }}>Edit Profile</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.text }]}>12</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Bookings</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.text }]}>4.8</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rating</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.text }]}>2</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Reviews</Text>
                        </View>
                    </View>
                </View>

                {/* Membership Banner */}
                <TouchableOpacity style={[styles.membershipBanner, { backgroundColor: isDark ? colors.surfaceHighlight : '#1A1A1A' }]}>
                    <View style={styles.membershipContent}>
                        <View style={styles.crownIcon}>
                            <Ionicons name="ribbon" size={24} color="#FFD700" />
                        </View>
                        <View>
                            <Text style={[styles.bannerTitle, { color: colors.white }]}>Urban Prox Plus</Text>
                            <Text style={[styles.bannerSubtitle, { color: colors.textSecondary }]}>Save 15% on every order</Text>
                        </View>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color={colors.white} />
                </TouchableOpacity>

                {/* Settings Sections */}
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionHeader, { color: colors.text }]}>Account Settings</Text>
                    {renderMenuItem("location-outline", "Manage Addresses", "Home, Office", true, colors.primary, () => navigation.navigate('ManageAddressesScreen'))}
                    {renderMenuItem("card-outline", "Payment Methods", "Visa ending in 4242", true, colors.secondary, () => navigation.navigate('PaymentMethodsScreen'))}
                    {renderMenuItem("notifications-outline", "Notifications", "On", true, colors.accent, () => navigation.navigate('NotificationsScreen'))}
                </View>

                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionHeader, { color: colors.text }]}>Preferences</Text>
                    <View style={styles.menuItem}>
                        <View style={[styles.iconContainer, { backgroundColor: colors.text + '15' }]}>
                            <Ionicons name="moon-outline" size={22} color={colors.text} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={[styles.menuTitle, { color: colors.text }]}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor={colors.white}
                        />
                    </View>
                    {renderMenuItem("globe-outline", "Language", "English", true, colors.text, () => navigation.navigate('LanguageScreen'))}
                </View>

                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionHeader, { color: colors.text }]}>Support & Legal</Text>
                    {renderMenuItem("help-circle-outline", "Help Center", undefined, true, colors.success, () => navigation.navigate('HelpCenterScreen'))}
                    {renderMenuItem("document-text-outline", "Terms & Conditions", undefined, true, colors.textSecondary, () => navigation.navigate('TermsScreen'))}
                    {renderMenuItem("log-out-outline", "Logout", undefined, false, colors.error, handleLogout)}
                </View>

                <Text style={[styles.versionText, { color: colors.textSecondary }]}>Version 1.0.0</Text>
            </ScrollView>

            <Modal
                visible={isEditModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? colors.surface : colors.white }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
                            <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <AppInput
                                label="Full Name"
                                value={editedUser.name}
                                onChangeText={(text) => setEditedUser({ ...editedUser, name: text })}
                            />
                            <AppInput
                                label="Phone Number"
                                value={editedUser.phone}
                                onChangeText={(text) => setEditedUser({ ...editedUser, phone: text })}
                                keyboardType="phone-pad"
                            />
                            <AppInput
                                label="Email Address"
                                value={editedUser.email}
                                onChangeText={(text) => setEditedUser({ ...editedUser, email: text })}
                                keyboardType="email-address"
                            />

                            <AppButton
                                title="Save Changes"
                                onPress={handleSaveProfile}
                                style={styles.modalButton}
                            />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.m,
        paddingBottom: spacing.xl,
    },
    headerCard: {
        borderRadius: borderRadius.l,
        padding: spacing.m,
        marginBottom: spacing.m,
        ...shadows.small,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.l,
    },
    avatarContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#E91E63', // Keep brand color static or use tokens if available
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.m,
        position: 'relative',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 35,
    },
    avatarText: {
        ...typography.h2,
        color: '#FFFFFF',
        fontSize: 24,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#FF9800', // Accent color
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    profileInfo: {
        flex: 1,
    },
    userName: {
        ...typography.h2,
        marginBottom: 2,
    },
    userPhone: {
        ...typography.body,
        marginBottom: 4,
    },
    membershipText: {
        ...typography.caption,
        color: '#FFD700', // Gold color
        fontWeight: 'bold',
        backgroundColor: '#FFF9E6',
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.s,
        paddingVertical: 2,
        borderRadius: borderRadius.s,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: spacing.m,
        borderTopWidth: 1,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        ...typography.h3,
    },
    statLabel: {
        ...typography.caption,
    },
    statDivider: {
        width: 1,
        height: 24,
    },
    membershipBanner: {
        borderRadius: borderRadius.l,
        padding: spacing.m,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.l,
        ...shadows.medium,
    },
    membershipContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    crownIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.m,
    },
    bannerTitle: {
        ...typography.h3,
    },
    bannerSubtitle: {
        ...typography.caption,
    },
    section: {
        borderRadius: borderRadius.l,
        padding: spacing.m,
        marginBottom: spacing.m,
        ...shadows.small,
    },
    sectionHeader: {
        ...typography.h3,
        marginBottom: spacing.m,
        marginLeft: spacing.s,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.s,
        paddingHorizontal: spacing.s,
        marginBottom: spacing.s,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
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
    },
    menuSubtitle: {
        ...typography.caption,
        marginTop: 2,
    },
    versionText: {
        ...typography.caption,
        textAlign: 'center',
        marginTop: spacing.s,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        padding: spacing.l,
        height: '60%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.l,
    },
    modalTitle: {
        ...typography.h2,
    },
    modalBody: {
        flex: 1,
    },
    modalButton: {
        marginTop: spacing.l,
    }
});
