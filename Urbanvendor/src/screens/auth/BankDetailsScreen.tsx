import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Button, TextInput, Text } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateUserProfile } from '@/store/slices/authSlice';
import { authAPI } from '@/services/api';

export default function BankDetailsScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [accountNumber, setAccountNumber] = useState(user?.bankDetails?.accountNumber || '');
  const [ifscCode, setIfscCode] = useState(user?.bankDetails?.ifscCode || '');
  const [accountHolderName, setAccountHolderName] = useState(user?.bankDetails?.accountHolderName || user?.name || '');
  const [bankName, setBankName] = useState(user?.bankDetails?.bankName || '');

  const handleSave = async () => {
    if (!user) {
      navigation.goBack();
      return;
    }

    const payload = {
      accountNumber,
      ifscCode,
      accountHolderName,
      bankName,
    };

    try {
      await authAPI.updateBankDetails(payload);
    } catch (e) {
      // For now, ignore network errors and still update local state
      console.warn('Failed to update bank details on backend', e);
    }

    dispatch(
      updateUserProfile({
        bankDetails: {
          ...payload,
          isVerified: !!accountNumber && !!ifscCode && !!accountHolderName && !!bankName,
        },
      })
    );

    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Bank details</Title>
          <Text style={styles.subtitle}>Add your payout account to receive earnings</Text>

          <TextInput
            label="Account holder name"
            value={accountHolderName}
            onChangeText={setAccountHolderName}
            style={styles.input}
          />

          <TextInput
            label="Account number"
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="number-pad"
            style={styles.input}
          />

          <TextInput
            label="IFSC code"
            value={ifscCode}
            onChangeText={setIfscCode}
            autoCapitalize="characters"
            style={styles.input}
          />

          <TextInput
            label="Bank name"
            value={bankName}
            onChangeText={setBankName}
            style={styles.input}
          />

          <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
            Save details
          </Button>
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
  saveButton: {
    marginTop: 8,
    borderRadius: 999,
  },
});
