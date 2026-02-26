import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { useRTL } from '../../hooks/useRTL';

interface RowProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Gap between items in pixels */
  gap?: number;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
}

/**
 * A flexDirection row that auto-reverses in RTL (Arabic) mode.
 * Replaces the repetitive `[styles.row, isRTL && commonStyles.rowReverse]` pattern.
 */
export function Row({ children, style, gap, align = 'center', justify }: RowProps) {
  const isRTL = useRTL();

  return (
    <View
      style={[
        {
          flexDirection: isRTL ? 'row-reverse' : 'row',
          alignItems: align,
          justifyContent: justify,
        },
        gap !== undefined && { gap },
        style,
      ]}
    >
      {children}
    </View>
  );
}
