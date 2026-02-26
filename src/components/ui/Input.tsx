import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fonts, radius, commonStyles } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  loading?: boolean;
}

export function Input({ label, error, hint, loading, style, ...props }: InputProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, isRTL && commonStyles.rtlText]}>
          {label}
        </Text>
      )}

      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            isRTL && styles.rtlInput,
            error && styles.inputError,
            style,
          ]}
          placeholderTextColor={colors.muted.foreground}
          textAlign={isRTL ? 'right' : 'left'}
          writingDirection={isRTL ? 'rtl' : 'ltr'}
          editable={!loading}
          accessibilityLabel={label}
          accessibilityHint={hint}
          accessibilityState={{ disabled: loading }}
          {...props}
        />
        {loading && (
          <View style={[styles.loadingIcon, isRTL && styles.loadingIconRTL]}>
            <ActivityIndicator size="small" color={colors.muted.foreground} />
          </View>
        )}
      </View>

      {error && <Text style={[styles.errorText, isRTL && commonStyles.rtlText]}>{error}</Text>}
      {hint && !error && <Text style={[styles.hintText, isRTL && commonStyles.rtlText]}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 6, // gap-1.5
    marginBottom: 16,
  },
  label: {
    fontSize: 14, // text-sm
    fontFamily: fonts.medium,
    color: colors.foreground,
    lineHeight: 20,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 44, // h-11 exact match to web
    borderWidth: 1,
    borderColor: colors.input,
    borderRadius: radius.lg, // rounded-lg
    paddingHorizontal: 12, // px-3
    paddingVertical: 8, // py-2
    fontSize: 14, // text-sm
    fontFamily: fonts.regular,
    color: colors.foreground,
    backgroundColor: colors.background,
  },
  rtlInput: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  inputError: {
    borderColor: colors.destructive.DEFAULT,
  },
  loadingIcon: {
    position: 'absolute',
    right: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIconRTL: {
    right: undefined,
    left: 12,
  },
  errorText: {
    fontSize: 12, // text-xs
    color: colors.destructive.DEFAULT,
    fontFamily: fonts.medium,
  },
  hintText: {
    fontSize: 12, // text-xs
    color: colors.muted.foreground,
    fontFamily: fonts.regular,
  },
});
