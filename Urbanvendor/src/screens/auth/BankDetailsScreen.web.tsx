import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Card, Text, TextInput, Button, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import WebLayout from '@/components/WebLayout';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateUserProfile } from '@/store/slices/authSlice';
import { authAPI } from '@/services/api';
import { theme } from '@/theme/theme';

export default function BankDetailsScreen({ navigation }: any) {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth as any);

    const [accountHolderName, setAccountHolderName] = useState(user?.bankDetails?.accountHolderName || '');
    const [accountNumber, setAccountNumber] = useState(user?.bankDetails?.accountNumber || '');
    const [ifscCode, setIfscCode] = useState(user?.bankDetails?.ifscCode || '');
    const [bankName, setBankName] = useState(user?.bankDetails?.bankName || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            const bankData = {
                accountHolderName,
                accountNumber,
                ifscCode,
                bankName,
            };

            await authAPI.updateBankDetails(bankData);
            dispatch(updateUserProfile({ bankDetails: bankData } as any));
            // Show success feedback
        } catch (error) {
            console.error('Failed to update bank details', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <WebLayout
            title="Bank Details"
            subtitle="Manage your payout account information."
        >
            <ScrollView style={styles.container}>
                <View style={styles.grid}>
                    <View style={styles.leftColumn}>
                        <Card style={styles.card}>
                            <Card.Content>
                                <Text style={styles.sectionTitle}>Bank Account</Text>
                                <Text style={styles.description}>
                                    Enter the bank account details where you want to receive your earnings.
                                </Text>

                                <View style={styles.inputGroup}>
                                    <TextInput
                                        mode="outlined"
                                        label="Account Holder Name"
                                        value={accountHolderName}
                                        onChangeText={setAccountHolderName}
                                        style={styles.input}
                                        outlineColor="#e2e8f0"
                                        activeOutlineColor={theme.colors.primary}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <TextInput
                                        mode="outlined"
                                        label="Account Number"
                                        value={accountNumber}
                                        onChangeText={setAccountNumber}
                                        keyboardType="number-pad"
                                        secureTextEntry
                                        style={styles.input}
                                        outlineColor="#e2e8f0"
                                        activeOutlineColor={theme.colors.primary}
                                    />
                                </View>

                                <View style={styles.row}>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <TextInput
                                            mode="outlined"
                                            label="IFSC Code"
                                            value={ifscCode}
                                            onChangeText={(text) => setIfscCode(text.toUpperCase())}
                                            autoCapitalize="characters"
                                            style={styles.input}
                                            outlineColor="#e2e8f0"
                                            activeOutlineColor={theme.colors.primary}
                                        />
                                    </View>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <TextInput
                                            mode="outlined"
                                            label="Bank Name"
                                            value={bankName}
                                            onChangeText={setBankName}
                                            style={styles.input}
                                            outlineColor="#e2e8f0"
                                            activeOutlineColor={theme.colors.primary}
                                        />
                                    </View>
                                </View>

                                <Button
                                    mode="contained"
                                    onPress={handleSave}
                                    loading={loading}
                                    disabled={loading}
                                    buttonColor={theme.colors.primary}
                                    style={styles.saveButton}
                                >
                                    Save Bank Details
                                </Button>
                            </Card.Content>
                        </Card>
                    </View>

                    <View style={styles.rightColumn}>
                        <Card style={[styles.card, styles.infoCard]}>
                            <Card.Content>
                                <Text style={styles.infoTitle}>Payout Information</Text>
                                <View style={styles.infoItem}>
                                    <Text style={styles.infoLabel}>Payout Schedule</Text>
                                    <Text style={styles.infoValue}>Weekly (Every Friday)</Text>
                                </View>
                                <View style={styles.infoItem}>
                                    <Text style={styles.infoLabel}>Minimum Payout</Text>
                                    <Text style={styles.infoValue}>₹500</Text>
                                </View>
                                <View style={styles.infoItem}>
                                    <Text style={styles.infoLabel}>Processing Time</Text>
                                    <Text style={styles.infoValue}>24-48 Hours</Text>
                                </View>

                                <View style={styles.secureBadge}>
                                    <MaterialCommunityIcons name="shield-check" size={20} color="#10b981" />
                                    <Text style={styles.secureText}>Your bank details are encrypted and secure.</Text>
                                </View>
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
        flex: 2,
        minWidth: 400,
    },
    rightColumn: {
        flex: 1,
        minWidth: 300,
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
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        gap: 20,
    },
    input: {
        backgroundColor: '#ffffff',
    },
    saveButton: {
        marginTop: 12,
        paddingVertical: 6,
    },
    infoCard: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        elevation: 0,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 20,
    },
    infoItem: {
        marginBottom: 16,
    },
    infoLabel: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    secureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 24,
        padding: 12,
        backgroundColor: '#ecfdf5',
        borderRadius: 8,
    },
    secureText: {
        fontSize: 12,
        color: '#059669',
        flex: 1,
    },
});
