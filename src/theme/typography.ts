/**
 * Elite Style Typography System
 * Font: Alexandria (Google Font) - supports Arabic & Latin
 *
 * In React Native, custom fonts require using the specific font family
 * name per weight (fontWeight doesn't work with custom fonts).
 * Use `fonts.bold` instead of `fontWeight: '700'`, etc.
 */

export const fonts = {
  light: 'Alexandria_300Light',
  regular: 'Alexandria_400Regular',
  medium: 'Alexandria_500Medium',
  semibold: 'Alexandria_600SemiBold',
  bold: 'Alexandria_700Bold',
} as const;

export const typography = {
  fontFamily: {
    main: 'Alexandria',
    logo: 'KARoseRuzaiq',
    body: 'Alexandria',
    heading: 'Alexandria',
  },

  fonts,

  // Font Sizes (8pt grid)
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export type Typography = typeof typography;
export type Fonts = typeof fonts;
