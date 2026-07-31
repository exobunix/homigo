import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Button, TextInput, Text } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateUserProfile } from '@/store/slices/authSlice';
import { authAPI } from '@/services/api';

export default function WorkingHoursScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const existing = user?.workingHours as any;

  const [startTime, setStartTime] = useState(existing?.monday?.startTime || '09:00');
  const [endTime, setEndTime] = useState(existing?.monday?.endTime || '18:00');

  const handleSave = async () => {
    if (!user) {
      navigation.navigate('OnboardingComplete');
      return;
    }

    // Simple working hours: same schedule for all days
    const daySchedule = {
      isWorking: true,
      startTime,
      endTime,
    };

    const workingHours = {
      monday: daySchedule,
      tuesday: daySchedule,
      wednesday: daySchedule,
      thursday: daySchedule,
      friday: daySchedule,
      saturday: daySchedule,
      sunday: { ...daySchedule, isWorking: false },
    };

    try {
      await authAPI.updateWorkingHours(workingHours as any);
    } catch (e) {
      console.warn('Failed to update working hours on backend', e);
    }

    dispatch(
      updateUserProfile({
        workingHours: workingHours as any,
      })
    );

    navigation.navigate('OnboardingComplete');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Working hours</Title>
          <Text style={styles.subtitle}>Set your daily start and end time</Text>

          <TextInput
            label="Start time (HH:MM)"
            value={startTime}
            onChangeText={setStartTime}
            style={styles.input}
          />

          <TextInput
            label="End time (HH:MM)"
            value={endTime}
            onChangeText={setEndTime}
            style={styles.input}
          />

          <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
            Complete setup
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
    elevation: 4,
    borderRadius: 16,
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
