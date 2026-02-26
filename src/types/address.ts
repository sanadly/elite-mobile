export type AddressLabel = 'home' | 'work' | 'other';

export interface Address {
  id: string;
  user_id: string;
  label: AddressLabel;
  full_name: string;
  phone: string;
  city: string;
  address_line: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddressFormData {
  label: AddressLabel;
  full_name: string;
  phone: string;
  city: string;
  address_line?: string;
  is_default: boolean;
}
