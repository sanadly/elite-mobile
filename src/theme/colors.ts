/**
 * Elite Style Brand Colors
 * Migrated from web app (globals.css)
 */

export const colors = {
  // Primary Brand Color (Navy Blue)
  primary: {
    DEFAULT: '#012856',
    foreground: '#ffffff',
  },

  // Secondary
  secondary: {
    DEFAULT: '#E1E0E7',
    foreground: '#012856',
  },

  // Background & Foreground
  background: '#ffffff',
  foreground: '#09090b',

  // Card
  card: {
    DEFAULT: '#ffffff',
    foreground: '#09090b',
  },

  // Muted (Subtle backgrounds)
  muted: {
    DEFAULT: '#F0F4FA',
    foreground: '#475569',
  },

  // Accent
  accent: {
    DEFAULT: '#E1E0E7',
    foreground: '#012856',
  },

  // Destructive (Errors)
  destructive: {
    DEFAULT: '#ef4444',
    foreground: '#fafafa',
  },

  // Borders & Inputs
  border: '#CDD5E0',
  input: '#CDD5E0',
  ring: '#012856',

  // Status Colors
  status: {
    pending: {
      bg: '#F1F5F9',
      text: '#475569',
    },
    success: {
      bg: '#effcf5',
      text: '#15803d',
    },
    warning: {
      bg: '#fff7ed',
      text: '#c2410c',
    },
    error: {
      bg: '#fef2f2',
      text: '#b91c1c',
    },
  },

  // Luxury Palette
  luxury: {
    offWhite: '#FAFAF9',
    charcoal: '#1F2937',
    navySubtle: '#012856',
    accentSubtle: '#E8F4F8',
    successMinimal: '#10B981',
    borderSubtle: '#E5E7EB',
  },

  // Loyalty Tiers (from web app loyalty system)
  tier: {
    classic: '#94A3B8',   // Slate gray
    prestige: '#F59E0B',  // Gold
    black: '#0F172A',     // Deep black
  },
} as const;

export type ColorTheme = typeof colors;
