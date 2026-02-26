import React from 'react';
import { View, TextInput, Pressable, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '../../theme';
import { useRTL } from '../../hooks/useRTL';
import { useTranslation } from 'react-i18next';

interface SearchBarProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  /** "button" mode renders a tappable bar that doesn't accept input */
  mode?: 'interactive' | 'button';
  onPress?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  onClear,
  mode = 'interactive',
  onPress,
  ...inputProps
}: SearchBarProps) {
  const { t } = useTranslation();
  const isRTL = useRTL();

  if (mode === 'button') {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.container,
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={t('products.search_placeholder')}
      >
        <Ionicons
          name="search"
          size={18}
          color={colors.muted.foreground}
          style={isRTL ? styles.iconRight : styles.iconLeft}
        />
        <View style={styles.placeholderContainer}>
          <TextInput
            style={[styles.input, isRTL && styles.rtlInput]}
            placeholder={t('products.search_placeholder')}
            placeholderTextColor={colors.muted.foreground}
            editable={false}
            pointerEvents="none"
            textAlign={isRTL ? 'right' : 'left'}
          />
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons
        name="search"
        size={18}
        color={colors.muted.foreground}
        style={isRTL ? styles.iconRight : styles.iconLeft}
      />
      <TextInput
        style={[styles.input, isRTL && styles.rtlInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={t('products.search_placeholder')}
        placeholderTextColor={colors.muted.foreground}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        textAlign={isRTL ? 'right' : 'left'}
        {...inputProps}
      />
      {value.length > 0 && (
        <Pressable
          onPress={onClear}
          style={isRTL ? styles.clearLeft : styles.clearRight}
          hitSlop={8}
          accessibilityLabel={t('common.clear')}
        >
          <Ionicons name="close-circle" size={18} color={colors.muted.foreground} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: colors.muted.DEFAULT,
    borderRadius: radius.lg,
    paddingHorizontal: spacing[3],
  },
  pressed: {
    opacity: 0.7,
  },
  iconLeft: {
    marginRight: spacing[2],
  },
  iconRight: {
    marginLeft: spacing[2],
  },
  placeholderContainer: {
    flex: 1,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.foreground,
    height: 44,
    paddingVertical: 0,
  },
  rtlInput: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  clearRight: {
    marginLeft: spacing[2],
  },
  clearLeft: {
    marginRight: spacing[2],
  },
});
