import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Image } from 'react-native';
import { Card, Title, Button, TextInput, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateUserProfile } from '@/store/slices/authSlice';
import { BASE_URL } from '@/services/api';

export default function KYCUploadScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth as any);

  const [aadharNumber, setAadharNumber] = useState(user?.kyc?.aadharNumber || '');
  const [panNumber, setPanNumber] = useState(user?.kyc?.panNumber || '');
  const [aadharFront, setAadharFront] = useState(user?.kyc?.aadharFront || '');
  const [aadharBack, setAadharBack] = useState(user?.kyc?.aadharBack || '');
  const [panImage, setPanImage] = useState(user?.kyc?.panImage || '');
  const [certificates, setCertificates] = useState<string[]>(user?.kyc?.certificates || []);

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

  const pickCertificate = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setCertificates((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const handleSave = async () => {
    if (!user) {
      navigation.goBack();
      return;
    }

    try {
      const formData = new FormData();

      formData.append('aadharNumber', aadharNumber);
      formData.append('panNumber', panNumber);

      if (aadharFront && !aadharFront.startsWith('http')) {
        formData.append('aadharFront', {
          uri: aadharFront,
          name: 'aadhar-front.jpg',
          type: 'image/jpeg',
        } as any);
      }

      if (aadharBack && !aadharBack.startsWith('http')) {
        formData.append('aadharBack', {
          uri: aadharBack,
          name: 'aadhar-back.jpg',
          type: 'image/jpeg',
        } as any);
      }

      if (panImage && !panImage.startsWith('http')) {
        formData.append('panImage', {
          uri: panImage,
          name: 'pan.jpg',
          type: 'image/jpeg',
        } as any);
      }

      certificates.forEach((uri, index) => {
        if (!uri.startsWith('http')) {
          formData.append('certificates', {
            uri,
            name: `certificate-${index + 1}.jpg`,
            type: 'image/jpeg',
          } as any);
        }
      });

      if (!token) {
        console.warn('KYC upload: no auth token, skipping upload');
        return;
      }

      const response = await fetch(`${BASE_URL}/auth/kyc`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        console.warn('Failed to update KYC on backend: status', response.status, text);
        return;
      }

      const json = await response.json();
      const updatedVendor = (json as any)?.data as any;

      dispatch(
        updateUserProfile({
          kyc: updatedVendor.kyc,
        })
      );
      navigation.goBack();
    } catch (e) {
      console.warn('Failed to update KYC on backend', e);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>KYC & documents</Title>
          <Text style={styles.subtitle}>Enter your Aadhaar and PAN details</Text>

          <TextInput
            label="Aadhaar number"
            value={aadharNumber}
            onChangeText={setAadharNumber}
            keyboardType="number-pad"
            style={styles.input}
          />

          <TextInput
            label="PAN number"
            value={panNumber}
            onChangeText={setPanNumber}
            autoCapitalize="characters"
            style={styles.input}
          />

          <Text style={styles.sectionLabel}>Aadhaar images</Text>
          <View style={styles.imageRow}>
            <TouchableOpacity
              style={styles.imageButton}
              onPress={() => pickImage(setAadharFront)}
              activeOpacity={0.8}
            >
              {aadharFront ? (
                <Image source={{ uri: aadharFront }} style={styles.imagePreview} />
              ) : (
                <Text style={styles.imagePlaceholder}>Upload front side</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.imageButton}
              onPress={() => pickImage(setAadharBack)}
              activeOpacity={0.8}
            >
              {aadharBack ? (
                <Image source={{ uri: aadharBack }} style={styles.imagePreview} />
              ) : (
                <Text style={styles.imagePlaceholder}>Upload back side</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>PAN image</Text>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => pickImage(setPanImage)}
            activeOpacity={0.8}
          >
            {panImage ? (
              <Image source={{ uri: panImage }} style={styles.imagePreview} />
            ) : (
              <Text style={styles.imagePlaceholder}>Upload PAN image</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.sectionLabel}>Certificates (optional)</Text>
          <View style={styles.certificatesRow}>
            {certificates.map((uri, index) => (
              <View key={index} style={styles.certificateItem}>
                <Image source={{ uri }} style={styles.certificateImage} />
              </View>
            ))}

            <TouchableOpacity
              style={styles.certificateAddButton}
              onPress={pickCertificate}
              activeOpacity={0.8}
            >
              <Text style={styles.imagePlaceholder}>Add certificate</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionsRow}>
            <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
              Save KYC
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 16,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  sectionLabel: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  imageButton: {
    flex: 1,
    height: 110,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  certificatesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  certificateItem: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  certificateImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  certificateAddButton: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  actionsRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  saveButton: {
    borderRadius: 999,
  },
});
