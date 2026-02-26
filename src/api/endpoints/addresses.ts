import { supabase, getAuthenticatedUserId } from '../supabase';
import type { Address, AddressFormData } from '../../types/address';

/** Unset all default addresses for a user. */
async function unsetAllDefaults(userId: string): Promise<void> {
  await supabase
    .from('addresses')
    .update({ is_default: false })
    .eq('user_id', userId);
}

export async function getAddresses(): Promise<Address[]> {
  const userId = await getAuthenticatedUserId().catch(() => null);
  if (!userId) return [];

  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as Address[]) || [];
}

export async function getAddressById(id: string): Promise<Address | null> {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as Address;
}

export async function createAddress(formData: AddressFormData): Promise<Address> {
  const userId = await getAuthenticatedUserId();

  if (formData.is_default) {
    await unsetAllDefaults(userId);
  }

  const { data, error } = await supabase
    .from('addresses')
    .insert({
      user_id: userId,
      ...formData,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Address;
}

export async function updateAddress(id: string, formData: AddressFormData): Promise<Address> {
  const userId = await getAuthenticatedUserId();

  if (formData.is_default) {
    await unsetAllDefaults(userId);
  }

  const { data, error } = await supabase
    .from('addresses')
    .update({
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Address;
}

export async function deleteAddress(id: string): Promise<void> {
  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function setDefaultAddress(id: string): Promise<void> {
  const userId = await getAuthenticatedUserId();

  await unsetAllDefaults(userId);

  const { error } = await supabase
    .from('addresses')
    .update({ is_default: true })
    .eq('id', id);

  if (error) throw error;
}
