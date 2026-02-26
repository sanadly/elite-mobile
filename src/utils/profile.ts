import { UserProfile, UserData } from '../types/user';

export function mapProfileToUserData(profile: UserProfile): UserData {
  return {
    id: profile.id,
    uid: profile.uid,
    name: profile.name,
    email: profile.email,
    phone: profile.phone || undefined,
    city: profile.city || undefined,
    role: profile.role,
    loyaltyTier: profile.loyaltyTier,
    totalSpend: profile.totalSpend,
  };
}
