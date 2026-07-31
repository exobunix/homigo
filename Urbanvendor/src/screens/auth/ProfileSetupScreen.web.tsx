import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, useWindowDimensions, Text as RNText, Pressable } from 'react-native';
import { Text, TextInput, Button, Chip, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, FadeInRight } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateUserProfile } from '@/store/slices/authSlice';
import { authAPI, BASE_URL } from '@/services/api';
import { theme } from '@/theme/theme';

interface ProfileSetupProps {
    navigation: any;
    route: { params?: { phone?: string; mode?: 'edit' } };
}

export default function ProfileSetupScreen({ navigation, route }: ProfileSetupProps) {
    const { width } = useWindowDimensions();
    const isLargeScreen = width >= 1024;

    const phoneFromLogin = route?.params?.phone ?? '';
    const mode = route?.params?.mode;
    const isEditMode = mode === 'edit';

    const dispatch = useAppDispatch();
    const { user, token } = useAppSelector((state) => state.auth as any);

    const [fullName, setFullName] = useState(isEditMode && user?.name ? user.name : '');
    const [gender, setGender] = useState(isEditMode && (user as any)?.gender ? (user as any).gender : '');
    const [dob, setDob] = useState(isEditMode && (user as any)?.dob ? (user as any).dob : '');
    const [phone, setPhone] = useState(isEditMode && user?.phone ? user.phone : phoneFromLogin);
    const [email, setEmail] = useState(isEditMode && user?.email ? user.email : '');
    const [hasPhoto, setHasPhoto] = useState<boolean>(!!(isEditMode && (user as any)?.profileImage));
    const [photoUri, setPhotoUri] = useState<string | null>(
        isEditMode && (user as any)?.profileImage ? (user as any).profileImage : null
    );
    const [password, setPassword] = useState('');
    const [showErrors, setShowErrors] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

    const uploadProfileImageIfNeeded = async () => {
        if (!photoUri || photoUri.startsWith('http')) return null;
        if (!token) return null;

        try {
            const formData = new FormData();

            if (Platform.OS === 'web') {
                // On web, fetch the blob from the URI and create a File object
                const response = await fetch(photoUri);
                const blob = await response.blob();
                const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
                formData.append('image', file);
            } else {
                // On native, use the URI-based approach
                // @ts-ignore
                formData.append('image', {
                    uri: photoUri,
                    name: 'profile.jpg',
                    type: 'image/jpeg',
                });
            }

            const uploadResponse = await fetch(`${BASE_URL}/auth/profile-image`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!uploadResponse.ok) {
                console.warn('Upload response not OK:', uploadResponse.status);
                return null;
            }
            const json = await uploadResponse.json();
            return (json as any)?.data?.profileImage || null;
        } catch (e) {
            console.warn('Profile image upload failed', e);
            return null;
        }
    };

    const handleNext = async () => {
        if (isSubmitting) return;

        if (isEditMode) {
            // Edit logic same as mobile...
            const profileUpdates: any = {};
            if (fullName && fullName !== user?.name) profileUpdates.name = fullName;
            if (gender && (user as any)?.gender !== gender) profileUpdates.gender = gender;
            if (dob && (user as any)?.dob !== dob) profileUpdates.dob = dob;
            if (email && user?.email !== email) {
                if (!isValidEmail(email)) { setShowErrors(true); return; }
                profileUpdates.email = email;
            }

            setIsSubmitting(true);

            // Always try to upload photo if it's a new local file
            const uploadedProfileImage = await uploadProfileImageIfNeeded();
            console.log('Uploaded profile image:', uploadedProfileImage);

            if (uploadedProfileImage && (user as any)?.profileImage !== uploadedProfileImage) {
                profileUpdates.profileImage = uploadedProfileImage;
            }

            console.log('Profile updates to send:', profileUpdates);

            if (Object.keys(profileUpdates).length > 0) {
                try {
                    const result = await authAPI.updateProfile(profileUpdates);
                    console.log('Profile update result:', result);
                    dispatch(updateUserProfile(profileUpdates));
                } catch (e) {
                    console.error('Failed to update profile', e);
                }
            } else {
                console.log('No profile changes detected');
            }
            setIsSubmitting(false);
            navigation.goBack();
        } else {
            // Signup logic
            const valid = !!fullName && !!gender && !!dob && !!phone && isValidEmail(email) && password.length >= 6;
            if (!valid) { setShowErrors(true); return; }

            setIsSubmitting(true);
            const profileUpdates: any = { name: fullName, email, gender, dob, phone, password };

            const uploadedProfileImage = await uploadProfileImageIfNeeded();
            if (uploadedProfileImage) profileUpdates.profileImage = uploadedProfileImage;

            try {
                await authAPI.updateProfile(profileUpdates);
                dispatch(updateUserProfile(profileUpdates));
                navigation.navigate('ServiceSelection');
            } catch (e) {
                console.warn('Failed to update profile', e);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handlePhotoPress = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setPhotoUri(result.assets[0].uri);
            setHasPhoto(true);
        }
    };

    const handleDobChange = (value: string) => {
        let digits = value.replace(/[^0-9]/g, '').slice(0, 8);
        if (digits.length >= 5) {
            digits = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
        } else if (digits.length >= 3) {
            digits = `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
        }
        setDob(digits);
    };

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                {/* Left Side - Hero (Large Screen) */}
                {isLargeScreen && (
                    <Animated.View
                        entering={FadeInRight.duration(1000).springify()}
                        style={styles.heroContainer}
                    >
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop' }} // Professional profile/workspace
                            style={styles.heroImage}
                            resizeMode="cover"
                        />
                        <LinearGradient
                            colors={['rgba(99, 102, 241, 0.8)', 'rgba(79, 70, 229, 0.9)']}
                            style={styles.heroOverlay}
                        >
                            <View style={styles.heroContent}>
                                <Animated.Text entering={FadeInUp.delay(200).duration(800)} style={styles.heroTitle}>
                                    {isEditMode ? 'Update Your Profile' : 'Complete Your Profile'}
                                </Animated.Text>
                                <Animated.Text entering={FadeInUp.delay(400).duration(800)} style={styles.heroSubtitle}>
                                    Tell us more about yourself and your business to get started.
                                </Animated.Text>
                            </View>
                        </LinearGradient>
                    </Animated.View>
                )}

                {/* Right Side - Form */}
                <View style={[styles.formContainer, !isLargeScreen && styles.formContainerFull]}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <Animated.View
                            entering={FadeInDown.duration(800).springify()}
                            style={styles.formContent}
                        >
                            <View style={styles.header}>
                                <Text style={styles.welcomeText}>{isEditMode ? 'Edit Profile' : 'Setup Profile'}</Text>
                                <Text style={styles.instructionText}>Please fill in the details below.</Text>
                            </View>

                            {/* Photo Upload */}
                            <View style={styles.photoSection}>
                                <TouchableOpacity onPress={handlePhotoPress} style={styles.photoContainer}>
                                    {photoUri ? (
                                        <Image source={{ uri: photoUri }} style={styles.photoImage} />
                                    ) : (
                                        <View style={styles.photoPlaceholder}>
                                            <MaterialCommunityIcons name="camera-plus" size={32} color="#94a3b8" />
                                            <Text style={styles.photoText}>Upload Photo</Text>
                                        </View>
                                    )}
                                    <View style={styles.editIconContainer}>
                                        <MaterialCommunityIcons name="pencil" size={16} color="#ffffff" />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputGroup}>
                                <TextInput
                                    label="Full Name"
                                    value={fullName}
                                    onChangeText={setFullName}
                                    mode="outlined"
                                    style={styles.input}
                                    outlineColor="#e2e8f0"
                                    activeOutlineColor={theme.colors.primary}
                                    error={showErrors && !fullName}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Gender</Text>
                                <View style={styles.genderRow}>
                                    {['Male', 'Female', 'Other'].map((option) => (
                                        <Pressable
                                            key={option}
                                            onPress={() => setGender(option)}
                                            style={[
                                                styles.genderChip,
                                                gender === option && styles.genderChipSelected
                                            ]}
                                        >
                                            <MaterialCommunityIcons
                                                name={option === 'Male' ? 'gender-male' : option === 'Female' ? 'gender-female' : 'gender-transgender'}
                                                size={20}
                                                color={gender === option ? '#ffffff' : '#64748b'}
                                            />
                                            <Text style={[styles.genderText, gender === option && styles.genderTextSelected]}>{option}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                                {showErrors && !gender && <Text style={styles.errorText}>Please select a gender</Text>}
                            </View>

                            <View style={styles.rowInputs}>
                                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                    <TextInput
                                        label="Date of Birth"
                                        value={dob}
                                        onChangeText={handleDobChange}
                                        placeholder="DD/MM/YYYY"
                                        mode="outlined"
                                        style={styles.input}
                                        outlineColor="#e2e8f0"
                                        activeOutlineColor={theme.colors.primary}
                                        error={showErrors && (!dob || dob.length !== 10)}
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                    <TextInput
                                        label="Phone Number"
                                        value={phone}
                                        editable={false}
                                        mode="outlined"
                                        style={[styles.input, styles.disabledInput]}
                                        outlineColor="#e2e8f0"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <TextInput
                                    label="Email Address"
                                    value={email}
                                    onChangeText={setEmail}
                                    mode="outlined"
                                    style={styles.input}
                                    outlineColor="#e2e8f0"
                                    activeOutlineColor={theme.colors.primary}
                                    error={showErrors && (!email || !isValidEmail(email))}
                                    keyboardType="email-address"
                                />
                            </View>

                            {!isEditMode && (
                                <View style={styles.inputGroup}>
                                    <TextInput
                                        label="Password"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        mode="outlined"
                                        style={styles.input}
                                        outlineColor="#e2e8f0"
                                        activeOutlineColor={theme.colors.primary}
                                        error={showErrors && password.length < 6}
                                        right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
                                        autoComplete="new-password"
                                    />
                                    {showErrors && password.length < 6 && (
                                        <Text style={styles.helperText}>Password must be at least 6 characters</Text>
                                    )}
                                </View>
                            )}

                            <Pressable
                                onPress={handleNext}
                                disabled={isSubmitting}
                                onHoverIn={() => setIsHovered(true)}
                                onHoverOut={() => setIsHovered(false)}
                                style={({ pressed }) => [
                                    styles.submitButton,
                                    isSubmitting && styles.submitButtonDisabled,
                                    pressed && styles.submitButtonPressed
                                ]}
                            >
                                <LinearGradient
                                    colors={[theme.colors.primary, theme.colors.secondary]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.gradientButton}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={styles.submitButtonText}>{isEditMode ? 'Update Profile' : 'Continue'}</Text>
                                    )}
                                </LinearGradient>
                            </Pressable>
                        </Animated.View>
                    </ScrollView>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        overflow: 'hidden',
    },
    row: {
        flex: 1,
        flexDirection: 'row',
    },
    heroContainer: {
        flex: 1,
        position: 'relative',
        backgroundColor: '#1e1b4b',
    },
    heroImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        padding: 60,
        justifyContent: 'center',
    },
    heroContent: {
        maxWidth: 600,
    },
    heroTitle: {
        fontSize: 48,
        fontWeight: '800',
        color: '#ffffff',
        marginBottom: 24,
        lineHeight: 56,
        fontFamily: Platform.select({ web: 'Inter, sans-serif' }),
    },
    heroSubtitle: {
        fontSize: 20,
        color: '#e0e7ff',
        marginBottom: 48,
        lineHeight: 30,
        fontFamily: Platform.select({ web: 'Inter, sans-serif' }),
    },
    formContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    formContainerFull: {
        flex: 1,
        width: '100%',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 24,
    },
    formContent: {
        width: '100%',
        maxWidth: 500,
        paddingHorizontal: 20,
    },
    header: {
        marginBottom: 32,
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
        fontFamily: Platform.select({ web: 'Inter, sans-serif' }),
    },
    instructionText: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
    },
    photoSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    photoContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        position: 'relative',
    },
    photoImage: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
    },
    photoPlaceholder: {
        alignItems: 'center',
    },
    photoText: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 4,
        fontWeight: '500',
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: theme.colors.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    inputGroup: {
        marginBottom: 20,
    },
    rowInputs: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#ffffff',
    },
    disabledInput: {
        backgroundColor: '#f8fafc',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
        marginLeft: 4,
    },
    genderRow: {
        flexDirection: 'row',
        gap: 12,
    },
    genderChip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        // @ts-ignore
        transition: 'all 0.2s ease',
    },
    genderChipSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    genderText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    genderTextSelected: {
        color: '#ffffff',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    helperText: {
        color: '#64748b',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    submitButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 12,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 4,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonPressed: {
        transform: [{ scale: 0.98 }],
    },
    gradientButton: {
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        letterSpacing: 0.5,
    },
});
