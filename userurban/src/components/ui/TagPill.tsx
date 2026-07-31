import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, typography } from '../../theme/tokens';

interface TagPillProps {
    label: string;
    selected?: boolean;
    onPress?: () => void;
    style?: ViewStyle;
}

export const TagPill: React.FC<TagPillProps> = ({ label, selected = false, onPress, style }) => {
    const { colors, isDark } = useTheme();

    return (
        <TouchableOpacity
            style={[
                styles.container,
                selected
                    ? { backgroundColor: colors.primary, borderColor: colors.primary }
                    : { backgroundColor: isDark ? colors.surface : colors.white, borderColor: colors.border },
                style,
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text
                style={[
                    styles.text,
                    selected ? { color: colors.white } : { color: colors.text },
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: spacing.s,
        paddingHorizontal: spacing.m,
        borderRadius: borderRadius.round,
        borderWidth: 1,
        marginRight: spacing.s,
    },
    text: {
        ...typography.caption,
        fontWeight: '600',
    },
});
