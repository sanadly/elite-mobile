import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format, parseISO } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '../../src/components/ui';
import { CityPickerModal } from '../../src/components/auth/CityPickerModal';
import { colors, typography, fonts, spacing, radius, commonStyles } from '../../src/theme';
import { supabase } from '../../src/api/supabase';
import { useProfile, useUpdateProfile } from '../../src/hooks/useProfile';
import { useRTL } from '../../src/hooks/useRTL';

interface City {
  id: string;
  city_name: string;
}

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const isRTL = useRTL();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
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
    if (profile) {
      setName(profile.name || '');
      // Strip +218 prefix if present
      const rawPhone = profile.phone || '';
      setPhone(rawPhone.startsWith('+218') ? rawPhone.slice(4) : rawPhone);
      setCity(profile.city || '');
      if (profile.birthday) {
        try {
          setDateOfBirth(parseISO(profile.birthday));
        } catch {
          // ignore invalid date
        }
      }
    }
  }, [profile]);

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('courier_fees')
        .select('id, city_name');
      if (!error && data) {
        setCities(data as City[]);
      }
    } catch (err) {
      console.warn('[EditProfile] Cities fetch failed:', err);
    }
  };

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError(t('profile.edit.error.validation'));
      return;
    }

    if (phone && !/^9[0-9]{8}$/.test(phone)) {
      setError(t('profile.edit.error.invalid_phone'));
      return;
    }

    setError('');

    try {
      await updateProfile.mutateAsync({
        name: name.trim(),
        phone: phone ? `+218${phone}` : '',
        city,
        birthday: dateOfBirth ? format(dateOfBirth, 'yyyy-MM-dd') : null,
      });

      Alert.alert('', t('profile.edit.success'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('profile.edit.error.network'));
    }
  };

  if (profileLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: t('profile.edit.title') }} />
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Stack.Screen options={{ title: t('profile.edit.title') }} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name */}
        <Input
          label={t('profile.edit.name_label')}
          placeholder={t('profile.edit.name_placeholder')}
          value={name}
          onChangeText={setName}
          autoComplete="name"
        />

        {/* Email (read-only) */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, isRTL && commonStyles.rtlText]}>{t('profile.edit.email_label')}</Text>
          <View style={styles.disabledInput}>
            <Text style={[styles.disabledText, isRTL && commonStyles.rtlText]}>{profile?.email || ''}</Text>
          </View>
          <Text style={[styles.hint, isRTL && commonStyles.rtlText]}>{t('profile.edit.email_disabled_hint')}</Text>
        </View>

        {/* Phone with +218 prefix */}
        <View style={styles.phoneFieldContainer}>
          <Text style={[styles.label, isRTL && commonStyles.rtlText]}>{t('profile.edit.phone_label')}</Text>
          <View style={styles.phoneRow}>
            <View style={styles.phonePrefix}>
              <Text style={styles.phonePrefixText}>+218</Text>
            </View>
            <View style={styles.phoneInputWrapper}>
              <Input
                placeholder={t('profile.edit.phone_placeholder')}
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
          <Text style={[styles.label, isRTL && commonStyles.rtlText]}>{t('profile.edit.city_label')}</Text>
          <Pressable
            style={[styles.pickerButton, isRTL && styles.pickerButtonRTL]}
            onPress={() => setShowCityPicker(true)}
          >
            <Text style={[styles.pickerText, !city && styles.pickerPlaceholder, isRTL && commonStyles.rtlText]}>
              {city || t('profile.edit.city_placeholder')}
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
          title={t('profile.edit.city_label')}
        />

        {/* Date of Birth */}
        <View style={styles.fieldContainer}>
          <View style={[styles.labelRow, isRTL && styles.labelRowRTL]}>
            <Text style={[styles.label, isRTL && commonStyles.rtlText]}>{t('profile.edit.birthday_label')}</Text>
            {!profile?.birthday && (
              <Text style={styles.optionalBadge}>{t('common.optional')}</Text>
            )}
          </View>
          {profile?.birthday ? (
            <>
              <View style={[styles.disabledInput, styles.lockedRow, isRTL && styles.lockedRowRTL]}>
                <Text style={[styles.disabledText, isRTL && commonStyles.rtlText]}>
                  {dateOfBirth ? format(dateOfBirth, 'yyyy-MM-dd') : profile.birthday}
                </Text>
                <Ionicons name="lock-closed-outline" size={16} color={colors.muted.foreground} />
              </View>
              <Text style={[styles.lockedHint, isRTL && commonStyles.rtlText]}>
                {t('profile.edit.birthday_locked')}
              </Text>
            </>
          ) : (
            <Pressable
              style={[styles.pickerButton, isRTL && styles.pickerButtonRTL]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.pickerText, !dateOfBirth && styles.pickerPlaceholder, isRTL && commonStyles.rtlText]}>
                {dateOfBirth ? format(dateOfBirth, 'yyyy-MM-dd') : t('profile.edit.birthday_placeholder')}
              </Text>
              <Ionicons name="calendar-outline" size={18} color={colors.muted.foreground} />
            </Pressable>
          )}
        </View>

        {showDatePicker && (
          Platform.OS === 'ios' ? (
            <Modal transparent animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
              <Pressable style={styles.modalOverlay} onPress={() => setShowDatePicker(false)}>
                <View style={styles.datePickerModal}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{t('profile.edit.birthday_label')}</Text>
                    <Pressable onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.doneText}>{t('common.confirm')}</Text>
                    </Pressable>
                  </View>
                  <DateTimePicker
                    value={dateOfBirth || new Date(2000, 0, 1)}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    minimumDate={new Date(1940, 0, 1)}
                  />
                </View>
              </Pressable>
            </Modal>
          ) : (
            <DateTimePicker
              value={dateOfBirth || new Date(2000, 0, 1)}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
              minimumDate={new Date(1940, 0, 1)}
            />
          )
        )}

        {error ? <Text style={[styles.error, isRTL && commonStyles.rtlText]}>{error}</Text> : null}

        <Button
          title={updateProfile.isPending ? t('profile.edit.saving') : t('profile.edit.save')}
          onPress={handleSave}
          loading={updateProfile.isPending}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelRowRTL: {
    flexDirection: 'row-reverse',
  },
  optionalBadge: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
  },
  disabledInput: {
    height: 44,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.input,
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    backgroundColor: colors.secondary.DEFAULT,
  },
  disabledText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
  },
  hint: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
    marginTop: 4,
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
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lockedRowRTL: {
    flexDirection: 'row-reverse',
  },
  lockedHint: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
    marginTop: 6,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: fonts.bold,
    color: colors.foreground,
  },
  datePickerModal: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: spacing[6],
  },
  doneText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.primary.DEFAULT,
  },
});
