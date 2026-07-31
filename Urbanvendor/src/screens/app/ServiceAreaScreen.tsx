import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Text, TextInput, Button } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateUserProfile } from '@/store/slices/authSlice';
import { authAPI } from '@/services/api';

export default function ServiceAreaScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const [radius, setRadius] = useState(String((user as any)?.workingRadius ?? 10));
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    const value = Number(radius);
    if (Number.isNaN(value) || value <= 0) return;
    try {
      setSaving(true);
      await authAPI.updateServiceArea({ workingRadius: value });
      dispatch(updateUserProfile({ workingRadius: value } as any));
      navigation.goBack();
    } catch (e) {
      // optionally show a toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Service area</Title>
          <Text style={styles.subtitle}>Set your working radius in kilometers</Text>
          <TextInput
            label="Working radius (km)"
            value={radius}
            onChangeText={setRadius}
            keyboardType="number-pad"
            style={styles.input}
          />
          <Button mode="contained" onPress={onSave} loading={saving} disabled={saving}>
            Save
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  card: {
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
});
