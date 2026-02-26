import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../api/endpoints/addresses';
import { useAuthStore } from '../store/authStore';
import { queryKeys } from '../api/queryKeys';
import type { AddressFormData } from '../types/address';

export function useAddresses() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.addresses.all,
    queryFn: getAddresses,
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAddress(id: string) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.addresses.detail(id),
    queryFn: () => getAddressById(id),
    enabled: !!user && !!id,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddressFormData) => createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddressFormData }) => updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
    },
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
    },
  });
}
