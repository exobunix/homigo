import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../theme/tokens';

interface RatingStarsProps {
    rating: number; // 0 to 5
    size?: number;
    color?: string;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
    rating,
    size = 16,
    color,
}) => {
    const { colors } = useTheme();
    const starColor = color || colors.warning;

    const stars = [];
    for (let i = 1; i <= 5; i++) {
        const name = i <= rating ? 'star' : i - 0.5 <= rating ? 'star-half' : 'star-outline';
        stars.push(
            <Ionicons key={i} name={name} size={size} color={starColor} style={{ marginRight: 2 }} />
        );
    }

    return <View style={styles.container}>{stars}</View>;
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
