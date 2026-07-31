import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Modal, useWindowDimensions } from 'react-native';
import { Card, Title, Text, Switch, Divider, TextInput, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout, updateUserProfile } from '@/store/slices/authSlice';
import { authAPI } from '@/services/api';

export default function VendorProfile({ navigation }: any) {
  const { width: windowWidth } = useWindowDimensions();
  const isLargeScreen = Platform.OS === 'web' && windowWidth >= 900;
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const name = user?.name || 'Your Name';
  const phone = user?.phone || '+91 9876543210';
  const email = user?.email || 'you@example.com';
  const rating = user?.rating ?? 4.8;
  const totalJobs = user?.totalJobs ?? 156;
  const bankVerified = user?.bankDetails?.isVerified;
  const kycVerified = user?.kyc?.isVerified;
  const notificationsEnabled = (user as any)?.notificationsEnabled ?? true;

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const toggleNotifications = async (value: boolean) => {
    try {
      await authAPI.updateNotifications(value);
      dispatch(updateUserProfile({ notificationsEnabled: value } as any));
      if (value) {
        try {
          const { status: existing } = await Notifications.getPermissionsAsync();
          if (existing !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
              return;
            }
          }
          if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
              name: 'Default',
              importance: Notifications.AndroidImportance.MAX,
            } as any);
          }
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Notifications enabled',
              body: 'You will receive booking and payment alerts.',
              data: { screen: 'Notifications', action: 'showNotifications' } as any,
            } as any,
            trigger: null as any,
          });
        } catch {}
      }
    } catch (e) {
      // no-op; you can add a toast/snackbar if needed
    }
  };

  const openChangePassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setShowPasswordModal(true);
  };

  const closeChangePassword = () => {
    if (!isChangingPassword) {
      setShowPasswordModal(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill all fields');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password must match');
      return;
    }

    setIsChangingPassword(true);
    setPasswordError('');
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      setShowPasswordModal(false);
    } catch (e: any) {
      const message = e?.response?.data?.message || 'Failed to change password';
      setPasswordError(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.innerContent, isLargeScreen && styles.innerContentLarge]}>
      {/* Header */}
      <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.avatarCircle}>
            {user?.profileImage ? (
              <Image source={{ uri: (user as any).profileImage }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarInitial}>{name.charAt(0)}</Text>
            )}
          </View>
          <View style={styles.headerTextBlock}>
            <Text style={styles.profileName}>{name}</Text>
            <Text style={styles.profileMeta}>{phone}</Text>
            <Text style={styles.profileMeta}>{email}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statLabel}>Rating</Text>
            <View style={styles.statValueRow}>
              <MaterialCommunityIcons name="star" size={18} color="#facc15" />
              <Text style={styles.statValue}>{rating}</Text>
            </View>
            <Text style={styles.statHint}>Based on customer reviews</Text>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statLabel}>Total Jobs</Text>
            <Text style={styles.statValue}>{totalJobs}</Text>
            <Text style={styles.statHint}>Completed bookings</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Account settings */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Account</Title>
          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => navigation.navigate('ProfileSetup', { mode: 'edit' })}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: '#eef2ff' }]}>
                <MaterialCommunityIcons name="account-edit" size={20} color="#6366f1" />
              </View>
              <View>
                <Text style={styles.rowTitle}>Edit profile</Text>
                <Text style={styles.rowSubtitle}>Update your basic information</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#9ca3af" />
          </TouchableOpacity>

          <Divider style={styles.divider} />

          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => navigation.navigate('BankDetails')}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: '#dcfce7' }]}>
                <MaterialCommunityIcons name="credit-card" size={20} color="#16a34a" />
              </View>
              <View>
                <Text style={styles.rowTitle}>Bank details</Text>
                <Text style={styles.rowSubtitle}>
                  {bankVerified ? 'Bank account verified' : 'Add or update your payout details'}
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#9ca3af" />
          </TouchableOpacity>

          <Divider style={styles.divider} />

          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => navigation.navigate('KYCUpload')}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: '#fee2e2' }]}>
                <MaterialCommunityIcons name="id-card" size={20} color="#b91c1c" />
              </View>
              <View>
                <Text style={styles.rowTitle}>KYC & documents</Text>
                <Text style={styles.rowSubtitle}>
                  {kycVerified ? 'KYC verified' : 'Complete your KYC and upload documents'}
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#9ca3af" />
          </TouchableOpacity>
        </Card.Content>
      </Card>

      {/* Preferences */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Preferences</Title>
          <View style={styles.rowItem}>
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: '#ecfeff' }]}>
                <MaterialCommunityIcons name="bell-ring" size={20} color="#0284c7" />
              </View>
              <View>
                <Text style={styles.rowTitle}>Notifications</Text>
                <Text style={styles.rowSubtitle}>Booking and payment alerts</Text>
              </View>
            </View>
            <Switch value={!!notificationsEnabled} onValueChange={toggleNotifications} />
          </View>

          <Divider style={styles.divider} />

          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => navigation.navigate('ServiceArea')}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: '#fef9c3' }]}>
                <MaterialCommunityIcons name="map-marker-radius" size={20} color="#a16207" />
              </View>
              <View>
                <Text style={styles.rowTitle}>Service area</Text>
                <Text style={styles.rowSubtitle}>Update your working radius</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#9ca3af" />
          </TouchableOpacity>
        </Card.Content>
      </Card>

      {/* Danger zone */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Support & security</Title>
          <TouchableOpacity style={styles.rowItem} onPress={() => navigation.navigate('HelpSupport')}>
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: '#eef2ff' }]}>
                <MaterialCommunityIcons name="lifebuoy" size={20} color="#6366f1" />
              </View>
              <View>
                <Text style={styles.rowTitle}>Help & support</Text>
                <Text style={styles.rowSubtitle}>Get help from UrbanVendor team</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#9ca3af" />
          </TouchableOpacity>

          <Divider style={styles.divider} />

          <TouchableOpacity
            style={styles.rowItem}
            onPress={openChangePassword}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: '#fee2e2' }]}>
                <MaterialCommunityIcons name="lock-reset" size={20} color="#b91c1c" />
              </View>
              <View>
                <Text style={styles.rowTitle}>Change password</Text>
                <Text style={styles.rowSubtitle}>Update your account password</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#9ca3af" />
          </TouchableOpacity>

          <Divider style={styles.divider} />

          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => dispatch(logout())}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: '#fee2e2' }]}>
                <MaterialCommunityIcons name="logout" size={20} color="#b91c1c" />
              </View>
              <View>
                <Text style={[styles.rowTitle, { color: '#b91c1c' }]}>Logout</Text>
                <Text style={styles.rowSubtitle}>Sign out from this device</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#9ca3af" />
          </TouchableOpacity>
        </Card.Content>
      </Card>

      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={closeChangePassword}
      >
        <View style={styles.passwordModalOverlay}>
          <View style={styles.passwordModalContainer}>
            <Title style={styles.passwordModalTitle}>Change password</Title>
            {passwordError ? (
              <Text style={styles.passwordErrorText}>{passwordError}</Text>
            ) : null}
            <TextInput
              label="Current password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrent}
              style={styles.passwordModalInput}
              right={
                <TextInput.Icon
                  icon={showCurrent ? 'eye-off' : 'eye'}
                  onPress={() => setShowCurrent((v) => !v)}
                />
              }
            />
            <TextInput
              label="New password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNew}
              style={styles.passwordModalInput}
              right={
                <TextInput.Icon
                  icon={showNew ? 'eye-off' : 'eye'}
                  onPress={() => setShowNew((v) => !v)}
                />
              }
            />
            <TextInput
              label="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
              style={styles.passwordModalInput}
              right={
                <TextInput.Icon
                  icon={showConfirm ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirm((v) => !v)}
                />
              }
            />
            <View style={styles.passwordModalActions}>
              <Button onPress={closeChangePassword} disabled={isChangingPassword}>
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleChangePassword}
                loading={isChangingPassword}
              >
                Update
              </Button>
            </View>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
    gap: 16,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#a5b4fc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerTextBlock: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  profileMeta: {
    fontSize: 13,
    color: '#e5e7eb',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    elevation: 2,
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statHint: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  rowSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  divider: {
    marginVertical: 4,
  },
  passwordModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordModalContainer: {
    width: '90%',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  passwordModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  passwordModalInput: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  passwordModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  passwordErrorText: {
    fontSize: 12,
    color: '#dc2626',
    marginBottom: 4,
  },
});
