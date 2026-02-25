import { LoyaltyTier } from "@/types/firestore";

export interface LoyaltyTierConfig {
  id: LoyaltyTier;
  minSpend: number;
  benefits: {
    freeShipping: boolean;
    discountPercent: number;
    conciergeAccess: boolean;
  };
}

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

/**
 * Determines the loyalty tier based on total spend.
 * This logic should be kept in sync with the database RPC (create_order_v1).
 */
export function calculateLoyaltyTier(totalSpend: number): LoyaltyTier {
  if (totalSpend >= LOYALTY_TIERS.black.minSpend) return 'black';
  if (totalSpend >= LOYALTY_TIERS.prestige.minSpend) return 'prestige';
  return 'classic';
}

/**
 * Checks if a tier has a specific benefit.
 */
export function hasBenefit(tier: LoyaltyTier, benefit: keyof LoyaltyTierConfig['benefits']): boolean {
  return LOYALTY_TIERS[tier]?.benefits[benefit] === true;
}

export interface LoyaltyProgress {
  nextTier: LoyaltyTier | null;
  spendNeeded: number;
  percentage: number;
}

/**
 * Calculates progress towards the next loyalty tier.
 */
export function getLoyaltyProgress(currentSpend: number, currentTier: LoyaltyTier): LoyaltyProgress {
  let nextTier: LoyaltyTier | null = null;
  let spendNeeded = 0;

  if (currentTier === 'classic') {
    nextTier = 'prestige';
    spendNeeded = Math.max(0, LOYALTY_TIERS.prestige.minSpend - currentSpend);
  } else if (currentTier === 'prestige') {
    nextTier = 'black';
    spendNeeded = Math.max(0, LOYALTY_TIERS.black.minSpend - currentSpend);
  }

  // Calculate percentage (0-100) if there is a next tier
  let percentage = 0;
  if (nextTier) {
    const currentTierMinSpend = LOYALTY_TIERS[currentTier].minSpend;
    const nextTierMinSpend = LOYALTY_TIERS[nextTier].minSpend;
    const totalGap = nextTierMinSpend - currentTierMinSpend;
    const progressInGap = currentSpend - currentTierMinSpend;
    
    // logic check: if spend is somehow less than minSpend of current tier, treat as 0 progress
    // if spend > next tier (shouldn't happen if tier logic is correct), treat as 100
    percentage = Math.min(100, Math.max(0, (progressInGap / totalGap) * 100));
  }

  return {
    nextTier,
    spendNeeded,
    percentage
  };
}
