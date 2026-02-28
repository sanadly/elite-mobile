import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Input } from './Input';
import { colors, fonts, radius, commonStyles } from '../../theme';
import { normalizeDigits } from '../../utils/text';

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export function PhoneInput({ value, onChangeText, placeholder, error, label, containerStyle }: PhoneInputProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, isRTL && commonStyles.rtlText]}>{label}</Text>
      )}
      <View style={styles.row}>
        <View style={styles.prefix}>
          <Text style={styles.prefixText}>+218</Text>
        </View>
        <View style={styles.inputWrapper}>
          <Input
            placeholder={placeholder}
            value={value}
            onChangeText={(text) => onChangeText(normalizeDigits(text))}
            keyboardType="number-pad"
            autoComplete="tel"
            maxLength={9}
            textAlign="left"
            style={styles.input}
            error={error}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.foreground,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  prefix: {
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
  prefixText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.foreground,
  },
  inputWrapper: {
    flex: 1,
  },
  input: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
});
