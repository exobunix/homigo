import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import { Ionicons } from '@expo/vector-icons';

const FAQS = [
    { id: '1', question: 'How do I book a service?', answer: 'You can book a service by selecting a category from the home screen, choosing a service, and picking a convenient time slot.' },
    { id: '2', question: 'Can I reschedule my booking?', answer: 'Yes, you can reschedule your booking from the "Bookings" tab up to 2 hours before the scheduled time.' },
    { id: '3', question: 'Is there a cancellation fee?', answer: 'Cancellations made within 2 hours of the scheduled time may incur a small fee.' },
    { id: '4', question: 'How do I pay?', answer: 'We accept credit/debit cards, UPI, and cash on delivery.' },
    { id: '5', question: 'Are the professionals verified?', answer: 'Yes, all our professionals undergo a strict background check and training process.' },
];

export const HelpCenterScreen = ({ navigation }: any) => {
    const { colors } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Help Center</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Contact Support Card */}
                <View style={[styles.supportCard, { backgroundColor: colors.primary }]}>
                    <View style={styles.supportIconContainer}>
                        <Ionicons name="headset" size={32} color={colors.white} />
                    </View>
                    <View style={styles.supportInfo}>
                        <Text style={[styles.supportTitle, { color: colors.white }]}>Need help with a booking?</Text>
                        <Text style={[styles.supportSubtitle, { color: 'rgba(255,255,255,0.9)' }]}>Our support team is available 24/7</Text>
                    </View>
                    <TouchableOpacity style={[styles.chatButton, { backgroundColor: colors.white }]}>
                        <Text style={[styles.chatButtonText, { color: colors.primary }]}>Chat</Text>
                    </TouchableOpacity>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Asked Questions</Text>

                {FAQS.map((item) => (
                    <View key={item.id} style={[styles.faqItem, { backgroundColor: colors.surface }]}>
                        <View style={styles.faqHeader}>
                            <Text style={[styles.question, { color: colors.text }]}>{item.question}</Text>
                            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                        </View>
                        <Text style={[styles.answer, { color: colors.textSecondary }]}>{item.answer}</Text>
                    </View>
                ))}

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>Still have questions?</Text>
                    <TouchableOpacity>
                        <Text style={[styles.emailLink, { color: colors.primary }]}>Email us at support@homigo.com</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.m,
        borderBottomWidth: 1,
    },
    backButton: {
        marginRight: spacing.m,
    },
    headerTitle: {
        ...typography.h2,
    },
    content: {
        padding: spacing.m,
    },
    supportCard: {
        borderRadius: borderRadius.l,
        padding: spacing.m,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.l,
        ...shadows.medium,
    },
    supportIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.m,
    },
    supportInfo: {
        flex: 1,
    },
    supportTitle: {
        ...typography.bodyBold,
        marginBottom: 2,
    },
    supportSubtitle: {
        ...typography.caption,
    },
    chatButton: {
        paddingVertical: spacing.s,
        paddingHorizontal: spacing.m,
        borderRadius: borderRadius.m,
    },
    chatButtonText: {
        ...typography.bodyBold,
    },
    sectionTitle: {
        ...typography.h3,
        marginBottom: spacing.m,
    },
    faqItem: {
        borderRadius: borderRadius.m,
        padding: spacing.m,
        marginBottom: spacing.m,
        ...shadows.small,
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.s,
    },
    question: {
        ...typography.bodyBold,
        flex: 1,
        marginRight: spacing.s,
    },
    answer: {
        ...typography.body,
        lineHeight: 20,
    },
    footer: {
        alignItems: 'center',
        marginTop: spacing.l,
        marginBottom: spacing.xl,
    },
    footerText: {
        ...typography.body,
        marginBottom: spacing.xs,
    },
    emailLink: {
        ...typography.bodyBold,
    }
});
