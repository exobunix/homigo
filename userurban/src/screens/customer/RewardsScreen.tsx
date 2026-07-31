import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../../components/ui/AppButton';
import { useTheme } from '../../context/ThemeContext';

const INITIAL_POINTS = 240;

const REWARDS = [
    { id: '1', title: 'Free Haircut', points: 500, image: 'https://cdn-icons-png.flaticon.com/512/3655/3655573.png' },
    { id: '2', title: '$10 Off Cleaning', points: 100, image: 'https://cdn-icons-png.flaticon.com/512/995/995016.png' },
    { id: '3', title: 'Free Massage', points: 1200, image: 'https://cdn-icons-png.flaticon.com/512/3050/3050239.png' },
];

export const RewardsScreen = () => {
    const { colors, isDark } = useTheme();
    const [points, setPoints] = useState(INITIAL_POINTS);

    const handleInvite = () => {
        Alert.alert('Invite Sent!', 'You have successfully invited your friend. You will receive 100 points once they sign up.');
    };

    const handleRedeem = (item: any) => {
        if (points >= item.points) {
            Alert.alert(
                'Confirm Redemption',
                `Are you sure you want to redeem ${item.title} for ${item.points} points?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Redeem',
                        onPress: () => {
                            setPoints(prev => prev - item.points);
                            Alert.alert('Success!', `You have redeemed ${item.title}. Check your email for the voucher code.`);
                        }
                    }
                ]
            );
        } else {
            Alert.alert('Insufficient Points', `You need ${item.points - points} more points to redeem this reward.`);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Rewards</Text>
                <View style={[styles.pointsBadge, { backgroundColor: isDark ? colors.surfaceHighlight : '#FFF9E6', borderColor: '#FFD700' }]}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={[styles.pointsText, { color: isDark ? colors.text : colors.black }]}>{points} Pts</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Hero Card */}
                <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
                    <View style={styles.heroContent}>
                        <Text style={[styles.heroTitle, { color: colors.white }]}>Refer a Friend</Text>
                        <Text style={[styles.heroSubtitle, { color: 'rgba(255,255,255,0.9)' }]}>Get 100 points for every referral</Text>
                        <AppButton
                            title="Invite Now"
                            variant="secondary"
                            style={styles.inviteButton}
                            textStyle={{ color: colors.primary }}
                            onPress={handleInvite}
                        />
                    </View>
                    <Image
                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1162/1162951.png' }}
                        style={styles.heroImage}
                    />
                </View>

                {/* Progress Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Level</Text>
                    <View style={[styles.levelCard, { backgroundColor: isDark ? colors.surface : colors.white }]}>
                        <View style={styles.levelHeader}>
                            <Text style={[styles.levelName, { color: colors.primary }]}>Silver Member</Text>
                            <Text style={[styles.levelProgress, { color: colors.textSecondary }]}>{points} / 500</Text>
                        </View>
                        <View style={[styles.progressBarBg, { backgroundColor: isDark ? colors.background : colors.surface }]}>
                            <View style={[styles.progressBarFill, { width: `${Math.min((points / 500) * 100, 100)}%`, backgroundColor: colors.primary }]} />
                        </View>
                        <Text style={[styles.levelNote, { color: colors.textSecondary }]}>
                            {points < 500
                                ? `${500 - points} points to reach Gold`
                                : 'You are a Gold Member!'}
                        </Text>
                    </View>
                </View>

                {/* Rewards List */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Redeem Rewards</Text>
                    {REWARDS.map((item) => (
                        <View key={item.id} style={[styles.rewardItem, { backgroundColor: isDark ? colors.surface : colors.white }]}>
                            <View style={[styles.rewardIconContainer, { backgroundColor: isDark ? colors.background : colors.surface }]}>
                                <Image source={{ uri: item.image }} style={styles.rewardIcon} />
                            </View>
                            <View style={styles.rewardInfo}>
                                <Text style={[styles.rewardTitle, { color: colors.text }]}>{item.title}</Text>
                                <Text style={[styles.rewardPoints, { color: colors.primary }]}>{item.points} pts</Text>
                            </View>
                            <AppButton
                                title={points >= item.points ? "Redeem" : "Locked"}
                                variant={points >= item.points ? "primary" : "outline"}
                                style={[styles.redeemButton, points < item.points ? { opacity: 0.5 } : undefined]}
                                textStyle={{ fontSize: 12 }}
                                disabled={points < item.points}
                                onPress={() => handleRedeem(item)}
                            />
                        </View>
                    ))}
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
        padding: spacing.m,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    headerTitle: {
        ...typography.h2,
    },
    pointsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.l,
        borderWidth: 1,
    },
    pointsText: {
        ...typography.bodyBold,
        marginLeft: spacing.xs,
    },
    content: {
        padding: spacing.m,
    },
    heroCard: {
        borderRadius: borderRadius.l,
        padding: spacing.m,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.l,
        ...shadows.medium,
    },
    heroContent: {
        flex: 1,
    },
    heroTitle: {
        ...typography.h2,
        marginBottom: spacing.xs,
    },
    heroSubtitle: {
        ...typography.caption,
        marginBottom: spacing.m,
    },
    inviteButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.m,
        alignSelf: 'flex-start',
    },
    heroImage: {
        width: 80,
        height: 80,
        marginLeft: spacing.m,
    },
    section: {
        marginBottom: spacing.l,
    },
    sectionTitle: {
        ...typography.h3,
        marginBottom: spacing.m,
    },
    levelCard: {
        borderRadius: borderRadius.m,
        padding: spacing.m,
        ...shadows.small,
    },
    levelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.s,
    },
    levelName: {
        ...typography.bodyBold,
    },
    levelProgress: {
        ...typography.caption,
    },
    progressBarBg: {
        height: 8,
        borderRadius: 4,
        marginBottom: spacing.s,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    levelNote: {
        ...typography.caption,
    },
    rewardItem: {
        borderRadius: borderRadius.m,
        padding: spacing.m,
        marginBottom: spacing.m,
        flexDirection: 'row',
        alignItems: 'center',
        ...shadows.small,
    },
    rewardIconContainer: {
        width: 50,
        height: 50,
        borderRadius: borderRadius.m,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.m,
    },
    rewardIcon: {
        width: 30,
        height: 30,
    },
    rewardInfo: {
        flex: 1,
    },
    rewardTitle: {
        ...typography.bodyBold,
    },
    rewardPoints: {
        ...typography.caption,
        fontWeight: 'bold',
    },
    redeemButton: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.m,
        minWidth: 80,
    }
});
