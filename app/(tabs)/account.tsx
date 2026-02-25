import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { colors, typography, fonts, spacing } from '../../src/theme';
import { Card, Button } from '../../src/components/ui';
import { LoyaltyCard } from '../../src/components/loyalty/LoyaltyCard';
import { useRTL } from '../../src/hooks/useRTL';

export default function AccountScreen() {
  const { userData, logout } = useAuthStore();
  const router = useRouter();
  const { t } = useTranslation();
  const isRTL = useRTL();

  if (!userData) {
    return (
      <View style={styles.guestContainer}>
        <Text style={styles.guestTitle}>{t('account.guest.title')}</Text>
        <Text style={styles.guestSubtext}>
          {t('account.guest.subtitle')}
        </Text>
        <Button
          title={t('account.guest.sign_in')}
          onPress={() => router.push('/(auth)/login')}
          size="lg"
          style={styles.button}
        />
        <Button
          title={t('account.guest.create_account')}
          onPress={() => router.push('/(auth)/register')}
          variant="outline"
          size="lg"
          style={styles.button}
        />
      </View>
    );
  }

  const MenuItem = ({ icon, title, onPress }: any) => (
    <Pressable style={[styles.menuItem, isRTL && styles.menuItemRTL]} onPress={onPress}>
      <View style={[styles.menuLeft, isRTL && styles.menuLeftRTL]}>
        <Ionicons name={icon} size={24} color={colors.primary.DEFAULT} />
        <Text style={[styles.menuText, isRTL && styles.menuTextRTL]}>{title}</Text>
      </View>
      <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.muted.foreground} />
    </Pressable>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <Card variant="elevated" style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color={colors.primary.DEFAULT} />
          </View>
          <Text style={styles.name}>{userData.name}</Text>
          <Text style={styles.email}>{userData.email}</Text>
        </View>
      </Card>

      {/* Loyalty Card */}
      <View style={styles.loyaltyContainer}>
        <LoyaltyCard totalSpend={userData.totalSpend || 0} />
      </View>

      {/* Menu Items */}
      <Card style={styles.menuCard}>
        <MenuItem
          icon="receipt-outline"
          title={t('account.menu.orders')}
          onPress={() => router.push('/orders')}
        />
        <MenuItem
          icon="person-outline"
          title={t('account.menu.profile')}
          onPress={() => {}}
        />
        <MenuItem
          icon="location-outline"
          title={t('account.menu.addresses')}
          onPress={() => {}}
        />
        <MenuItem
          icon="globe-outline"
          title={t('account.menu.language')}
          onPress={() => router.push('/settings')}
        />
      </Card>

      <Button
        title={t('account.logout')}
        onPress={logout}
        variant="outline"
        size="lg"
        style={styles.logoutButton}
      />

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing[6],
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  guestTitle: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: fonts.bold,
    color: colors.primary.DEFAULT,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  guestSubtext: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
    textAlign: 'center',
    marginBottom: spacing[8],
  },
  button: {
    width: '100%',
    marginTop: spacing[2],
  },
  profileCard: {
    margin: spacing[4],
    marginBottom: spacing[3],
  },
  profileHeader: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.muted.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  name: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: fonts.bold,
    color: colors.foreground,
    marginBottom: spacing[1],
  },
  email: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
  },
  loyaltyContainer: {
    paddingHorizontal: spacing[4],
    marginBottom: spacing[3],
  },
  menuCard: {
    margin: spacing[4],
    marginTop: spacing[3],
    padding: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemRTL: {
    flexDirection: 'row-reverse',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuLeftRTL: {
    flexDirection: 'row-reverse',
  },
  menuText: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.regular,
    color: colors.foreground,
    marginLeft: spacing[3],
  },
  menuTextRTL: {
    marginLeft: 0,
    marginRight: spacing[3],
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  logoutButton: {
    margin: spacing[4],
  },
  bottomSpacing: {
    height: spacing[6],
  },
});
