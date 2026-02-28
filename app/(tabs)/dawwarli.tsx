import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ActionSheetIOS,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Input } from '../../src/components/ui';
import { useAuthStore } from '../../src/store/authStore';
import { useRTL } from '../../src/hooks/useRTL';
import { useToast } from '../../src/hooks/useToast';
import { colors, fonts, radius, commonStyles } from '../../src/theme';
import { normalizeDigits } from '../../src/utils/text';
import {
  uploadSourcingImage,
  submitSourcingRequest,
  type BudgetRange,
} from '../../src/api/endpoints/sourcing';

const BUDGET_OPTIONS: BudgetRange[] = [
  'no_budget',
  'under_100',
  '100_200',
  '200_500',
  '500_1000',
  'over_1000',
];

const CITY_OPTIONS = ['tripoli', 'benghazi', 'misrata', 'other'] as const;

const CITY_VALUE_MAP: Record<string, string> = {
  tripoli: 'طرابلس',
  benghazi: 'بنغازي',
  misrata: 'مصراتة',
};

const stripPhonePrefix = (phone: string): string =>
  phone.replace(/^\+218/, '');

const formSchema = z.object({
  customerName: z.string().min(1).min(2),
  customerPhone: z.string().min(1).regex(/^9[0-9]{8}$/),
  cityKey: z.string().min(1),
  otherCity: z.string().optional(),
  description: z.string().max(2000).optional(),
  productLink: z.string().optional(),
  budgetRange: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function DawwarliScreen() {
  const { t } = useTranslation();
  const isRTL = useRTL();
  const insets = useSafeAreaInsets();
  const { userData } = useAuthStore();
  const toast = useToast();

  const isLoggedIn = !!userData;

  const [images, setImages] = useState<{ uri: string; uploading: boolean; url?: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ requestNumber: string } | null>(null);

  const schema = useMemo(
    () =>
      isLoggedIn
        ? z.object({
            customerName: z.string().optional(),
            customerPhone: z.string().optional(),
            cityKey: z.string().optional(),
            otherCity: z.string().optional(),
            description: z.string().max(2000).optional(),
            productLink: z.string().optional(),
            budgetRange: z.string().optional(),
            notes: z.string().max(1000).optional(),
          })
        : z.object({
            customerName: z
              .string()
              .min(1, t('dawwarli.errors.name_required'))
              .min(2, t('dawwarli.errors.name_min')),
            customerPhone: z
              .string()
              .min(1, t('dawwarli.errors.phone_required'))
              .regex(/^9[0-9]{8}$/, t('dawwarli.errors.phone_invalid')),
            cityKey: z.string().min(1, t('dawwarli.errors.city_required')),
            otherCity: z.string().optional(),
            description: z.string().max(2000).optional(),
            productLink: z.string().optional(),
            budgetRange: z.string().optional(),
            notes: z.string().max(1000).optional(),
          }),
    [t, isLoggedIn]
  );

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      customerName: userData?.name || '',
      customerPhone: stripPhonePrefix(userData?.phone || ''),
      cityKey: userData?.city
        ? Object.entries(CITY_VALUE_MAP).find(([, v]) => v === userData.city)?.[0] || 'other'
        : '',
      otherCity:
        userData?.city && !Object.values(CITY_VALUE_MAP).includes(userData.city)
          ? userData.city
          : '',
      description: '',
      productLink: '',
      budgetRange: '',
      notes: '',
    },
  });

  const selectedCity = watch('cityKey');

  const pickImages = async (source: 'camera' | 'gallery') => {
    if (images.length >= 4) {
      toast.warning(t('dawwarli.errors.images_max'));
      return;
    }

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: source === 'gallery',
      selectionLimit: 4 - images.length,
    };

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

    if (result.canceled) return;

    const newImages = result.assets.slice(0, 4 - images.length).map((asset) => ({
      uri: asset.uri,
      uploading: true,
      url: undefined as string | undefined,
    }));

    setImages((prev) => [...prev, ...newImages]);

    for (let i = 0; i < newImages.length; i++) {
      try {
        const url = await uploadSourcingImage(newImages[i].uri);
        setImages((prev) =>
          prev.map((img) =>
            img.uri === newImages[i].uri ? { ...img, uploading: false, url } : img
          )
        );
      } catch {
        toast.error(t('dawwarli.errors.upload_failed'));
        setImages((prev) => prev.filter((img) => img.uri !== newImages[i].uri));
      }
    }
  };

  const showImageSourcePicker = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            t('common.cancel'),
            t('dawwarli.form.images_camera'),
            t('dawwarli.form.images_gallery'),
          ],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) pickImages('camera');
          if (buttonIndex === 2) pickImages('gallery');
        }
      );
    } else {
      Alert.alert(t('dawwarli.form.images_add'), '', [
        { text: t('dawwarli.form.images_camera'), onPress: () => pickImages('camera') },
        { text: t('dawwarli.form.images_gallery'), onPress: () => pickImages('gallery') },
        { text: t('common.cancel'), style: 'cancel' },
      ]);
    }
  };

  const removeImage = (uri: string) => {
    setImages((prev) => prev.filter((img) => img.uri !== uri));
  };

  const onSubmit = async (data: Record<string, any>) => {
    const uploadedUrls = images.filter((img) => img.url).map((img) => img.url!);

    if (uploadedUrls.length === 0) {
      toast.error(t('dawwarli.errors.images_required'));
      return;
    }

    if (!isLoggedIn && data.cityKey === 'other' && !data.otherCity?.trim()) {
      toast.error(t('dawwarli.errors.city_required'));
      return;
    }

    const anyUploading = images.some((img) => img.uploading);
    if (anyUploading) return;

    setIsSubmitting(true);

    let customerName: string;
    let customerPhone: string;
    let customerCity: string;

    if (isLoggedIn) {
      customerName = userData.name || '';
      customerPhone = stripPhonePrefix(userData.phone || '');
      customerCity = userData.city || '';
    } else {
      customerName = data.customerName?.trim() || '';
      customerPhone = normalizeDigits(data.customerPhone || '');
      customerCity =
        data.cityKey === 'other'
          ? data.otherCity!.trim()
          : CITY_VALUE_MAP[data.cityKey || ''] || data.cityKey || '';
    }

    const result = await submitSourcingRequest({
      customerName,
      customerPhone,
      customerCity,
      description: data.description?.trim() || undefined,
      productLink: data.productLink?.trim() || undefined,
      budgetRange: (data.budgetRange as BudgetRange) || undefined,
      notes: data.notes?.trim() || undefined,
      imageUrls: uploadedUrls,
    });

    setIsSubmitting(false);

    if (result.success) {
      setSuccessData({ requestNumber: result.requestNumber });
    } else {
      toast.error(t('dawwarli.errors.submit_failed'));
    }
  };

  const resetForm = () => {
    setSuccessData(null);
    setImages([]);
    reset();
  };

  const anyUploading = images.some((img) => img.uploading);

  // ── Success State ──
  if (successData) {
    return (
      <View style={[styles.successContainer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.successIconBg}>
          <Ionicons name="checkmark" size={40} color="#fff" />
        </View>
        <Text style={[styles.successTitle, isRTL && commonStyles.rtlText]}>
          {t('dawwarli.success.title')}
        </Text>
        <Text style={[styles.successLabel, isRTL && commonStyles.rtlText]}>
          {t('dawwarli.success.request_number')}
        </Text>
        <View style={styles.requestNumberBadge}>
          <Text style={styles.requestNumber}>{successData.requestNumber}</Text>
        </View>
        <Text style={[styles.successMessage, isRTL && commonStyles.rtlText]}>
          {t('dawwarli.success.message')}
        </Text>
        <Button
          title={t('dawwarli.success.new_request')}
          onPress={resetForm}
          variant="primary"
          style={styles.newRequestBtn}
        />
      </View>
    );
  }

  // ── Form ──
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Header ── */}
        <View style={styles.hero}>
          <View style={styles.heroIconBg}>
            <Ionicons name="search" size={24} color={colors.primary.foreground} />
          </View>
          <Text style={[styles.heroTitle, isRTL && commonStyles.rtlText]}>
            {t('dawwarli.title')}
          </Text>
          <Text style={[styles.heroSubtitle, isRTL && commonStyles.rtlText]}>
            {t('dawwarli.subtitle')}
          </Text>
        </View>

        {/* ── How It Works ── */}
        <View style={[styles.stepsRow, isRTL && styles.stepsRowRTL]}>
          {[
            { icon: 'camera-outline' as const, step: 'step1' },
            { icon: 'globe-outline' as const, step: 'step2' },
            { icon: 'bag-check-outline' as const, step: 'step3' },
          ].map((item, idx) => (
            <React.Fragment key={item.step}>
              {idx > 0 && (
                <View style={styles.stepArrow}>
                  <Ionicons
                    name={isRTL ? 'arrow-back' : 'arrow-forward'}
                    size={14}
                    color={colors.border}
                  />
                </View>
              )}
              <View style={styles.stepItem}>
                <View style={styles.stepIconBg}>
                  <Ionicons name={item.icon} size={18} color={colors.primary.DEFAULT} />
                </View>
                <Text style={[styles.stepTitle, isRTL && commonStyles.rtlText]}>
                  {t(`dawwarli.how_it_works.step${idx + 1}_title`)}
                </Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* ── Image Upload Card ── */}
        <View style={styles.card}>
          <Text style={[styles.cardLabel, isRTL && commonStyles.rtlText]}>
            {t('dawwarli.form.images')} *
          </Text>

          {images.length === 0 ? (
            <Pressable style={styles.uploadArea} onPress={showImageSourcePicker}>
              <View style={styles.uploadIconBg}>
                <Ionicons name="cloud-upload-outline" size={32} color={colors.primary.DEFAULT} />
              </View>
              <Text style={[styles.uploadTitle, isRTL && commonStyles.rtlText]}>
                {t('dawwarli.form.images_add')}
              </Text>
              <Text style={[styles.uploadHint, isRTL && commonStyles.rtlText]}>
                {t('dawwarli.form.images_hint')}
              </Text>
            </Pressable>
          ) : (
            <View style={[styles.imageGrid, isRTL && styles.imageGridRTL]}>
              {images.map((img) => (
                <View key={img.uri} style={styles.imageThumb}>
                  <Image source={{ uri: img.uri }} style={styles.thumbImage} />
                  {img.uploading && (
                    <View style={styles.imageOverlay}>
                      <ActivityIndicator color="#fff" />
                    </View>
                  )}
                  <Pressable
                    style={[styles.removeBtn, isRTL && styles.removeBtnRTL]}
                    onPress={() => removeImage(img.uri)}
                    hitSlop={8}
                  >
                    <Ionicons name="close-circle" size={22} color={colors.destructive.DEFAULT} />
                  </Pressable>
                </View>
              ))}

              {images.length < 4 && (
                <Pressable style={styles.addImageBtn} onPress={showImageSourcePicker}>
                  <Ionicons name="add" size={24} color={colors.primary.DEFAULT} />
                </Pressable>
              )}
            </View>
          )}
        </View>

        {/* ── Product Details Card ── */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, isRTL && commonStyles.rtlText]}>
            {t('dawwarli.form.description')}
          </Text>

          <Controller
            control={control}
            name="productLink"
            render={({ field: { onChange, value } }) => (
              <Input
                label={t('dawwarli.form.product_link')}
                placeholder={t('dawwarli.form.product_link_placeholder')}
                value={value}
                onChangeText={onChange}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder={t('dawwarli.form.description_placeholder')}
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={3}
                style={styles.textArea}
              />
            )}
          />

          {/* Budget Range */}
          <Text style={[styles.label, isRTL && commonStyles.rtlText]}>
            {t('dawwarli.form.budget_range')}
          </Text>
          <Controller
            control={control}
            name="budgetRange"
            render={({ field: { onChange, value } }) => (
              <View style={[styles.chipRow, isRTL && styles.chipRowRTL]}>
                {BUDGET_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt}
                    style={[styles.chip, value === opt && styles.chipActive]}
                    onPress={() => onChange(value === opt ? '' : opt)}
                  >
                    <Text
                      style={[styles.chipText, value === opt && styles.chipTextActive]}
                    >
                      {t(`dawwarli.budget.${opt}`)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          />
        </View>

        {/* ── Contact Info Card (only for guests) ── */}
        {!isLoggedIn && (
          <View style={styles.card}>
            <Text style={[styles.cardTitle, isRTL && commonStyles.rtlText]}>
              {t('dawwarli.form.customer_name')}
            </Text>

            <Controller
              control={control}
              name="customerName"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={`${t('dawwarli.form.customer_name')} *`}
                  placeholder={t('dawwarli.form.customer_name_placeholder')}
                  value={value}
                  onChangeText={onChange}
                  error={errors.customerName?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="customerPhone"
              render={({ field: { onChange, value } }) => (
                <View style={{ marginBottom: 16 }}>
                  <Text style={[styles.label, isRTL && commonStyles.rtlText]}>
                    {t('dawwarli.form.phone')} *
                  </Text>
                  <View style={[styles.phoneRow, isRTL && styles.phoneRowRTL]}>
                    <View style={styles.phonePrefix}>
                      <Text style={styles.phonePrefixText}>218+</Text>
                    </View>
                    <Input
                      placeholder={t('dawwarli.form.phone_placeholder')}
                      value={value}
                      onChangeText={(text) => onChange(normalizeDigits(text))}
                      keyboardType="phone-pad"
                      containerStyle={styles.phoneInput}
                      error={errors.customerPhone?.message}
                      style={{ textAlign: 'left', writingDirection: 'ltr' }}
                    />
                  </View>
                </View>
              )}
            />

            <Text style={[styles.label, isRTL && commonStyles.rtlText]}>
              {t('dawwarli.form.city')} *
            </Text>
            <Controller
              control={control}
              name="cityKey"
              render={({ field: { onChange, value } }) => (
                <View>
                  <View style={[styles.chipRow, isRTL && styles.chipRowRTL]}>
                    {CITY_OPTIONS.map((opt) => (
                      <Pressable
                        key={opt}
                        style={[styles.chip, value === opt && styles.chipActive]}
                        onPress={() => onChange(value === opt ? '' : opt)}
                      >
                        <Text
                          style={[styles.chipText, value === opt && styles.chipTextActive]}
                        >
                          {t(`dawwarli.cities.${opt}`)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  {errors.cityKey && (
                    <Text style={[styles.errorText, isRTL && commonStyles.rtlText]}>
                      {errors.cityKey.message}
                    </Text>
                  )}
                </View>
              )}
            />

            {selectedCity === 'other' && (
              <Controller
                control={control}
                name="otherCity"
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder={t('dawwarli.form.city_other_placeholder')}
                    value={value}
                    onChangeText={onChange}
                    containerStyle={{ marginTop: 8 }}
                  />
                )}
              />
            )}
          </View>
        )}

        {/* ── Notes ── */}
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, value } }) => (
            <Input
              label={t('dawwarli.form.notes')}
              placeholder={t('dawwarli.form.notes_placeholder')}
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={2}
              style={styles.textArea}
            />
          )}
        />

        {/* ── Submit ── */}
        <Button
          title={isSubmitting ? t('dawwarli.form.submitting') : t('dawwarli.form.submit')}
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          disabled={isSubmitting || anyUploading}
          size="lg"
          style={styles.submitBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const IMAGE_SIZE = 88;

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.muted.DEFAULT },
  scrollContent: {
    padding: 16,
    gap: 12,
  },

  // Hero
  hero: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  heroIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: colors.foreground,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Steps
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    padding: 16,
  },
  stepsRowRTL: {
    flexDirection: 'row-reverse',
  },
  stepArrow: {
    paddingHorizontal: 4,
    paddingTop: 2,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  stepIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.muted.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.muted.foreground,
    textAlign: 'center',
  },

  // Card
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    padding: 16,
  },
  cardLabel: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.foreground,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.foreground,
    marginBottom: 12,
  },

  // Upload area (empty state)
  uploadArea: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.muted.DEFAULT + '40',
  },
  uploadIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.muted.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  uploadTitle: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.foreground,
  },
  uploadHint: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Images
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  imageGridRTL: {
    flexDirection: 'row-reverse',
  },
  imageThumb: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtn: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.background,
    borderRadius: 11,
  },
  removeBtnRTL: {
    right: undefined,
    left: -2,
  },
  addImageBtn: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.primary.DEFAULT + '40',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.muted.DEFAULT + '40',
  },

  // Labels
  label: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.foreground,
    marginBottom: 6,
  },

  // Chips
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chipRowRTL: {
    flexDirection: 'row-reverse',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipActive: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.primary.DEFAULT,
  },
  chipText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.foreground,
  },
  chipTextActive: {
    color: colors.primary.foreground,
  },

  // Phone
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  phoneRowRTL: {
    flexDirection: 'row-reverse',
  },
  phonePrefix: {
    height: 44,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.input,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.muted.DEFAULT,
  },
  phonePrefixText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.foreground,
  },
  phoneInput: {
    flex: 1,
    marginBottom: 0,
  },

  // Text area
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },

  // Submit
  submitBtn: {
    marginTop: 4,
  },

  // Error
  errorText: {
    fontSize: 12,
    color: colors.destructive.DEFAULT,
    fontFamily: fonts.medium,
    marginTop: 4,
  },

  // Success
  successContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.status.success.text,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: colors.foreground,
    marginBottom: 12,
  },
  successLabel: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
    marginBottom: 8,
  },
  requestNumberBadge: {
    backgroundColor: colors.muted.DEFAULT,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radius.lg,
    marginBottom: 20,
  },
  requestNumber: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.primary.DEFAULT,
    writingDirection: 'ltr',
  },
  successMessage: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 16,
  },
  newRequestBtn: {
    minWidth: 220,
  },
});
