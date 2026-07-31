import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../auth/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import * as ImagePicker from 'expo-image-picker';

export const EditProfileScreen = ({ onNavigate }: { onNavigate?: (page: string) => void }) => {
    const { admin, logout, updateAdmin } = useAuth();
    const [name, setName] = useState(admin?.name || '');
    const [email, setEmail] = useState(admin?.email || '');
    const [phone, setPhone] = useState(admin?.phone || '');
    const [profileImage, setProfileImage] = useState(admin?.profileImage || '');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please grant camera roll permissions');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: true,
            });

            if (!result.canceled && result.assets[0].base64) {
                setUploading(true);
                const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;

                const response = await api.uploadProfilePhoto(base64Image);
                if (response.success) {
                    setProfileImage(response.data.profileImage);
                    updateAdmin({ ...admin, profileImage: response.data.profileImage });
                    Alert.alert('Success', 'Profile photo updated successfully');
                } else {
                    Alert.alert('Error', 'Failed to upload photo');
                }
                setUploading(false);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        if (!email.trim()) {
            Alert.alert('Error', 'Email is required');
            return;
        }

        setLoading(true);
        try {
            const response = await api.updateProfile({ name, email, phone });
            if (response.success) {
                updateAdmin(response.data);
                Alert.alert('Success', 'Profile updated successfully');
                if (onNavigate) {
                    onNavigate('profile');
                }
            } else {
                Alert.alert('Error', response.message || 'Failed to update profile');
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper
            title="Edit Profile"
            onLogout={logout}
            adminName={admin?.name || 'Admin'}
            currentPage="profile"
            onNavigate={onNavigate}
        >
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.contentContainer}>
                    {/* Header Card */}
                    <View style={styles.card}>
                        <View style={styles.headerGradient} />
                        <View style={styles.photoSection}>
                            <View style={styles.photoContainer}>
                                {profileImage ? (
                                    <Image source={{ uri: profileImage }} style={styles.profilePhoto} />
                                ) : (
                                    <View style={styles.placeholderPhoto}>
                                        <Text style={styles.placeholderText}>
                                            {name ? name.charAt(0).toUpperCase() : 'A'}
                                        </Text>
                                    </View>
                                )}
                                <TouchableOpacity
                                    style={styles.changePhotoBtn}
                                    onPress={pickImage}
                                    disabled={uploading}
                                >
                                    {uploading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Ionicons name="camera" size={20} color="#fff" />
                                    )}
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.photoHint}>Tap icon to change photo</Text>
                        </View>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formCard}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="person-outline" size={20} color="#94a3b8" />
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Enter your name"
                                    placeholderTextColor="#cbd5e1"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="mail-outline" size={20} color="#94a3b8" />
                                <TextInput
                                    style={styles.input}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Enter your email"
                                    placeholderTextColor="#cbd5e1"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="call-outline" size={20} color="#94a3b8" />
                                <TextInput
                                    style={styles.input}
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholder="Enter your phone number"
                                    placeholderTextColor="#cbd5e1"
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleSave}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="save-outline" size={20} color="#fff" />
                                        <Text style={styles.saveButtonText}>Save Changes</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => onNavigate && onNavigate('profile')}
                                disabled={loading}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
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
        maxWidth: 600,
        width: '100%',
        alignSelf: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 24,
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
    },
    headerGradient: {
        height: 80,
        backgroundColor: '#1e293b',
        width: '100%',
    },
    photoSection: {
        alignItems: 'center',
        marginTop: -40,
        paddingBottom: 24,
    },
    photoContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    profilePhoto: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#fff',
    },
    placeholderPhoto: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#fff',
    },
    placeholderText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#94a3b8',
    },
    changePhotoBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    photoHint: {
        fontSize: 13,
        color: '#64748b',
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#64748b',
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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        height: 50,
    },
    input: {
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        color: '#1e293b',
        height: '100%',
    },
    buttonContainer: {
        gap: 12,
        marginTop: 12,
    },
    saveButton: {
        flexDirection: 'row',
        backgroundColor: '#3b82f6',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        backgroundColor: '#fff',
    },
    cancelButtonText: {
        color: '#64748b',
        fontSize: 16,
        fontWeight: '600',
    },
});
