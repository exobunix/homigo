import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography, borderRadius, shadows } from '../../theme/tokens';

export const TermsScreen = ({ navigation }: any) => {
    const { colors } = useTheme();

    const renderSection = (title: string, content: string) => (
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>{content}</Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Terms & Conditions</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>Last Updated: November 20, 2025</Text>

                {renderSection("1. Introduction", "Welcome to Urban Prox. By using our app, you agree to these terms. Please read them carefully. These terms govern your use of our services and platform.")}

                {renderSection("2. Services", "We provide a platform connecting users with service professionals. We are not responsible for the conduct of any user or professional. All professionals are independent contractors.")}

                {renderSection("3. Payments & Refunds", "All payments are processed securely. You agree to pay for services rendered. Refunds are subject to our cancellation policy, which allows free cancellation up to 2 hours before the scheduled time.")}

                {renderSection("4. User Conduct", "You agree to use the app responsibly and respect our professionals. Harassment, abuse, or discrimination of any kind will result in immediate account termination.")}

                {renderSection("5. Privacy & Data", "Your data is safe with us. We only share necessary information with professionals to fulfill your service request. We do not sell your personal data to third parties.")}

                {renderSection("6. Liability", "Urban Prox is not liable for any direct, indirect, incidental, or consequential damages arising from the use of our services.")}
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
        justifyContent: 'space-between',
        padding: spacing.m,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: spacing.xs,
    },
    headerTitle: {
        ...typography.h2,
    },
    content: {
        padding: spacing.m,
        paddingBottom: spacing.xl,
    },
    lastUpdated: {
        ...typography.caption,
        marginBottom: spacing.l,
        textAlign: 'center',
    },
    section: {
        padding: spacing.m,
        borderRadius: borderRadius.m,
        marginBottom: spacing.m,
        ...shadows.small,
    },
    sectionTitle: {
        ...typography.h3,
        marginBottom: spacing.s,
    },
    paragraph: {
        ...typography.body,
        lineHeight: 24,
    },
});
