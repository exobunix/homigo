import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, List, Button, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import WebLayout from '@/components/WebLayout';
import { theme } from '@/theme/theme';

export default function HelpSupportScreen() {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const faqs = [
        { id: '1', question: 'How do I accept a booking?', answer: 'To accept a booking, go to the "Bookings" tab, find the pending request, and click "Accept".' },
        { id: '2', question: 'When will I receive my payment?', answer: 'Payments are processed weekly every Friday for the completed jobs of the previous week.' },
        { id: '3', question: 'How can I change my service area?', answer: 'Go to "Profile" > "Service Area" to update your working radius.' },
    ];

    const handlePress = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <WebLayout title="Help & Support" subtitle="We are here to help you.">
            <ScrollView style={styles.container}>
                <View style={styles.grid}>
                    {/* Left Column: FAQ */}
                    <View style={styles.leftColumn}>
                        <Card style={styles.card}>
                            <Card.Content>
                                <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                                <List.Section>
                                    {faqs.map((faq) => (
                                        <List.Accordion
                                            key={faq.id}
                                            title={faq.question}
                                            expanded={expandedId === faq.id}
                                            onPress={() => handlePress(faq.id)}
                                            left={props => <List.Icon {...props} icon="help-circle-outline" />}
                                            style={styles.accordion}
                                        >
                                            <List.Item
                                                title={faq.answer}
                                                titleNumberOfLines={5}
                                                titleStyle={styles.answerText}
                                            />
                                        </List.Accordion>
                                    ))}
                                </List.Section>
                            </Card.Content>
                        </Card>

                        <Card style={[styles.card, { marginTop: 24 }]}>
                            <Card.Content>
                                <View style={styles.contactRow}>
                                    <View style={styles.contactItem}>
                                        <MaterialCommunityIcons name="phone" size={24} color={theme.colors.primary} />
                                        <Text style={styles.contactLabel}>Call Us</Text>
                                        <Text style={styles.contactValue}>+91 1800-123-4567</Text>
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.contactItem}>
                                        <MaterialCommunityIcons name="email" size={24} color={theme.colors.primary} />
                                        <Text style={styles.contactLabel}>Email Us</Text>
                                        <Text style={styles.contactValue}>support@urbanvendor.com</Text>
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>
                    </View>

                    {/* Right Column: Contact Form */}
                    <View style={styles.rightColumn}>
                        <Card style={styles.card}>
                            <Card.Content>
                                <Text style={styles.sectionTitle}>Send us a message</Text>
                                <Text style={styles.formDesc}>Describe your issue and we will get back to you.</Text>

                                <TextInput
                                    mode="outlined"
                                    label="Subject"
                                    style={styles.input}
                                    outlineColor="#e2e8f0"
                                    activeOutlineColor={theme.colors.primary}
                                />

                                <TextInput
                                    mode="outlined"
                                    label="Message"
                                    multiline
                                    numberOfLines={6}
                                    style={[styles.input, { height: 120 }]}
                                    outlineColor="#e2e8f0"
                                    activeOutlineColor={theme.colors.primary}
                                />

                                <Button
                                    mode="contained"
                                    style={styles.submitButton}
                                    buttonColor={theme.colors.primary}
                                    onPress={() => { }}
                                >
                                    Submit Ticket
                                </Button>
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
        flex: 3,
        minWidth: 400,
    },
    rightColumn: {
        flex: 2,
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
        marginBottom: 16,
    },
    accordion: {
        backgroundColor: '#ffffff',
        paddingVertical: 4,
    },
    answerText: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
    },
    contactRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 16,
    },
    contactItem: {
        alignItems: 'center',
    },
    contactLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginTop: 8,
    },
    contactValue: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: '#e2e8f0',
    },
    formDesc: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 24,
    },
    input: {
        backgroundColor: '#ffffff',
        marginBottom: 16,
    },
    submitButton: {
        marginTop: 8,
        paddingVertical: 6,
    },
});
