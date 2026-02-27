import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, fonts, spacing, commonStyles } from '../../src/theme';
import { Button } from '../../src/components/ui';
import { AddressCard } from '../../src/components/addresses/AddressCard';
import { useAddresses, useDeleteAddress, useSetDefaultAddress } from '../../src/hooks/useAddresses';
import { useRTL } from '../../src/hooks/useRTL';
import { useRequireAuth } from '../../src/hooks/useRequireAuth';
import type { Address } from '../../src/types/address';

export default function AddressListScreen() {
  const isAuthenticated = useRequireAuth();
  const { t } = useTranslation();
  const isRTL = useRTL();
  const router = useRouter();

  if (!isAuthenticated) return null;
  const { data: addresses, isLoading, refetch } = useAddresses();
  const deleteAddress = useDeleteAddress();
  const setDefault = useSetDefaultAddress();

  const handleDelete = (address: Address) => {
    Alert.alert(
      t('addresses.delete'),
      t('addresses.delete_confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => deleteAddress.mutate(address.id),
        },
      ]
    );
  };

  const handleSetDefault = (address: Address) => {
    setDefault.mutate(address.id);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: t('addresses.title') }} />
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: t('addresses.title') }} />
      <FlatList
        data={addresses || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onRefresh={refetch}
        refreshing={isLoading}
        renderItem={({ item }) => (
          <AddressCard
            address={item}
            onPress={() => router.push(`/addresses/add?id=${item.id}`)}
            onDelete={() => handleDelete(item)}
            onSetDefault={() => handleSetDefault(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={64} color={colors.muted.foreground} />
            <Text style={[styles.emptyTitle, isRTL && commonStyles.rtlText]}>
              {t('addresses.empty')}
            </Text>
            <Text style={[styles.emptySubtitle, isRTL && commonStyles.rtlText]}>
              {t('addresses.empty_subtitle')}
            </Text>
          </View>
        }
        ListFooterComponent={
          <Button
            title={t('addresses.add')}
            onPress={() => router.push('/addresses/add')}
            size="lg"
            style={styles.addButton}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing[4],
    paddingBottom: spacing[10],
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing[10],
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: fonts.bold,
    color: colors.foreground,
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  emptySubtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
    textAlign: 'center',
  },
  addButton: {
    marginTop: spacing[2],
  },
});
