import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, useWindowDimensions, Text as RNText, Pressable } from 'react-native';
import { Text, ActivityIndicator, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, FadeInRight } from 'react-native-reanimated';
import { useAppDispatch } from '@/store';
import { updateUserProfile } from '@/store/slices/authSlice';
import { authAPI, serviceAPI } from '@/services/api';
import { theme } from '@/theme/theme';

interface Category {
    _id: string;
    name: string;
    level: 'main' | 'sub' | 'child';
    parentCategory?: string;
    icon?: string;
    image?: string;
    price?: number;
}

export default function InteractiveServiceScreen({ navigation }: any) {
    const { width } = useWindowDimensions();
    const isLargeScreen = width >= 1024;
    const dispatch = useAppDispatch();

    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [currentLevel, setCurrentLevel] = useState<'main' | 'sub' | 'child'>('main');
    const [breadcrumb, setBreadcrumb] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, [currentLevel, breadcrumb]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const parentId = breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1]._id : undefined;
            const response = await serviceAPI.getCategories(currentLevel, parentId);

            if (response.data.success) {
                setCategories(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryPress = (category: Category) => {
        if (category.level === 'child') {
            toggleSelection(category._id);
        } else {
            drillDown(category);
        }
    };

    const toggleSelection = (categoryId: string) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const drillDown = (category: Category) => {
        setBreadcrumb([...breadcrumb, category]);
        if (category.level === 'main') {
            setCurrentLevel('sub');
        } else if (category.level === 'sub') {
            setCurrentLevel('child');
        }
    };

    const goBack = () => {
        const newBreadcrumb = [...breadcrumb];
        newBreadcrumb.pop();
        setBreadcrumb(newBreadcrumb);

        if (newBreadcrumb.length === 0) {
            setCurrentLevel('main');
        } else if (newBreadcrumb.length === 1) {
            setCurrentLevel('sub');
        }
    };

    const handleNext = async () => {
        if (selectedCategories.length === 0 || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await authAPI.updateServices(selectedCategories as any);
            dispatch(updateUserProfile({ services: selectedCategories as any }));
            navigation.navigate('WorkingHours');
        } catch (e) {
            console.warn('Failed to update services', e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getCategoryIcon = (category: Category): any => {
        const iconMap: { [key: string]: any } = {
            'Plumbing': 'pipe-wrench',
            'Electrical': 'lightning-bolt',
            'Cleaning': 'broom',
            'Painting': 'format-paint',
            'Carpentry': 'hammer',
            'AC Repair': 'air-conditioner',
            'Appliance': 'washing-machine',
            'Beauty': 'face-woman',
            'Massage': 'hand-heart',
        };
        return iconMap[category.name] || 'tools';
    };

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                {/* Left Side - Hero (Large Screen) */}
                {isLargeScreen && (
                    <Animated.View
                        entering={FadeInRight.duration(1000).springify()}
                        style={styles.heroContainer}
                    >
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1581578731117-104f2a863a30?q=80&w=2070&auto=format&fit=crop' }}
                            style={styles.heroImage}
                            resizeMode="cover"
                        />
                        <LinearGradient
                            colors={['rgba(99, 102, 241, 0.8)', 'rgba(79, 70, 229, 0.9)']}
                            style={styles.heroOverlay}
                        >
                            <View style={styles.heroContent}>
                                <Animated.Text entering={FadeInUp.delay(200).duration(800)} style={styles.heroTitle}>
                                    What Do You Do?
                                </Animated.Text>
                                <Animated.Text entering={FadeInUp.delay(400).duration(800)} style={styles.heroSubtitle}>
                                    {currentLevel === 'main' && 'Select your service category to get started.'}
                                    {currentLevel === 'sub' && 'Choose the specific type of service you provide.'}
                                    {currentLevel === 'child' && 'Select all the services you offer to customers.'}
                                </Animated.Text>
                            </View>
                        </LinearGradient>
                    </Animated.View>
                )}

                {/* Right Side - Service Selection */}
                <View style={[styles.formContainer, !isLargeScreen && styles.formContainerFull]}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <Animated.View
                            entering={FadeInDown.duration(800).springify()}
                            style={styles.formContent}
                        >
                            {/* Header with Back Button */}
                            {breadcrumb.length > 0 && (
                                <Pressable onPress={goBack} style={styles.backButton}>
                                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.primary} />
                                    <Text style={styles.backText}>Back</Text>
                                </Pressable>
                            )}

                            {/* Breadcrumb */}
                            {breadcrumb.length > 0 && (
                                <View style={styles.breadcrumbContainer}>
                                    <Text style={styles.breadcrumbText}>
                                        {breadcrumb.map(cat => cat.name).join(' > ')}
                                    </Text>
                                </View>
                            )}

                            <View style={styles.header}>
                                <Text style={styles.welcomeText}>
                                    {currentLevel === 'main' && 'Select Your Service Category'}
                                    {currentLevel === 'sub' && 'Choose Subcategory'}
                                    {currentLevel === 'child' && 'Select Services'}
                                </Text>
                                <Text style={styles.instructionText}>
                                    {currentLevel === 'child'
                                        ? 'Tap to select the specific services you provide'
                                        : 'Tap a category to explore more options'}
                                </Text>
                            </View>

                            {/* Loading State */}
                            {loading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color={theme.colors.primary} />
                                    <Text style={styles.loadingText}>Loading categories...</Text>
                                </View>
                            ) : (
                                <>
                                    {/* Categories Grid */}
                                    <View style={styles.servicesGrid}>
                                        {categories.map((category) => {
                                            const isSelected = selectedCategories.includes(category._id);
                                            const icon = getCategoryIcon(category);

                                            return (
                                                <Pressable
                                                    key={category._id}
                                                    onPress={() => handleCategoryPress(category)}
                                                    style={({ pressed }) => [
                                                        styles.serviceCard,
                                                        isSelected && styles.serviceCardSelected,
                                                        pressed && styles.serviceCardPressed
                                                    ]}
                                                >
                                                    <View style={[styles.serviceIcon, isSelected && styles.serviceIconSelected]}>
                                                        <MaterialCommunityIcons
                                                            name={icon}
                                                            size={28}
                                                            color={isSelected ? '#ffffff' : theme.colors.primary}
                                                        />
                                                    </View>
                                                    <Text style={[styles.serviceName, isSelected && styles.serviceNameSelected]}>
                                                        {category.name}
                                                    </Text>

                                                    {category.level !== 'child' && (
                                                        <View style={styles.arrowIcon}>
                                                            <MaterialCommunityIcons
                                                                name="chevron-right"
                                                                size={20}
                                                                color={isSelected ? '#ffffff' : theme.colors.primary}
                                                            />
                                                        </View>
                                                    )}

                                                    {isSelected && (
                                                        <View style={styles.checkmark}>
                                                            <MaterialCommunityIcons name="check" size={14} color="#ffffff" />
                                                        </View>
                                                    )}
                                                </Pressable>
                                            );
                                        })}
                                    </View>

                                    {/* Footer */}
                                    <View style={styles.footer}>
                                        {selectedCategories.length > 0 && (
                                            <Chip mode="flat" style={styles.selectedChip}>
                                                {selectedCategories.length} service{selectedCategories.length !== 1 ? 's' : ''} selected
                                            </Chip>
                                        )}

                                        {currentLevel === 'child' && (
                                            <Pressable
                                                onPress={handleNext}
                                                disabled={selectedCategories.length === 0 || isSubmitting}
                                                style={({ pressed }) => [
                                                    styles.continueButton,
                                                    (selectedCategories.length === 0 || isSubmitting) && styles.continueButtonDisabled,
                                                    pressed && styles.continueButtonPressed
                                                ]}
                                            >
                                                <LinearGradient
                                                    colors={selectedCategories.length > 0 ? [theme.colors.primary, theme.colors.secondary] : ['#e2e8f0', '#cbd5e1']}
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 1, y: 0 }}
                                                    style={styles.gradientButton}
                                                >
                                                    {isSubmitting ? (
                                                        <ActivityIndicator color="#fff" size="small" />
                                                    ) : (
                                                        <Text style={styles.continueButtonText}>Continue</Text>
                                                    )}
                                                </LinearGradient>
                                            </Pressable>
                                        )}
                                    </View>
                                </>
                            )}
                        </Animated.View>
                    </ScrollView>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        overflow: 'hidden',
    },
    row: {
        flex: 1,
        flexDirection: 'row',
    },
    heroContainer: {
        flex: 1,
        position: 'relative',
        backgroundColor: '#1e1b4b',
    },
    heroImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        padding: 60,
        justifyContent: 'center',
    },
    heroContent: {
        maxWidth: 600,
    },
    heroTitle: {
        fontSize: 48,
        fontWeight: '800',
        color: '#ffffff',
        marginBottom: 24,
        lineHeight: 56,
        fontFamily: Platform.select({ web: 'Inter, sans-serif' }),
    },
    heroSubtitle: {
        fontSize: 20,
        color: '#e0e7ff',
        marginBottom: 48,
        lineHeight: 30,
        fontFamily: Platform.select({ web: 'Inter, sans-serif' }),
    },
    formContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    formContainerFull: {
        flex: 1,
        width: '100%',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 24,
    },
    formContent: {
        width: '100%',
        maxWidth: 900,
        paddingHorizontal: 20,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        alignSelf: 'flex-start',
    },
    backText: {
        fontSize: 16,
        color: theme.colors.primary,
        marginLeft: 8,
        fontWeight: '600',
    },
    breadcrumbContainer: {
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    breadcrumbText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
        fontFamily: Platform.select({ web: 'Inter, sans-serif' }),
    },
    instructionText: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: '#64748b',
    },
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 40,
    },
    serviceCard: {
        width: 180,
        height: 160,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#f1f5f9',
        // @ts-ignore
        transition: 'all 0.2s ease',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        position: 'relative',
    },
    serviceCardSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: '#f5f3ff',
        transform: [{ translateY: -4 }],
        shadowColor: theme.colors.primary,
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    serviceCardPressed: {
        transform: [{ scale: 0.98 }],
    },
    serviceIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    serviceIconSelected: {
        backgroundColor: theme.colors.primary,
    },
    serviceName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        textAlign: 'center',
    },
    serviceNameSelected: {
        color: theme.colors.primary,
        fontWeight: '700',
    },
    arrowIcon: {
        position: 'absolute',
        bottom: 12,
        right: 12,
    },
    checkmark: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
    },
    selectedChip: {
        backgroundColor: '#f0f4ff',
        marginBottom: 24,
    },
    continueButton: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 4,
    },
    continueButtonDisabled: {
        opacity: 0.7,
        shadowOpacity: 0,
    },
    continueButtonPressed: {
        transform: [{ scale: 0.98 }],
    },
    gradientButton: {
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    continueButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        letterSpacing: 0.5,
    },
});
