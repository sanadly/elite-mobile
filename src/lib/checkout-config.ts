import { LoyaltyTier } from '../types/user';
import { getDepositRates } from '../api/endpoints/config';

// Hardcoded fallback (used when DB is unreachable)
export const DEPOSIT_RATES: Record<LoyaltyTier, number> = {
  classic: 50,    // 50% deposit
  prestige: 30,   // 30% deposit
  black: 0,       // No deposit
};

export const DEFAULT_DEPOSIT_RATE = DEPOSIT_RATES.classic;

/** Fetch deposit rates from centralized config (Supabase), falls back to hardcoded. */
export { getDepositRates };

/**
 * Rounds a deposit amount UP to the nearest 10.
 * e.g. 13→20, 24→30, 144→150, 189→190
 */
export function roundDepositAmount(amount: number): number {
  if (amount <= 0) return 0;
  return Math.ceil(amount / 10) * 10;
}
