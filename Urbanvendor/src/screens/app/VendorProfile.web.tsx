import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Card, Text, TextInput, Button, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import WebLayout from '@/components/WebLayout';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateProfile } from '@/store/slices/authSlice';
import { theme } from '@/theme/theme';

export default function VendorProfile() {
    const dispatch = useAppDispatch();
    const { user, isLoading } = useAppSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        bio: (user as any)?.bio || '',
    });

    const [image, setImage] = useState(user?.profileImage || null);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSave = () => {
        // Dispatch update profile action
        // dispatch(updateProfile({ ...formData, profileImage: image }));
        console.log('Saving profile:', formData, image);
    };

    return (
        <WebLayout
            title="Profile Settings"
            subtitle="Manage your account information and preferences."
        >
            <ScrollView style={styles.container}>
                <View style={styles.grid}>
                    {/* Left Column - Profile Image & Basic Info */}
                    <View style={styles.leftColumn}>
                        <Card style={styles.card}>
                            <Card.Content style={styles.centerContent}>
                                <View style={styles.imageWrapper}>
                                    <Image
                                        source={{ uri: image || 'https://ui-avatars.com/api/?name=' + (formData.name || 'User') }}
                                        style={styles.profileImage}
                                    />
                                    <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
                                        <MaterialCommunityIcons name="camera" size={20} color="#ffffff" />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.name}>{formData.name || 'Vendor Name'}</Text>
                                <Text style={styles.role}>Verified Vendor</Text>
                            </Card.Content>
                        </Card>

                        <Card style={[styles.card, { marginTop: 24 }]}>
                            <Card.Content>
                                <Text style={styles.sectionTitle}>Contact Information</Text>
                                <View style={styles.infoRow}>
                                    <MaterialCommunityIcons name="email-outline" size={20} color="#64748b" />
                                    <Text style={styles.infoText}>{formData.email}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <MaterialCommunityIcons name="phone-outline" size={20} color="#64748b" />
                                    <Text style={styles.infoText}>{formData.phone}</Text>
                                </View>
                            </Card.Content>
                        </Card>
                    </View>

                    {/* Right Column - Edit Form */}
                    <View style={styles.rightColumn}>
                        <Card style={styles.card}>
                            <Card.Content>
                                <Text style={styles.sectionTitle}>Edit Profile</Text>

                                <View style={styles.formRow}>
                                    <View style={styles.inputWrapper}>
                                        <Text style={styles.label}>Full Name</Text>
                                        <TextInput
                                            mode="outlined"
                                            value={formData.name}
                                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                                            style={styles.input}
                                            outlineColor="#e2e8f0"
                                            activeOutlineColor={theme.colors.primary}
                                        />
                                    </View>
                                    <View style={styles.inputWrapper}>
                                        <Text style={styles.label}>Phone Number</Text>
                                        <TextInput
                                            mode="outlined"
                                            value={formData.phone}
                                            onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                            style={styles.input}
                                            outlineColor="#e2e8f0"
                                            activeOutlineColor={theme.colors.primary}
                                            disabled // Phone usually not editable directly
                                        />
                                        <HelperText type="info">Contact support to change phone number</HelperText>
                                    </View>
                                </View>

                                <View style={styles.inputWrapper}>
                                    <Text style={styles.label}>Email Address</Text>
                                    <TextInput
                                        mode="outlined"
                                        value={formData.email}
                                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                                        style={styles.input}
                                        outlineColor="#e2e8f0"
                                        activeOutlineColor={theme.colors.primary}
                                    />
                                </View>

                                <View style={styles.inputWrapper}>
                                    <Text style={styles.label}>Bio / Description</Text>
                                    <TextInput
                                        mode="outlined"
                                        value={formData.bio}
                                        onChangeText={(text) => setFormData({ ...formData, bio: text })}
                                        style={[styles.input, { height: 100 }]}
                                        outlineColor="#e2e8f0"
                                        activeOutlineColor={theme.colors.primary}
                                        multiline
                                    />
                                </View>

                                <View style={styles.buttonRow}>
                                    <Button mode="outlined" style={styles.cancelButton} onPress={() => { }}>
                                        Cancel
                                    </Button>
                                    <Button
                                        mode="contained"
                                        style={styles.saveButton}
                                        buttonColor={theme.colors.primary}
                                        onPress={handleSave}
                                        loading={isLoading}
                                    >
                                        Save Changes
                                    </Button>
                                </View>
                            </Card.Content>
                        </Card>

                        <Card style={[styles.card, { marginTop: 24 }]}>
                            <Card.Content>
                                <Text style={styles.sectionTitle}>Security</Text>
                                <Button
                                    mode="outlined"
                                    icon="lock-reset"
                                    style={{ alignSelf: 'flex-start', borderColor: '#e2e8f0' }}
                                    textColor="#1e293b"
                                >
                                    Change Password
                                </Button>
                            </Card.Content>
                        </Card>
                    </View>
                </View>
            </ScrollView>
        </WebLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 32,
    },
    grid: {
        flexDirection: 'row',
        gap: 32,
        flexWrap: 'wrap',
    },
    leftColumn: {
        flex: 1,
        minWidth: 300,
        maxWidth: 400,
    },
    rightColumn: {
        flex: 2,
        minWidth: 400,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        elevation: 2,
    },
    centerContent: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    imageWrapper: {
        position: 'relative',
        marginBottom: 16,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#e2e8f0',
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: theme.colors.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#ffffff',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    role: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 24,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    infoText: {
        fontSize: 16,
        color: '#475569',
    },
    formRow: {
        flexDirection: 'row',
        gap: 24,
    },
    inputWrapper: {
        flex: 1,
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748b',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#ffffff',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 16,
        marginTop: 8,
    },
    cancelButton: {
        borderColor: '#e2e8f0',
    },
    saveButton: {
        minWidth: 120,
    },
});
