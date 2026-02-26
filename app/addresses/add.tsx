import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Switch,
  Alert,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '../../src/components/ui';
import { CityPickerModal } from '../../src/components/auth/CityPickerModal';
import { colors, typography, fonts, spacing, radius, commonStyles } from '../../src/theme';
import { supabase } from '../../src/api/supabase';
import { useAddress, useCreateAddress, useUpdateAddress } from '../../src/hooks/useAddresses';
import { useRTL } from '../../src/hooks/useRTL';
import type { AddressLabel } from '../../src/types/address';

interface City {
  id: string;
  city_name: string;
}

const LABEL_OPTIONS: { value: AddressLabel; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'home', icon: 'home-outline' },
  { value: 'work', icon: 'briefcase-outline' },
  { value: 'other', icon: 'location-outline' },
];

export default function AddAddressScreen() {
  const { t } = useTranslation();
  const isRTL = useRTL();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditMode = !!id;

  const { data: existingAddress } = useAddress(id || '');
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();

  const [label, setLabel] = useState<AddressLabel>('home');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [showCityPicker, setShowCityPicker] = useState(false);

  const normalizeDigits = (text: string): string => {
    const latinized = text.replace(/[٠-٩]/g, (d) =>
      String.fromCharCode(d.charCodeAt(0) - 0x0660 + 0x0030)
    );
    return latinized.replace(/[^0-9]/g, '');
  };

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    if (existingAddress) {
      setLabel(existingAddress.label);
      setFullName(existingAddress.full_name);
      const rawPhone = existingAddress.phone || '';
      setPhone(rawPhone.startsWith('+218') ? rawPhone.slice(4) : rawPhone);
      setCity(existingAddress.city);
      setAddressLine(existingAddress.address_line || '');
      setIsDefault(existingAddress.is_default);
    }
  }, [existingAddress]);

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('courier_fees')
        .select('id, city_name');
      if (!error && data) {
        setCities(data as City[]);
      }
    } catch (err) {
      console.warn('[AddAddress] Cities fetch failed:', err);
    }
  };

  const isPending = createAddress.isPending || updateAddress.isPending;

  const handleSave = async () => {
    if (!fullName.trim() || !phone || !city) {
      setError(t('addresses.form.error.validation'));
      return;
    }

    if (!/^9[0-9]{8}$/.test(phone)) {
      setError(t('addresses.form.error.invalid_phone'));
      return;
    }

    setError('');

    const formData = {
      label,
      full_name: fullName.trim(),
      phone: `+218${phone}`,
      city,
      address_line: addressLine.trim() || undefined,
      is_default: isDefault,
    };

    try {
      if (isEditMode && id) {
        await updateAddress.mutateAsync({ id, data: formData });
        Alert.alert('', t('addresses.form.success_update'));
      } else {
        await createAddress.mutateAsync(formData);
        Alert.alert('', t('addresses.form.success_add'));
      }
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('addresses.form.error.network'));
    }
  };

  const screenTitle = isEditMode ? t('addresses.edit') : t('addresses.add');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Stack.Screen options={{ title: screenTitle }} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Address Type */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, isRTL && commonStyles.rtlText]}>
            {t('addresses.form.label_title')}
          </Text>
          <View style={[styles.labelChips, isRTL && styles.labelChipsRTL]}>
            {LABEL_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={[styles.chip, label === option.value && styles.chipActive]}
                onPress={() => setLabel(option.value)}
              >
                <Ionicons
                  name={option.icon}
                  size={18}
                  color={label === option.value ? colors.primary.foreground : colors.foreground}
                />
                <Text style={[styles.chipText, label === option.value && styles.chipTextActive]}>
                  {t(`addresses.label.${option.value}`)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Full Name */}
        <Input
          label={t('addresses.form.full_name_label')}
          placeholder={t('addresses.form.full_name_placeholder')}
          value={fullName}
          onChangeText={setFullName}
          autoComplete="name"
        />

        {/* Phone with +218 prefix */}
        <View style={styles.phoneFieldContainer}>
          <Text style={[styles.label, isRTL && commonStyles.rtlText]}>
            {t('addresses.form.phone_label')}
          </Text>
          <View style={styles.phoneRow}>
            <View style={styles.phonePrefix}>
              <Text style={styles.phonePrefixText}>+218</Text>
            </View>
            <View style={styles.phoneInputWrapper}>
              <Input
                placeholder={t('addresses.form.phone_placeholder')}
                value={phone}
                onChangeText={(text) => setPhone(normalizeDigits(text))}
                keyboardType="number-pad"
                autoComplete="tel"
                maxLength={9}
                textAlign="left"
                style={styles.phoneInput}
              />
            </View>
          </View>
        </View>

        {/* City Picker */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, isRTL && commonStyles.rtlText]}>
            {t('addresses.form.city_label')}
          </Text>
          <Pressable
            style={[styles.pickerButton, isRTL && styles.pickerButtonRTL]}
            onPress={() => setShowCityPicker(true)}
          >
            <Text style={[styles.pickerText, !city && styles.pickerPlaceholder, isRTL && commonStyles.rtlText]}>
              {city || t('addresses.form.city_placeholder')}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.muted.foreground} />
          </Pressable>
        </View>

        <CityPickerModal
          visible={showCityPicker}
          onClose={() => setShowCityPicker(false)}
          cities={cities}
          selectedCity={city}
          onSelectCity={setCity}
          title={t('addresses.form.city_label')}
        />

        {/* Address Details */}
        <Input
          label={t('addresses.form.address_label')}
          placeholder={t('addresses.form.address_placeholder')}
          value={addressLine}
          onChangeText={setAddressLine}
          multiline
          numberOfLines={2}
        />

        {/* Default Toggle */}
        <View style={[styles.toggleRow, isRTL && styles.toggleRowRTL]}>
          <Text style={[styles.toggleLabel, isRTL && commonStyles.rtlText]}>
            {t('addresses.form.is_default')}
          </Text>
          <Switch
            value={isDefault}
            onValueChange={setIsDefault}
            trackColor={{ true: colors.primary.DEFAULT }}
            thumbColor={Platform.OS === 'android' ? colors.background : undefined}
          />
        </View>

        {error ? <Text style={[styles.error, isRTL && commonStyles.rtlText]}>{error}</Text> : null}

        <Button
          title={isPending ? t('addresses.form.saving') : t('addresses.form.save')}
          onPress={handleSave}
          loading={isPending}
          size="lg"
          style={styles.saveButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing[6],
    paddingBottom: spacing[10],
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.foreground,
    marginBottom: 6,
  },
  labelChips: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  labelChipsRTL: {
    flexDirection: 'row-reverse',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  chipText: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.medium,
    color: colors.foreground,
  },
  chipTextActive: {
    color: colors.primary.foreground,
  },
  phoneFieldContainer: {
    marginBottom: 0,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  phonePrefix: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: colors.secondary.DEFAULT,
    borderWidth: 1,
    borderColor: colors.input,
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
    borderRightWidth: 0,
  },
  phonePrefixText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.foreground,
  },
  phoneInputWrapper: {
    flex: 1,
  },
  phoneInput: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  pickerButton: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.input,
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
  },
  pickerButtonRTL: {
    flexDirection: 'row-reverse',
  },
  pickerText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.foreground,
  },
  pickerPlaceholder: {
    color: colors.muted.foreground,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    marginBottom: spacing[2],
  },
  toggleRowRTL: {
    flexDirection: 'row-reverse',
  },
  toggleLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.regular,
    color: colors.foreground,
  },
  saveButton: {
    marginTop: spacing[4],
  },
  error: {
    color: colors.destructive.DEFAULT,
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.regular,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
});
