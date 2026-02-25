import { LoyaltyTier } from '../types/firestore';

// Deposit rates by loyalty tier (matches website)
export const DEPOSIT_RATES: Record<LoyaltyTier, number> = {
  classic: 50,    // 50% deposit
  prestige: 30,   // 30% deposit  
  black: 0,       // No deposit
};

export const DEFAULT_DEPOSIT_RATE = DEPOSIT_RATES.classic;
