import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, AuthLanguageToggle } from '../../src/components/ui';
import { colors, typography, fonts, spacing, radius } from '../../src/theme';
import { supabase } from '../../src/api/supabase';

interface City {
  id: string;
  city_name: string;
}

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [showCityPicker, setShowCityPicker] = useState(false);

  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const insets = useSafeAreaInsets();

  const normalizeDigits = (text: string): string => {
    // Convert Arabic-Indic numerals (٠١٢٣٤٥٦٧٨٩) to Latin (0123456789)
    const latinized = text.replace(/[٠-٩]/g, (d) =>
      String.fromCharCode(d.charCodeAt(0) - 0x0660 + 0x0030)
    );
    return latinized.replace(/[^0-9]/g, '');
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('courier_fees')
        .select('id, city_name');
      if (!error && data) {
        setCities(data as City[]);
      }
    } catch {
      // Cities fetch failed silently - user can still type city name
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

  const handleRegister = async () => {
    if (!name || !email || !phone || !city || !password) {
      setError(t('auth.register.error.validation'));
      return;
    }

    // Validate Libyan phone: 9 digits starting with 9
    if (!/^9[0-9]{8}$/.test(phone)) {
      setError(t('auth.register.error.invalid_phone'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.register.error.passwords_mismatch'));
      return;
    }

    if (password.length < 8) {
      setError(t('auth.register.error.weak_password'));
      return;
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasUppercase || !hasLowercase || !hasNumber) {
      setError(t('auth.register.error.password_complexity'));
      return;
    }

    setLoading(true);
    setError('');

    const fullPhoneNumber = `+218${phone}`;

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone: fullPhoneNumber,
            city,
            birthday: dateOfBirth ? format(dateOfBirth, 'yyyy-MM-dd') : null,
          },
        },
      });

      if (signUpError) throw signUpError;

      setSuccess(true);
    } catch (err: any) {
      if (err.message?.includes('already registered')) {
        setError(t('auth.register.error.email_exists'));
      } else {
        setError(err.message || t('auth.register.error.network'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successTitle}>{t('auth.register.success')}</Text>
          <Text style={styles.successText}>
            {t('auth.register.success')}
          </Text>
          <Button
            title={t('auth.register.sign_in')}
            onPress={() => router.replace('/(auth)/login')}
            size="lg"
            style={styles.primaryButton}
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing[4] }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topBar}>
          <AuthLanguageToggle />
        </View>

        <View style={styles.header}>
          <Image
            source={require('../../assets/images/logo/header-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>{t('auth.register.subtitle')}</Text>
        </View>

        <View style={styles.form}>
          {/* Name */}
          <Input
            label={t('auth.register.name_label')}
            placeholder={t('auth.register.name_placeholder')}
            value={name}
            onChangeText={setName}
            autoComplete="name"
          />

          {/* Email */}
          <Input
            label={t('auth.register.email_label')}
            placeholder={t('auth.register.email_placeholder')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          {/* Phone with +218 prefix - always LTR */}
          <View style={styles.phoneFieldContainer}>
            <Text style={[styles.label, isRTL && styles.rtlText]}>{t('auth.register.phone_label')}</Text>
            <View style={styles.phoneRow}>
              <View style={styles.phonePrefix}>
                <Text style={styles.phonePrefixText}>+218</Text>
              </View>
              <View style={styles.phoneInputWrapper}>
                <Input
                  placeholder={t('auth.register.phone_placeholder')}
                  value={phone}
                  onChangeText={(text) => setPhone(normalizeDigits(text))}
                  keyboardType="number-pad"
                  autoComplete="tel"
                  maxLength={9}
                  textAlign="left"
                  writingDirection="ltr"
                  style={styles.phoneInput}
                />
              </View>
            </View>
          </View>

          {/* City Picker */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, isRTL && styles.rtlText]}>{t('auth.register.city_label')}</Text>
            <Pressable
              style={[styles.pickerButton, isRTL && styles.pickerButtonRTL]}
              onPress={() => setShowCityPicker(true)}
            >
              <Text style={[styles.pickerText, !city && styles.pickerPlaceholder, isRTL && styles.rtlText]}>
                {city || t('auth.register.city_placeholder')}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.muted.foreground} />
            </Pressable>
          </View>

          {/* City Picker Modal */}
          <Modal
            visible={showCityPicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowCityPicker(false)}
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setShowCityPicker(false)}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{t('auth.register.city_label')}</Text>
                  <Pressable onPress={() => setShowCityPicker(false)}>
                    <Ionicons name="close" size={24} color={colors.foreground} />
                  </Pressable>
                </View>
                <FlatList
                  data={cities}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <Pressable
                      style={[
                        styles.cityItem,
                        city === item.city_name && styles.cityItemSelected,
                      ]}
                      onPress={() => {
                        setCity(item.city_name);
                        setShowCityPicker(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.cityItemText,
                          city === item.city_name && styles.cityItemTextSelected,
                        ]}
                      >
                        {item.city_name}
                      </Text>
                      {city === item.city_name && (
                        <Ionicons name="checkmark" size={20} color={colors.primary.DEFAULT} />
                      )}
                    </Pressable>
                  )}
                />
              </View>
            </Pressable>
          </Modal>

          {/* Date of Birth (Optional) */}
          <View style={styles.fieldContainer}>
            <View style={[styles.labelRow, isRTL && styles.labelRowRTL]}>
              <Text style={[styles.label, isRTL && styles.rtlText]}>{t('auth.register.dob_label')}</Text>
              <Text style={styles.optionalBadge}>{t('common.optional')}</Text>
            </View>
            <View style={[styles.birthdayIncentive, isRTL && styles.birthdayIncentiveRTL]}>
              <Ionicons name="gift-outline" size={16} color="#d97706" />
              <Text style={[styles.birthdayIncentiveText, isRTL && styles.rtlText]}>
                {t('auth.register.birthday_incentive')}
              </Text>
            </View>
            <Pressable
              style={[styles.pickerButton, isRTL && styles.pickerButtonRTL]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.pickerText, !dateOfBirth && styles.pickerPlaceholder, isRTL && styles.rtlText]}>
                {dateOfBirth ? format(dateOfBirth, 'yyyy-MM-dd') : t('auth.register.dob_placeholder')}
              </Text>
              <Ionicons name="calendar-outline" size={18} color={colors.muted.foreground} />
            </Pressable>
          </View>

          {/* Date Picker */}
          {showDatePicker && (
            Platform.OS === 'ios' ? (
              <Modal transparent animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setShowDatePicker(false)}>
                  <View style={styles.datePickerModal}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>{t('auth.register.dob_label')}</Text>
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

          {/* Password */}
          <Input
            label={t('auth.register.password_label')}
            placeholder={t('auth.register.password_placeholder')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password-new"
          />

          {/* Confirm Password */}
          <Input
            label={t('auth.register.confirm_label')}
            placeholder={t('auth.register.confirm_placeholder')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoComplete="password-new"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            title={loading ? t('auth.register.loading') : t('auth.register.submit')}
            onPress={handleRegister}
            loading={loading}
            size="lg"
            style={styles.primaryButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('common.or') || 'or'}</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title={t('auth.register.have_account')}
            onPress={() => router.back()}
            variant="outline"
            size="lg"
          />

          <View style={styles.bottomSpacer} />
        </View>
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
    flexGrow: 1,
    padding: spacing[6],
  },
  topBar: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  logo: {
    width: 180,
    height: 60,
    marginBottom: spacing[3],
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
  },
  form: {
    width: '100%',
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
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
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
  birthdayIncentive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fffbeb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#fde68a40',
    marginBottom: 8,
  },
  birthdayIncentiveRTL: {
    flexDirection: 'row-reverse',
  },
  birthdayIncentiveText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: '#92400e',
    flex: 1,
  },
  primaryButton: {
    marginTop: spacing[2],
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing[5],
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
    marginHorizontal: spacing[4],
  },
  bottomSpacer: {
    height: spacing[8],
  },
  error: {
    color: colors.destructive.DEFAULT,
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.regular,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  successTitle: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: fonts.bold,
    color: colors.primary.DEFAULT,
    marginBottom: spacing[4],
    textAlign: 'center',
  },
  successText: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.regular,
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: spacing[8],
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    paddingBottom: spacing[6],
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
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing[4],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  cityItemSelected: {
    backgroundColor: `${colors.primary.DEFAULT}10`,
  },
  cityItemText: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.foreground,
  },
  cityItemTextSelected: {
    fontFamily: fonts.bold,
    color: colors.primary.DEFAULT,
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
