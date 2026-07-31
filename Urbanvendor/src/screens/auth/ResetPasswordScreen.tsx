import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, Text, TextInput, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { authAPI } from '@/services/api';

interface ResetPasswordScreenProps {
  navigation: any;
  route: { params: { phone: string } };
}

export default function ResetPasswordScreen({ navigation, route }: ResetPasswordScreenProps) {
  const { phone } = route.params;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async () => {
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password must match');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      // Backend endpoint should accept phone + newPassword for reset
      await authAPI.updateProfile({ password: newPassword } as any);
      navigation.navigate('Login');
    } catch (e: any) {
      const message = e?.response?.data?.message || 'Failed to reset password';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = newPassword.length >= 6 && newPassword === confirmPassword;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#ffffff', '#f8fafc']} style={styles.background} />

      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        <View style={styles.mainSection}>
          <Title style={styles.title}>Set new password</Title>
          <Text style={styles.subtitle}>For mobile number {phone}</Text>
        </View>

        <Card style={styles.card} elevation={2}>
          <Card.Content style={styles.cardContent}>
            <TextInput
              label="New password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNew}
              style={styles.input}
              right={
                <TextInput.Icon
                  icon={showNew ? 'eye-off' : 'eye'}
                  onPress={() => setShowNew((prev) => !prev)}
                />
              }
            />
            <TextInput
              label="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
              style={styles.input}
              right={
                <TextInput.Icon
                  icon={showConfirm ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirm((prev) => !prev)}
                />
              }
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={!isValid || isSubmitting}
              style={styles.submitButton}
            >
              Reset password
            </Button>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  mainSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  card: {
    borderRadius: 20,
    backgroundColor: '#ffffff',
  },
  cardContent: {
    padding: 24,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  submitButton: {
    marginTop: 8,
  },
  errorText: {
    marginTop: 4,
    marginBottom: 4,
    fontSize: 12,
    color: '#ef4444',
  },
});
