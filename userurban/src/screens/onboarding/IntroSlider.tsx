import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/ui/AppButton';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography } from '../../theme/tokens';

const { width } = Dimensions.get('window');

const slides = [
    {
        id: 1,
        title: 'Expert Services',
        description: 'Get expert professionals for all your home needs.',
        image: 'https://cdn-icons-png.flaticon.com/512/1067/1067566.png', // Updated icon
    },
    {
        id: 2,
        title: 'Safe & Hygienic',
        description: 'Our professionals follow strict hygiene protocols.',
        image: 'https://cdn-icons-png.flaticon.com/512/2917/2917995.png',
    },
    {
        id: 3,
        title: 'Quality Assurance',
        description: '100% satisfaction guaranteed on every service.',
        image: 'https://cdn-icons-png.flaticon.com/512/995/995016.png',
    },
];

export const IntroSlider = ({ navigation }: any) => {
    const { colors, isDark } = useTheme();
    const [activeSlide, setActiveSlide] = useState(0);
    const scrollRef = React.useRef<ScrollView>(null);

    const handleScroll = (event: any) => {
        const slide = Math.ceil(event.nativeEvent.contentOffset.x / width);
        if (slide !== activeSlide) {
            setActiveSlide(slide);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.skipText, { color: colors.textSecondary }]} onPress={() => navigation.navigate('Login')}>Skip</Text>
            </View>

            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={styles.scrollContent}
            >
                {slides.map((slide) => (
                    <View key={slide.id} style={styles.slide}>
                        <View style={[styles.imageContainer, { backgroundColor: isDark ? colors.surfaceHighlight : colors.surface }]}>
                            <Image source={{ uri: slide.image }} style={styles.image} resizeMode="contain" />
                        </View>
                        <Text style={[styles.title, { color: colors.text }]}>{slide.title}</Text>
                        <Text style={[styles.description, { color: colors.textSecondary }]}>{slide.description}</Text>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.pagination}>
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                activeSlide === index ? { backgroundColor: colors.primary, width: 24 } : { backgroundColor: isDark ? colors.textSecondary : colors.border },
                            ]}
                        />
                    ))}
                </View>

                <AppButton
                    title={activeSlide === slides.length - 1 ? "Get Started" : "Next"}
                    onPress={() => {
                        if (activeSlide === slides.length - 1) {
                            navigation.navigate('Login');
                        } else {
                            scrollRef.current?.scrollTo({ x: width * (activeSlide + 1), animated: true });
                        }
                    }}
                    style={styles.button}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: spacing.m,
        alignItems: 'flex-end',
    },
    skipText: {
        ...typography.bodyBold,
    },
    scrollContent: {
        alignItems: 'center',
    },
    slide: {
        width,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    imageContainer: {
        width: 200,
        height: 200,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    image: {
        width: 100,
        height: 100,
    },
    title: {
        ...typography.h1,
        textAlign: 'center',
        marginBottom: spacing.m,
    },
    description: {
        ...typography.body,
        textAlign: 'center',
        paddingHorizontal: spacing.l,
    },
    footer: {
        padding: spacing.l,
        paddingBottom: spacing.xl * 2,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: spacing.l,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    button: {
        width: '100%',
    }
});
