import { LoyaltyTier } from "../types/user";
import { getLoyaltyTiers, type TierConfig } from "../api/endpoints/config";

export interface LoyaltyTierConfig {
  id: LoyaltyTier;
  minSpend: number;
  benefits: {
    freeShipping: boolean;
    discountPercent: number;
    conciergeAccess: boolean;
  };
}

// Hardcoded fallback (used when DB is unreachable)
export const LOYALTY_TIERS: Record<LoyaltyTier, LoyaltyTierConfig> = {
  classic: {
    id: 'classic',
    minSpend: 0,
    benefits: {
      freeShipping: false,
      discountPercent: 0,
      conciergeAccess: false,
    }
  },
  prestige: {
    id: 'prestige',
    minSpend: 3000,
    benefits: {
      freeShipping: true,
      discountPercent: 0,
      conciergeAccess: true,
    }
  },
  black: {
    id: 'black',
    minSpend: 10000,
    benefits: {
      freeShipping: true,
      discountPercent: 0,
      conciergeAccess: true,
    }
  }
};

export const DEFAULT_LOYALTY_TIER: LoyaltyTier = 'classic';

/** Fetch loyalty tiers from centralized config and build LoyaltyTierConfig map. */
export async function fetchLoyaltyTiers(): Promise<Record<LoyaltyTier, LoyaltyTierConfig>> {
  const tiers = await getLoyaltyTiers();
  const result: Record<string, LoyaltyTierConfig> = {};
  for (const [key, config] of Object.entries(tiers)) {
    result[key] = {
      id: key as LoyaltyTier,
      minSpend: config.minSpend,
      benefits: {
        freeShipping: config.freeShipping,
        discountPercent: config.discountPercent,
        conciergeAccess: config.conciergeAccess,
      },
    };
  }
  return result as Record<LoyaltyTier, LoyaltyTierConfig>;
}

/**
 * Determines the loyalty tier based on total spend.
 */
export function calculateLoyaltyTier(totalSpend: number, tiers: Record<LoyaltyTier, LoyaltyTierConfig> = LOYALTY_TIERS): LoyaltyTier {
  if (totalSpend >= tiers.black.minSpend) return 'black';
  if (totalSpend >= tiers.prestige.minSpend) return 'prestige';
  return 'classic';
}

/**
 * Checks if a tier has a specific benefit.
 */
export function hasBenefit(tier: LoyaltyTier, benefit: keyof LoyaltyTierConfig['benefits'], tiers: Record<LoyaltyTier, LoyaltyTierConfig> = LOYALTY_TIERS): boolean {
  return tiers[tier]?.benefits[benefit] === true;
}

export interface LoyaltyProgress {
  nextTier: LoyaltyTier | null;
  spendNeeded: number;
  percentage: number;
}

/**
 * Calculates progress towards the next loyalty tier.
 */
export function getLoyaltyProgress(currentSpend: number, currentTier: LoyaltyTier, tiers: Record<LoyaltyTier, LoyaltyTierConfig> = LOYALTY_TIERS): LoyaltyProgress {
  let nextTier: LoyaltyTier | null = null;
  let spendNeeded = 0;

  if (currentTier === 'classic') {
    nextTier = 'prestige';
    spendNeeded = Math.max(0, tiers.prestige.minSpend - currentSpend);
  } else if (currentTier === 'prestige') {
    nextTier = 'black';
    spendNeeded = Math.max(0, tiers.black.minSpend - currentSpend);
  }

  let percentage = 0;
  if (nextTier) {
    const currentTierMinSpend = tiers[currentTier].minSpend;
    const nextTierMinSpend = tiers[nextTier].minSpend;
    const totalGap = nextTierMinSpend - currentTierMinSpend;
    const progressInGap = currentSpend - currentTierMinSpend;
    percentage = Math.min(100, Math.max(0, (progressInGap / totalGap) * 100));
  }

  return { nextTier, spendNeeded, percentage };
}
