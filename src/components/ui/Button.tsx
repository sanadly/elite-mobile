import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors, fonts, radius } from '../../theme';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        styles.base,
        styles[variant],
        styles[size],
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <Animated.View style={animatedStyle}>
        {loading ? (
          <ActivityIndicator
            color={variant === 'outline' || variant === 'ghost' ? colors.primary.DEFAULT : colors.primary.foreground}
            size="small"
          />
        ) : (
          <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`], textStyle]}>
            {title}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md, // rounded-md like web
  },

  // Variants - exact match to web
  primary: {
    backgroundColor: colors.primary.DEFAULT,
  },
  secondary: {
    backgroundColor: colors.secondary.DEFAULT,
  },
  outline: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.input,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  destructive: {
    backgroundColor: colors.destructive.DEFAULT,
  },

  // Sizes - exact pixel match to web (h-9=36px, h-11=44px, h-12=48px)
  sm: {
    height: 36,
    paddingHorizontal: 12, // px-3
  },
  md: {
    height: 44,
    paddingHorizontal: 24, // px-6
    paddingVertical: 8,
  },
  lg: {
    height: 48,
    paddingHorizontal: 32, // px-8
  },

  // States
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.5,
  },

  // Text styles - exact font sizes from web
  text: {
    fontFamily: fonts.medium,
    textAlign: 'center',
  },
  primaryText: {
    color: colors.primary.foreground,
  },
  secondaryText: {
    color: colors.secondary.foreground,
  },
  outlineText: {
    color: colors.foreground,
  },
  ghostText: {
    color: colors.foreground,
  },
  destructiveText: {
    color: colors.destructive.foreground,
  },
  smText: {
    fontSize: 12, // text-xs
  },
  mdText: {
    fontSize: 14, // text-sm
  },
  lgText: {
    fontSize: 16, // text-base
  },
});
