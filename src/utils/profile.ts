import { UserProfile } from '../types/user';

interface UserData {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  role: 'admin' | 'customer' | 'concierge';
  loyaltyTier: 'classic' | 'prestige' | 'black';
  totalSpend: number;
}

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
