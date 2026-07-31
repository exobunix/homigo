import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography } from '../../theme/tokens';

const LANGUAGES = [
    { id: 'en', name: 'English', native: 'English' },
    { id: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { id: 'es', name: 'Spanish', native: 'Español' },
    { id: 'fr', name: 'French', native: 'Français' },
    { id: 'de', name: 'German', native: 'Deutsch' },
];

export const LanguageScreen = ({ navigation }: any) => {
    const { colors } = useTheme();
    const [selected, setSelected] = useState('en');

    const renderItem = ({ item }: any) => (
        <TouchableOpacity
            style={[
                styles.item,
                { borderColor: colors.border },
                selected === item.id && { borderColor: colors.primary, backgroundColor: colors.surfaceHighlight }
            ]}
            onPress={() => setSelected(item.id)}
        >
            <View>
                <Text style={[
                    styles.name,
                    { color: colors.text },
                    selected === item.id && { color: colors.primary }
                ]}>{item.name}</Text>
                <Text style={[
                    styles.native,
                    { color: colors.textSecondary },
                    selected === item.id && { color: colors.primary }
                ]}>{item.native}</Text>
            </View>
            {selected === item.id && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Select Language</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={LANGUAGES}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.content}
            />
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
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.m,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: spacing.m,
    },
    name: {
        ...typography.bodyBold,
    },
    native: {
        ...typography.caption,
    },
});
