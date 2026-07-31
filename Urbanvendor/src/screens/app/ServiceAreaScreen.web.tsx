import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Card, Text, TextInput, Button, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import WebLayout from '@/components/WebLayout';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateUserProfile } from '@/store/slices/authSlice';
import { authAPI } from '@/services/api';
import { theme } from '@/theme/theme';

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
            // navigation.goBack(); // Don't go back on web, maybe show success message
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <WebLayout
            title="Service Area"
            subtitle="Define how far you are willing to travel for jobs."
        >
            <View style={styles.container}>
                <View style={styles.grid}>
                    {/* Settings Card */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.sectionTitle}>Working Radius</Text>
                            <Text style={styles.description}>
                                Set the maximum distance (in km) from your base location that you want to receive booking requests from.
                            </Text>

                            <View style={styles.inputRow}>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        mode="outlined"
                                        label="Radius (km)"
                                        value={radius}
                                        onChangeText={setRadius}
                                        keyboardType="number-pad"
                                        style={styles.input}
                                        outlineColor="#e2e8f0"
                                        activeOutlineColor={theme.colors.primary}
                                        right={<TextInput.Affix text="km" />}
                                    />
                                    <HelperText type="info">
                                        Current coverage: ~{Math.round(Math.PI * Math.pow(Number(radius) || 0, 2))} sq km
                                    </HelperText>
                                </View>
                                <Button
                                    mode="contained"
                                    onPress={onSave}
                                    loading={saving}
                                    disabled={saving}
                                    style={styles.saveButton}
                                    buttonColor={theme.colors.primary}
                                >
                                    Update Radius
                                </Button>
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Map Visualization Placeholder */}
                    <Card style={[styles.card, styles.mapCard]}>
                        <View style={styles.mapPlaceholder}>
                            <MaterialCommunityIcons name="map-marker-radius" size={64} color="#cbd5e1" />
                            <Text style={styles.mapText}>Map Visualization</Text>
                            <Text style={styles.mapSubtext}>
                                Your service area covers a {radius}km radius around your registered address.
                            </Text>

                            {/* Simulated Map Background */}
                            <View style={styles.pulseRing} />
                        </View>
                    </Card>
                </View>
            </View>
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
    card: {
        flex: 1,
        minWidth: 350,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        elevation: 2,
    },
    mapCard: {
        flex: 2,
        minHeight: 400,
        overflow: 'hidden',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 24,
        lineHeight: 20,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
    },
    inputWrapper: {
        flex: 1,
    },
    input: {
        backgroundColor: '#ffffff',
    },
    saveButton: {
        marginTop: 6,
        height: 50,
        justifyContent: 'center',
    },
    mapPlaceholder: {
        flex: 1,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    mapText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#94a3b8',
        marginTop: 16,
    },
    mapSubtext: {
        fontSize: 14,
        color: '#cbd5e1',
        marginTop: 8,
        textAlign: 'center',
    },
    pulseRing: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: '#e0e7ff',
        opacity: 0.5,
        zIndex: -1,
    },
});
