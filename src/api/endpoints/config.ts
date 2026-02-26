import { supabase } from '../supabase';
import { LoyaltyTier } from '../../types/user';

// ── Hardcoded fallbacks (used when DB is unreachable) ──────────────────

const FALLBACK_DEPOSIT_RATES: Record<LoyaltyTier, number> = {
  classic: 50,
  prestige: 30,
  black: 0,
};

interface TierConfig {
  minSpend: number;
  freeShipping: boolean;
  discountPercent: number;
  conciergeAccess: boolean;
}

const FALLBACK_LOYALTY_TIERS: Record<LoyaltyTier, TierConfig> = {
  classic:  { minSpend: 0,     freeShipping: false, discountPercent: 0, conciergeAccess: false },
  prestige: { minSpend: 3000,  freeShipping: true,  discountPercent: 0, conciergeAccess: true },
  black:    { minSpend: 10000, freeShipping: true,  discountPercent: 0, conciergeAccess: true },
};

// ── In-memory cache (one fetch per app session) ────────────────────────

let cachedConfig: Record<string, unknown> | null = null;

async function fetchAllConfig(): Promise<Record<string, unknown>> {
  if (cachedConfig) return cachedConfig;

  try {
    const { data, error } = await supabase
      .from('app_config')
      .select('key, value');

    if (error || !data) {
      console.warn('[AppConfig] Failed to fetch config, using fallbacks:', error?.message);
      return {};
    }

    const config: Record<string, unknown> = {};
    for (const row of data) {
      config[row.key] = row.value;
    }
    cachedConfig = config;
    return config;
  } catch (err) {
    console.warn('[AppConfig] Config fetch error, using fallbacks:', err);
    return {};
  }
}

/** Force re-fetch on next access (e.g. after pull-to-refresh) */
export function invalidateConfigCache() {
  cachedConfig = null;
}

// ── Public getters ─────────────────────────────────────────────────────

export async function getDepositRates(): Promise<Record<LoyaltyTier, number>> {
  const config = await fetchAllConfig();
  const rates = config.deposit_rates as Record<string, number> | undefined;
  if (rates && typeof rates.classic === 'number') {
    return rates as Record<LoyaltyTier, number>;
  }
  return FALLBACK_DEPOSIT_RATES;
}

export async function getLoyaltyTiers(): Promise<Record<LoyaltyTier, TierConfig>> {
  const config = await fetchAllConfig();
  const tiers = config.loyalty_tiers as Record<string, TierConfig> | undefined;
  if (tiers && tiers.classic) {
    return tiers as Record<LoyaltyTier, TierConfig>;
  }
  return FALLBACK_LOYALTY_TIERS;
}

export type { TierConfig };
