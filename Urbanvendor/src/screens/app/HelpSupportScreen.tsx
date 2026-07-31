import React from 'react';
import { View, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { Card, Title, Text, Button, List, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HelpSupportScreen() {
  const openEmail = () => Linking.openURL('mailto:support@urbanvendor.example');
  const openPhone = () => Linking.openURL('tel:+919999999999');
  const openWhatsApp = () => Linking.openURL('https://wa.me/919999999999');

  return (
    <ScrollView style={styles.container}>
      {/* Header intro */}
      <Card style={[styles.sectionCard, { backgroundColor: '#eef2ff' }]}>
        <Card.Content style={styles.headerRow}>
          <View style={styles.headerIconCircle}>
            <MaterialCommunityIcons name="lifebuoy" size={28} color="#6366f1" />
          </View>
          <View style={{ flex: 1 }}>
            <Title style={styles.sectionTitle}>How can we help?</Title>
            <Text style={styles.subtitle}>Find quick answers or reach our support team.</Text>
            <View style={styles.quickChipsRow}>
              <Chip icon="help-circle" style={styles.quickChip} onPress={() => {}} textStyle={styles.quickChipText}>FAQs</Chip>
              <Chip icon="email" style={styles.quickChip} onPress={openEmail} textStyle={styles.quickChipText}>Email</Chip>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* FAQ categories */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>FAQs</Title>
          <List.Section>
            <List.Accordion title="Bookings" left={props => <List.Icon {...props} icon="clipboard-list-outline" /> }>
              <Text style={styles.faqText}>How do I accept or reject a booking?</Text>
              <Text style={styles.faqAnswer}>Open Bookings → tap a booking → use Accept/Reject buttons at the bottom.</Text>
              <Text style={styles.faqText}>Why I am not receiving new bookings?</Text>
              <Text style={styles.faqAnswer}>Ensure you are Online from Home page, update your service area, and check your notifications permissions.</Text>
              <Text style={styles.faqText}>How do I reschedule a booking?</Text>
              <Text style={styles.faqAnswer}>Contact the customer from booking details, agree on a new time, then update via support.</Text>
            </List.Accordion>
            <List.Accordion title="Payments & earnings" left={props => <List.Icon {...props} icon="wallet-outline" /> }>
              <Text style={styles.faqText}>When do I receive payments?</Text>
              <Text style={styles.faqAnswer}>Payouts are processed daily for completed jobs. See Earnings → Payouts.</Text>
              <Text style={styles.faqText}>Why is my payout lower than job amount?</Text>
              <Text style={styles.faqAnswer}>Platform commission and taxes may apply. See Earnings → Transactions breakdown.</Text>
              <Text style={styles.faqText}>How to update bank details?</Text>
              <Text style={styles.faqAnswer}>Go to Profile → Bank details and update your account info.</Text>
            </List.Accordion>
            <List.Accordion title="Profile & account" left={props => <List.Icon {...props} icon="account-outline" /> }>
              <Text style={styles.faqText}>How do I change my password?</Text>
              <Text style={styles.faqAnswer}>Profile → Support & security → Change password. You must enter your current password.</Text>
              <Text style={styles.faqText}>Can I change my phone number?</Text>
              <Text style={styles.faqAnswer}>For security, phone number is fixed. Contact support to request a change.</Text>
              <Text style={styles.faqText}>How to update my services and pricing?</Text>
              <Text style={styles.faqAnswer}>Open Services tab, choose a service, and edit pricing.</Text>
            </List.Accordion>
          </List.Section>
        </Card.Content>
      </Card>

      {/* Contact */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Contact support</Title>
          <View style={styles.actionsRow}>
            <Button mode="contained" icon={() => (<MaterialCommunityIcons name="email" size={18} color="#fff" />)} onPress={openEmail} style={styles.actionButton}>Email</Button>
            <Button mode="contained" icon={() => (<MaterialCommunityIcons name="phone" size={18} color="#fff" />)} onPress={openPhone} style={styles.actionButton}>Call</Button>
            <Button mode="contained" icon={() => (<MaterialCommunityIcons name="whatsapp" size={18} color="#fff" />)} onPress={openWhatsApp} style={styles.actionButton}>WhatsApp</Button>
          </View>
          <Text style={styles.helperText}>Support hours: 9:00 AM - 7:00 PM IST</Text>
        </Card.Content>
      </Card>

      {/* Still need help */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.stillNeedRow}>
            <MaterialCommunityIcons name="headset" size={22} color="#6366f1" />
            <Text style={styles.stillNeedText}>Still need help? Our team replies within a few hours.</Text>
          </View>
          <Button mode="outlined" onPress={openEmail}>Send us a message</Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  sectionCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  quickChipsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 8,
    
  },
  quickChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  quickChipText: {
    color: '#4f46e5',
    fontWeight: '400',
  },
  faqText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    paddingHorizontal: 8,
    paddingBottom: 10,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#6366f1',
  },
  helperText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
  },
  stillNeedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  stillNeedText: {
    flex: 1,
    fontSize: 13,
    color: '#1e293b',
  },
});
