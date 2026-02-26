import { supabase } from '../supabase';
import type { Address, AddressFormData } from '../../types/address';

export async function getAddresses(): Promise<Address[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return [];

  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', session.user.id)
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
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) throw new Error('Not authenticated');

  // If setting as default, unset other defaults first
  if (formData.is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', session.user.id);
  }

  const { data, error } = await supabase
    .from('addresses')
    .insert({
      user_id: session.user.id,
      ...formData,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Address;
}

export async function updateAddress(id: string, formData: AddressFormData): Promise<Address> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) throw new Error('Not authenticated');

  // If setting as default, unset other defaults first
  if (formData.is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', session.user.id);
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
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) throw new Error('Not authenticated');

  // Unset all defaults
  await supabase
    .from('addresses')
    .update({ is_default: false })
    .eq('user_id', session.user.id);

  // Set this one as default
  const { error } = await supabase
    .from('addresses')
    .update({ is_default: true })
    .eq('id', id);

  if (error) throw error;
}
