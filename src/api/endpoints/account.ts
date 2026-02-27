import { apiFetch } from '../client';

export async function deleteAccount(): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>('/api/mobile/account/delete', {
    requireAuth: true,
    method: 'DELETE',
  });
}
