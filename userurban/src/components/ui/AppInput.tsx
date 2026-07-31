import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, typography } from '../../theme/tokens';

interface AppInputProps extends TextInputProps {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
}

export const AppInput: React.FC<AppInputProps> = ({ label, error, leftIcon, style, ...props }) => {
    const { colors, isDark } = useTheme();

    return (
        <View style={styles.container}>
            {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
            <View style={[
                styles.inputContainer,
                {
                    backgroundColor: isDark ? colors.surface : colors.white,
                    borderColor: colors.border
                },
                error ? { borderColor: colors.error } : null
            ]}>
                {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
                <TextInput
                    style={[styles.input, { color: colors.text }, style]}
                    placeholderTextColor={colors.textSecondary}
                    {...props}
                />
            </View>
            {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.m,
        width: '100%',
    },
    label: {
        ...typography.caption,
        fontWeight: '600',
        marginBottom: spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: borderRadius.m,
        minHeight: 48,
    },
    iconContainer: {
        paddingLeft: spacing.m,
    },
    input: {
        flex: 1,
        padding: spacing.m,
        ...typography.body,
        height: '100%',
    },
    errorText: {
        ...typography.caption,
        marginTop: spacing.xs,
    },
});
