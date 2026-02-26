import { supabase } from '../supabase';

const API_URL = process.env.EXPO_PUBLIC_APP_URL || '';

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

export async function fetchUserProfile(): Promise<UserProfile | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return null;

    const response = await fetch(`${API_URL}/api/mobile/profile`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) return null;

    return await response.json();
  } catch {
    return null;
  }
}
