import { UserProfile } from '../../types/user';
import { apiFetch } from '../client';

export type { UserProfile } from '../../types/user';

export interface UpdateProfileData {
  name: string;
  phone: string;
  city: string;
  birthday?: string | null;
}

export async function fetchUserProfile(): Promise<UserProfile | null> {
  try {
    return await apiFetch<UserProfile>('/api/mobile/profile');
  } catch (err) {
    console.warn('[Profile] Fetch failed:', err);
    return null;
  }
}

export async function updateUserProfile(data: UpdateProfileData): Promise<UserProfile> {
  return apiFetch<UserProfile>('/api/mobile/profile', {
    requireAuth: true,
    method: 'PUT',
    body: data,
  });
}
