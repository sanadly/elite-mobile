import { API_BASE, getAuthHeaders } from '../config';
import { UserProfile } from '../../types/user';

export type { UserProfile } from '../../types/user';

export async function fetchUserProfile(): Promise<UserProfile | null> {
  try {
    const headers = await getAuthHeaders();
    if (!headers.Authorization) return null;

    const response = await fetch(`${API_BASE}/api/mobile/profile`, { headers });

    if (!response.ok) return null;

    return await response.json();
  } catch (err) {
    console.warn('[Profile] Fetch failed:', err);
    return null;
  }
}
