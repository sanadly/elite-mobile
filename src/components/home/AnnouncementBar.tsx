import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, I18nManager } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, fonts, spacing, typography } from '../../theme';

const ANNOUNCEMENTS = [
  { key: 'announcement.delivery', icon: 'car-outline' as const },
  { key: 'announcement.authentic', icon: 'shield-checkmark-outline' as const },
  { key: 'announcement.exchange', icon: 'swap-horizontal-outline' as const },
  { key: 'announcement.support', icon: 'headset-outline' as const },
] as const;

const ROTATE_INTERVAL = 4000;

export function AnnouncementBar() {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const isRTL = I18nManager.isRTL;

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, ROTATE_INTERVAL);
    return () => clearInterval(interval);
  }, [visible]);

  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  if (!visible) return null;

  const notice = ANNOUNCEMENTS[currentIndex];

  return (
    <View style={styles.container}>
      <Animated.View
        key={currentIndex}
        entering={FadeInDown.duration(300)}
        exiting={FadeOutUp.duration(300)}
        style={[styles.content, isRTL && styles.contentRTL]}
      >
        <Ionicons
          name={notice.icon}
          size={14}
          color={colors.primary.DEFAULT}
          style={styles.icon}
        />
        <Text style={[styles.text, isRTL && styles.textRTL]}>
          {t(notice.key)}
        </Text>
      </Animated.View>
      <TouchableOpacity
        onPress={handleClose}
        style={[styles.closeButton, isRTL && styles.closeButtonRTL]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close" size={16} color={`${colors.primary.DEFAULT}66`} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAFAF9',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F4',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    position: 'absolute',
  },
  contentRTL: {
    flexDirection: 'row-reverse',
  },
  icon: {
    opacity: 0.8,
  },
  text: {
    fontSize: typography.fontSize.xs,
    fontFamily: fonts.medium,
    color: colors.primary.DEFAULT,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  textRTL: {
    writingDirection: 'rtl',
  },
  closeButton: {
    position: 'absolute',
    right: spacing[4],
    top: '50%',
    transform: [{ translateY: -8 }],
  },
  closeButtonRTL: {
    right: undefined,
    left: spacing[4],
  },
});
