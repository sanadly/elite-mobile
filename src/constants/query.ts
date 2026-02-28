export const STALE_TIME = {
  /** 2 minutes — for frequently updated data (notifications) */
  medium: 2 * 60 * 1000,
  /** 5 minutes — for user-specific data (profile, addresses, orders) */
  long: 5 * 60 * 1000,
  /** 10 minutes — for rarely changing data (similar products) */
  extended: 10 * 60 * 1000,
} as const;
