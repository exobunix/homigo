import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Platform } from 'react-native';
import { Card, Text, TextInput, Button, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import WebLayout from '@/components/WebLayout';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateUserProfile } from '@/store/slices/authSlice';
import { BASE_URL } from '@/services/api';
import { theme } from '@/theme/theme';

export default function KYCUploadScreen({ navigation }: any) {
    const dispatch = useAppDispatch();
    const { user, token } = useAppSelector((state) => state.auth as any);

    const [aadharNumber, setAadharNumber] = useState(user?.kyc?.aadharNumber || '');
    const [panNumber, setPanNumber] = useState(user?.kyc?.panNumber || '');
    const [aadharFront, setAadharFront] = useState(user?.kyc?.aadharFront || '');
    const [aadharBack, setAadharBack] = useState(user?.kyc?.aadharBack || '');
    const [panImage, setPanImage] = useState(user?.kyc?.panImage || '');
    const [loading, setLoading] = useState(false);

    const pickImage = async (setter: (uri: string) => void) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setter(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('aadharNumber', aadharNumber);
            formData.append('panNumber', panNumber);

            // Helper to append file
            const appendFile = async (key: string, uri: string, name: string) => {
                if (uri && !uri.startsWith('http')) {
                    if (Platform.OS === 'web') {
                        const res = await fetch(uri);
                        const blob = await res.blob();
                        const file = new File([blob], name, { type: 'image/jpeg' });
                        formData.append(key, file);
                    } else {
                        formData.append(key, {
                            uri,
                            name,
                            type: 'image/jpeg',
                        } as any);
                    }
                }
            };

            await appendFile('aadharFront', aadharFront, 'aadhar-front.jpg');
            await appendFile('aadharBack', aadharBack, 'aadhar-back.jpg');
            await appendFile('panImage', panImage, 'pan.jpg');

            if (!token) return;

            const response = await fetch(`${BASE_URL}/auth/kyc`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const json = await response.json();
                dispatch(updateUserProfile({ kyc: json.data.kyc }));
                // Show success feedback
            } else {
                console.error('KYC Upload failed');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const UploadBox = ({ label, image, onPick }: any) => (
        <View style={styles.uploadBoxWrapper}>
            <Text style={styles.uploadLabel}>{label}</Text>
            <TouchableOpacity style={styles.uploadBox} onPress={onPick}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.previewImage} />
                ) : (
                    <View style={styles.placeholder}>
                        <MaterialCommunityIcons name="cloud-upload-outline" size={32} color="#94a3b8" />
                        <Text style={styles.placeholderText}>Click to upload</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <WebLayout
            title="KYC Documents"
            subtitle="Upload your identity documents for verification."
        >
            <ScrollView style={styles.container}>
                <View style={styles.grid}>
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.sectionTitle}>Identity Details</Text>
                            <View style={styles.formRow}>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        mode="outlined"
                                        label="Aadhaar Number"
                                        value={aadharNumber}
                                        onChangeText={setAadharNumber}
                                        style={styles.input}
                                        outlineColor="#e2e8f0"
                                        activeOutlineColor={theme.colors.primary}
                                    />
                                </View>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        mode="outlined"
                                        label="PAN Number"
                                        value={panNumber}
                                        onChangeText={setPanNumber}
                                        style={styles.input}
                                        outlineColor="#e2e8f0"
                                        activeOutlineColor={theme.colors.primary}
                                    />
                                </View>
                            </View>

                            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Document Images</Text>
                            <View style={styles.uploadGrid}>
                                <UploadBox
                                    label="Aadhaar Front"
                                    image={aadharFront}
                                    onPick={() => pickImage(setAadharFront)}
                                />
                                <UploadBox
                                    label="Aadhaar Back"
                                    image={aadharBack}
                                    onPick={() => pickImage(setAadharBack)}
                                />
                                <UploadBox
                                    label="PAN Card"
                                    image={panImage}
                                    onPick={() => pickImage(setPanImage)}
                                />
                            </View>

                            <View style={styles.actions}>
                                <Button
                                    mode="contained"
                                    onPress={handleSave}
                                    loading={loading}
                                    disabled={loading}
                                    buttonColor={theme.colors.primary}
                                    style={styles.saveButton}
                                >
                                    Submit Documents
                                </Button>
                            </View>
                        </Card.Content>
                    </Card>
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
        maxWidth: 800,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 16,
    },
    formRow: {
        flexDirection: 'row',
        gap: 24,
    },
    inputWrapper: {
        flex: 1,
    },
    input: {
        backgroundColor: '#ffffff',
    },
    uploadGrid: {
        flexDirection: 'row',
        gap: 24,
        flexWrap: 'wrap',
    },
    uploadBoxWrapper: {
        flex: 1,
        minWidth: 200,
    },
    uploadLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748b',
        marginBottom: 8,
    },
    uploadBox: {
        height: 160,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f8fafc',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        marginTop: 8,
        color: '#94a3b8',
        fontSize: 14,
    },
    actions: {
        marginTop: 32,
        alignItems: 'flex-end',
    },
    saveButton: {
        minWidth: 150,
    },
});
