export type LoyaltyTier = 'classic' | 'prestige' | 'black';

export type UserRole = 'admin' | 'customer' | 'concierge' | 'staff';

export interface UserProfile {
  id: string;
  uid: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  city: string | null;
  role: UserRole;
  loyaltyTier: LoyaltyTier;
  totalSpend: number;
  birthday: string | null;
  emailVerified: boolean;
}

/** Subset of UserProfile stored in auth state (excludes fields not needed at runtime) */
export type UserData = Pick<UserProfile, 'id' | 'uid' | 'name' | 'email' | 'role' | 'loyaltyTier' | 'totalSpend'> & {
  phone?: string;
  city?: string;
};
