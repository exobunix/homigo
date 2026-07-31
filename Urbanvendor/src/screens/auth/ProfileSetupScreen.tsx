import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Card, Title, TextInput, Button, Text, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateUserProfile } from '@/store/slices/authSlice';
import { authAPI, BASE_URL } from '@/services/api';

interface ProfileSetupProps {
  navigation: any;
  route: { params?: { phone?: string; mode?: 'edit' } };
}

export default function ProfileSetupScreen({ navigation, route }: ProfileSetupProps) {
  const phoneFromLogin = route?.params?.phone ?? '';
  const mode = route?.params?.mode;

  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth as any);
  const isEditMode = mode === 'edit';

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
  const [showAllGenders, setShowAllGenders] = useState(!gender);

  const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const uploadProfileImageIfNeeded = async () => {
    // No new photo selected
    if (!photoUri || photoUri.startsWith('http')) {
      console.log('uploadProfileImageIfNeeded: no new photo to upload', photoUri);
      return null;
    }

    if (!token) {
      console.warn('uploadProfileImageIfNeeded: no auth token, skipping image upload');
      return null;
    }

    try {
      console.log('uploadProfileImageIfNeeded: uploading photo', photoUri);
      const formData = new FormData();
      formData.append('image', {
        uri: photoUri,
        name: 'profile.jpg',
        type: 'image/jpeg',
      } as any);

      const response = await fetch(`${BASE_URL}/auth/profile-image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        console.warn(
          'uploadProfileImageIfNeeded: upload failed with status',
          response.status,
          text
        );
        return null;
      }

      const json = await response.json();
      const vendor = (json as any)?.data as any;
      console.log('uploadProfileImageIfNeeded: upload success, profileImage =', vendor?.profileImage);
      return vendor?.profileImage || null;
    } catch (e) {
      console.warn('Profile image upload failed, skipping image update', e);
      return null;
    }
  };

  const handleNext = async () => {
    console.log('handleNext called, isEditMode =', isEditMode, 'photoUri =', photoUri);
    if (isEditMode) {
      // EDIT MODE: allow partial updates and optional password
      const profileUpdates: any = {};

      if (fullName && fullName !== user?.name) {
        profileUpdates.name = fullName;
      }
      if (gender && (user as any)?.gender !== gender) {
        profileUpdates.gender = gender;
      }
      if (dob && (user as any)?.dob !== dob) {
        profileUpdates.dob = dob;
      }
      if (email && user?.email !== email) {
        // basic email validation only if user entered something
        if (!isValidEmail(email)) {
          setShowErrors(true);
          return;
        }
        profileUpdates.email = email;
      }

      // In edit mode, password changes are handled via the dedicated change password flow

      const uploadedProfileImage = await uploadProfileImageIfNeeded();
      if (uploadedProfileImage && (user as any)?.profileImage !== uploadedProfileImage) {
        profileUpdates.profileImage = uploadedProfileImage;
      }

      // If nothing changed, just go back
      if (Object.keys(profileUpdates).length === 0) {
        navigation.goBack();
        return;
      }

      try {
        await authAPI.updateProfile(profileUpdates);
      } catch (e) {
        console.warn('Failed to update profile on backend', e);
      }

      dispatch(updateUserProfile(profileUpdates));
      navigation.goBack();
    } else {
      // SIGNUP MODE: all fields required, including password
      const valid =
        !!fullName &&
        !!gender &&
        !!dob &&
        !!phone &&
        isValidEmail(email) &&
        password.length >= 6;

      if (!valid) {
        setShowErrors(true);
        return;
      }

      const profileUpdates: any = {
        name: fullName,
        email,
        gender,
        dob,
        phone,
        password,
      };

      const uploadedProfileImage = await uploadProfileImageIfNeeded();
      if (uploadedProfileImage) {
        profileUpdates.profileImage = uploadedProfileImage;
      }

      try {
        await authAPI.updateProfile(profileUpdates);
      } catch (e) {
        console.warn('Failed to update profile on backend', e);
      }

      dispatch(updateUserProfile(profileUpdates));
      navigation.navigate('ServiceSelection');
    }
  };

  const handlePhotoPress = async () => {
    // Open image picker to let vendor upload profile photo
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

  const isValid =
    !!fullName &&
    !!gender &&
    !!dob &&
    !!phone &&
    isValidEmail(email) &&
    password.length >= 6;

  const handleDobChange = (value: string) => {
    // Simple DD/MM/YYYY formatter while typing
    let digits = value.replace(/[^0-9]/g, '').slice(0, 8);
    if (digits.length >= 5) {
      digits = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    } else if (digits.length >= 3) {
      digits = `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
    setDob(digits);
  };

  return (
    <LinearGradient colors={['#ffffff', '#f4f4ff']} style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header Video / Photo Upload */}
        <View style={styles.headerSection}>
          <TouchableOpacity
            style={styles.videoContainer}
            onPress={handlePhotoPress}
            activeOpacity={0.85}
          >
            {hasPhoto && photoUri ? (
              <View style={styles.photoPreview}>
                <Image source={{ uri: photoUri }} style={styles.photoImage} />
              </View>
            ) : (
              <>
                <Video
                  source={{ uri: 'https://res.cloudinary.com/dosplgqif/video/upload/v1763209280/sign3_e18s30.mp4' }}
                  style={styles.headerVideo}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay
                  isLooping
                  isMuted
                />
                <View style={styles.videoOverlay}>
                  <View style={styles.videoOverlayIcon}>
                    <MaterialCommunityIcons name="plus" size={24} color="#ffffff" />
                  </View>
                </View>
              </>
            )}
          </TouchableOpacity>
          <Title style={styles.headerTitle}>
            {isEditMode ? 'Edit Your Profile' : 'Setup Your Profile'}
          </Title>
        </View>

        {/* Form Card */}
        <Card style={styles.card}>
          <Card.Content>
            {/* Full Name */}
            <TextInput
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              style={styles.input}
              theme={{ colors: { primary: '#8B80F8' } }}
            />
            {showErrors && !fullName && (
              <Text style={styles.errorText}>Full name is required</Text>
            )}

            {/* Gender */}
            <Text style={styles.genderLabel}>Gender</Text>
            <View style={styles.genderChipsRow}>
              {['Male', 'Female', 'Other'].map(option => {
                if (!showAllGenders && gender && gender !== option) {
                  return null;
                }

                const selected = gender === option;
                const iconName = option === 'Male'
                  ? 'gender-male'
                  : option === 'Female'
                    ? 'gender-female'
                    : 'gender-transgender';

                return (
                  <Chip
                    key={option}
                    selected={selected}
                    onPress={() => {
                      if (!showAllGenders) {
                        setShowAllGenders(true);
                        return;
                      }
                      setGender(option);
                      setShowAllGenders(false);
                    }}
                    style={[styles.genderChip, selected && styles.genderChipSelected]}
                    textStyle={selected ? styles.genderChipTextSelected : styles.genderChipText}
                    icon={iconName as any}
                  >
                    {option}
                  </Chip>
                );
              })}
            </View>
            {showErrors && !gender && (
              <Text style={styles.errorText}>Please select a gender</Text>
            )}

            {/* Date of Birth */}
            <TextInput
              label="Date of Birth"
              value={dob}
              onChangeText={handleDobChange}
              placeholder="DD/MM/YYYY"
              style={styles.input}
              theme={{ colors: { primary: '#8B80F8' } }}
              keyboardType="number-pad"
            />
            {showErrors && (!dob || dob.length !== 10) && (
              <Text style={styles.errorText}>Enter a valid date (DD/MM/YYYY)</Text>
            )}

            {/* Phone (from login; always fixed for security) */}
            <TextInput
              label="Phone Number"
              value={phone}
              editable={false}
              onChangeText={setPhone}
              style={styles.input}
              theme={{ colors: { primary: '#8B80F8' } }}
            />
            {showErrors && !phone && (
              <Text style={styles.errorText}>Phone number is required</Text>
            )}

            {/* Email */}
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              style={styles.input}
              theme={{ colors: { primary: '#8B80F8' } }}
              error={showErrors && !isValidEmail(email)}
            />
            {showErrors && !email && (
              <Text style={styles.errorText}>Email is required</Text>
            )}
            {showErrors && !!email && !isValidEmail(email) && (
              <Text style={styles.errorText}>Enter a valid email address</Text>
            )}

            {/* Password */}
            {!isEditMode && (
              <>
                <View style={styles.passwordContainer}>
                  <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    style={[styles.input, styles.passwordInput]}
                    theme={{ colors: { primary: '#8B80F8' } }}
                  />
                  <TouchableOpacity
                    style={styles.passwordEyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color="#64748b"
                    />
                  </TouchableOpacity>
                </View>
                {showErrors && password.length < 6 && (
                  <Text style={styles.errorText}>Password must be at least 6 characters</Text>
                )}
              </>
            )}

            <Button
              mode="contained"
              onPress={handleNext}
              style={styles.button}
              labelStyle={styles.buttonLabel}
              disabled={!isEditMode && !isValid}
            >
              {isEditMode ? 'Update' : 'Continue'}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 4,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  videoContainer: {
    width: '100%',
    maxWidth: 220,
    height: 170,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 6,
  },
  headerVideo: {
    width: '100%',
    height: '100%',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  card: {
    elevation: 4,
    borderRadius: 16,
    backgroundColor: '#ffffffff', // soft violet tint
    borderWidth: 1,
    borderColor: '#e0ddff',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  passwordContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 48,
  },
  passwordEyeButton: {
    position: 'absolute',
    right: 16,
    top: 18,
    padding: 4,
  },
  genderLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  genderChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  genderChip: {
    backgroundColor: '#eef2ff',
  },
  genderChipSelected: {
    backgroundColor: '#8B80F8',
  },
  genderChipText: {
    color: '#4b5563',
  },
  genderChipTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: -3,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  videoOverlayIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#8B80F8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#8B80F8',
    resizeMode: 'cover',
  },
  errorText: {
    marginTop: -8,
    marginBottom: 8,
    fontSize: 12,
    color: '#dc2626',
  },
  button: {
    paddingVertical: 8,
    marginTop: 8,
     backgroundColor: '#8B80F8',
  },
  buttonLabel: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
