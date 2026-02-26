export interface UserProfile {
  id: string;
  uid: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  city: string | null;
  role: 'admin' | 'customer' | 'concierge';
  loyaltyTier: 'classic' | 'prestige' | 'black';
  totalSpend: number;
  birthday: string | null;
  emailVerified: boolean;
}
