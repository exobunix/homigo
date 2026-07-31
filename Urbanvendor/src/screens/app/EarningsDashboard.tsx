import React from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions, Platform } from 'react-native';
import { Card, Title, Text, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function EarningsDashboard() {
  const { width: windowWidth } = useWindowDimensions();
  const isLargeScreen = Platform.OS === 'web' && windowWidth >= 900;
  // Demo data for layout
  const earnings = {
    today: 1250,
    week: 8500,
    month: 32000,
    total: 12500,
    pending: 2500,
    lastPayout: 'Yesterday • ₹4,500',
  };

  const recentPayouts = [
    { id: '1', label: 'Weekly payout', amount: 4500, date: 'Yesterday' },
    { id: '2', label: 'Job earnings', amount: 800, date: '3 hours ago' },
    { id: '3', label: 'Job earnings', amount: 1250, date: 'Today, 10:30 AM' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.innerContent, isLargeScreen && styles.innerContentLarge]}>
      {/* Header */}
      <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerTitle}>Earnings</Text>
            <Text style={styles.headerSubtitle}>Track your income and payouts in one place.</Text>
          </View>
          <View style={styles.headerIconBlock}>
            <View style={styles.headerIconCircle}>
              <MaterialCommunityIcons name="wallet" size={28} color="#ffffff" />
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <Card style={[styles.summaryCard, styles.summaryCardToday]}>
          <Card.Content style={styles.summaryContent}>
            <View style={[styles.summaryIconWrapper, { backgroundColor: '#22c55e15' }]}>
              <MaterialCommunityIcons name="calendar-today" size={20} color="#22c55e" />
            </View>
            <View style={styles.summaryTextBlock}>
              <Text style={styles.summaryLabel}>Today</Text>
              <Text style={styles.summaryValue}>₹{earnings.today}</Text>
              <Text style={styles.summaryHint}>Earnings from today&apos;s jobs</Text>
            </View>
          </Card.Content>
        </Card>
        <Card style={[styles.summaryCard, styles.summaryCardWeek]}>
          <Card.Content style={styles.summaryContent}>
            <View style={[styles.summaryIconWrapper, { backgroundColor: '#3b82f615' }]}>
              <MaterialCommunityIcons name="calendar-week" size={20} color="#3b82f6" />
            </View>
            <View style={styles.summaryTextBlock}>
              <Text style={styles.summaryLabel}>This Week</Text>
              <Text style={styles.summaryValue}>₹{earnings.week}</Text>
              <Text style={styles.summaryHint}>Last 7 days</Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.summaryRow}>
        <Card style={styles.summaryCard}>
          <Card.Content style={styles.summaryContent}>
            <View style={[styles.summaryIconWrapper, { backgroundColor: '#8b5cf615' }]}>
              <MaterialCommunityIcons name="calendar-month" size={20} color="#8b5cf6" />
            </View>
            <View style={styles.summaryTextBlock}>
              <Text style={styles.summaryLabel}>This Month</Text>
              <Text style={styles.summaryValue}>₹{earnings.month}</Text>
              <Text style={styles.summaryHint}>Current month earnings</Text>
            </View>
          </Card.Content>
        </Card>
        <Card style={styles.summaryCard}>
          <Card.Content style={styles.summaryContent}>
            <View style={[styles.summaryIconWrapper, { backgroundColor: '#f9731615' }]}>
              <MaterialCommunityIcons name="cash-multiple" size={20} color="#f97316" />
            </View>
            <View style={styles.summaryTextBlock}>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={styles.summaryValue}>₹{earnings.total}</Text>
              <Text style={styles.summaryHint}>Lifetime with UrbanVendor</Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Wallet Status */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>Wallet status</Title>
          </View>
          <View style={styles.walletRow}>
            <View style={styles.walletLeft}>
              <Text style={styles.walletLabel}>Pending amount</Text>
              <Text style={styles.walletValue}>₹{earnings.pending}</Text>
              <Text style={styles.walletHint}>Will be paid in next payout cycle</Text>
            </View>
            <View style={styles.walletRight}>
              <Text style={styles.walletLabel}>Last payout</Text>
              <Text style={styles.walletMeta}>{earnings.lastPayout}</Text>
              <Chip style={styles.payoutChip} textStyle={styles.payoutChipText}>
                ON TIME
              </Chip>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Recent Payouts */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>Recent payouts</Title>
          </View>
          <View style={styles.payoutList}>
            {recentPayouts.map((item) => (
              <View key={item.id} style={styles.payoutItem}>
                <View style={styles.payoutIconWrapper}>
                  <MaterialCommunityIcons name="cash-check" size={22} color="#16a34a" />
                </View>
                <View style={styles.payoutTextBlock}>
                  <Text style={styles.payoutTitle}>{item.label}</Text>
                  <Text style={styles.payoutSubtitle}>{item.date}</Text>
                </View>
                <Text style={styles.payoutAmount}>₹{item.amount}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  innerContent: {
    width: '100%',
  },
  innerContentLarge: {
    maxWidth: 960,
    alignSelf: 'center',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextBlock: {
    flex: 1,
    paddingRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e5e7eb',
    lineHeight: 20,
  },
  headerIconBlock: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#a5b4fc',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#818cf8',
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 14,
    elevation: 3,
    backgroundColor: '#ffffff',
  },
  summaryCardToday: {
    backgroundColor: '#bbf7d0', // soft green
  },
  summaryCardWeek: {
    backgroundColor: '#bfdbfe', // soft blue
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTextBlock: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  summaryHint: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  sectionCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  walletLeft: {
    flex: 1,
  },
  walletRight: {
    flex: 1,
  },
  walletLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  walletValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#16a34a',
    marginTop: 4,
  },
  walletHint: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  walletMeta: {
    fontSize: 13,
    color: '#111827',
    marginTop: 4,
    marginBottom: 4,
  },
  payoutChip: {
    backgroundColor: '#dcfce7',
  },
  payoutChipText: {
    color: '#16a34a',
    fontSize: 11,
    fontWeight: '600',
  },
  payoutList: {
    marginTop: 8,
    gap: 8,
  },
  payoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  payoutIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  payoutTextBlock: {
    flex: 1,
  },
  payoutTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  payoutSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  payoutAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
});
