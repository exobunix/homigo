import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, useWindowDimensions, Text as RNText, Pressable } from 'react-native';
import { Text, TextInput, ActivityIndicator, Switch } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, FadeInRight } from 'react-native-reanimated';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateUserProfile } from '@/store/slices/authSlice';
import { authAPI } from '@/services/api';
import { theme } from '@/theme/theme';

export default function WorkingHoursScreen({ navigation }: any) {
    const { width } = useWindowDimensions();
    const isLargeScreen = width >= 1024;
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);

    const existing = user?.workingHours as any;
    const [startTime, setStartTime] = useState(existing?.monday?.startTime || '09:00');
    const [endTime, setEndTime] = useState(existing?.monday?.endTime || '18:00');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Simple working hours: same schedule for all days for now
    const handleSave = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        const daySchedule = {
            isWorking: true,
            startTime,
            endTime,
        };

        const workingHours = {
            monday: daySchedule,
            tuesday: daySchedule,
            wednesday: daySchedule,
            thursday: daySchedule,
            friday: daySchedule,
            saturday: daySchedule,
            sunday: { ...daySchedule, isWorking: false },
        };

        try {
            await authAPI.updateWorkingHours(workingHours as any);
            dispatch(updateUserProfile({ workingHours: workingHours as any }));
            navigation.navigate('OnboardingComplete');
        } catch (e) {
            console.warn('Failed to update working hours', e);
        } finally {
            setIsSubmitting(false);
        }
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
                            source={{ uri: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2068&auto=format&fit=crop' }} // Clock/Time/Schedule image
                            style={styles.heroImage}
                            resizeMode="cover"
                        />
                        <LinearGradient
                            colors={['rgba(99, 102, 241, 0.8)', 'rgba(79, 70, 229, 0.9)']}
                            style={styles.heroOverlay}
                        >
                            <View style={styles.heroContent}>
                                <Animated.Text entering={FadeInUp.delay(200).duration(800)} style={styles.heroTitle}>
                                    Set Your Availability
                                </Animated.Text>
                                <Animated.Text entering={FadeInUp.delay(400).duration(800)} style={styles.heroSubtitle}>
                                    Let customers know when you are available to provide services.
                                </Animated.Text>
                            </View>
                        </LinearGradient>
                    </Animated.View>
                )}

                {/* Right Side - Form */}
                <View style={[styles.formContainer, !isLargeScreen && styles.formContainerFull]}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <Animated.View
                            entering={FadeInDown.duration(800).springify()}
                            style={styles.formContent}
                        >
                            <View style={styles.header}>
                                <Text style={styles.welcomeText}>Working Hours</Text>
                                <Text style={styles.instructionText}>Set your standard daily schedule.</Text>
                            </View>

                            <View style={styles.scheduleCard}>
                                <View style={styles.scheduleHeader}>
                                    <MaterialCommunityIcons name="clock-outline" size={24} color={theme.colors.primary} />
                                    <Text style={styles.scheduleTitle}>Standard Schedule</Text>
                                </View>

                                <View style={styles.timeInputContainer}>
                                    <View style={styles.timeInputWrapper}>
                                        <Text style={styles.timeLabel}>Start Time</Text>
                                        <TextInput
                                            value={startTime}
                                            onChangeText={setStartTime}
                                            mode="outlined"
                                            style={styles.input}
                                            outlineColor="#e2e8f0"
                                            activeOutlineColor={theme.colors.primary}
                                            placeholder="09:00"
                                            right={<TextInput.Icon icon="clock-start" color="#64748b" />}
                                        />
                                    </View>

                                    <View style={styles.separator}>
                                        <Text style={styles.separatorText}>to</Text>
                                    </View>

                                    <View style={styles.timeInputWrapper}>
                                        <Text style={styles.timeLabel}>End Time</Text>
                                        <TextInput
                                            value={endTime}
                                            onChangeText={setEndTime}
                                            mode="outlined"
                                            style={styles.input}
                                            outlineColor="#e2e8f0"
                                            activeOutlineColor={theme.colors.primary}
                                            placeholder="18:00"
                                            right={<TextInput.Icon icon="clock-end" color="#64748b" />}
                                        />
                                    </View>
                                </View>

                                <View style={styles.daysPreview}>
                                    <Text style={styles.daysLabel}>Applies to:</Text>
                                    <View style={styles.daysRow}>
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                            <View key={day} style={styles.dayBadge}>
                                                <Text style={styles.dayText}>{day}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </View>

                            <Pressable
                                onPress={handleSave}
                                disabled={isSubmitting}
                                onHoverIn={() => setIsHovered(true)}
                                onHoverOut={() => setIsHovered(false)}
                                style={({ pressed }) => [
                                    styles.continueButton,
                                    isSubmitting && styles.continueButtonDisabled,
                                    pressed && styles.continueButtonPressed
                                ]}
                            >
                                <LinearGradient
                                    colors={[theme.colors.primary, theme.colors.secondary]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.gradientButton}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={styles.continueButtonText}>Complete Setup</Text>
                                    )}
                                </LinearGradient>
                            </Pressable>
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
        maxWidth: 500,
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
    scheduleCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    scheduleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    scheduleTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginLeft: 12,
    },
    timeInputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    timeInputWrapper: {
        flex: 1,
    },
    timeLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748b',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#ffffff',
    },
    separator: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        justifyContent: 'center',
    },
    separatorText: {
        color: '#94a3b8',
        fontWeight: '500',
    },
    daysPreview: {
        marginTop: 8,
    },
    daysLabel: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 12,
    },
    daysRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    dayBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
    },
    dayText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
    },
    continueButton: {
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
