import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUserProfile, updateUserProfile, UpdateProfileData } from '../api/endpoints/profile';
import { mapProfileToUserData } from '../utils/profile';
import { useAuthStore } from '../store/authStore';
import { queryKeys } from '../api/queryKeys';
import { STALE_TIME } from '../constants/query';

export function useProfile() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.profile.all,
    queryFn: fetchUserProfile,
    enabled: !!user,
    staleTime: STALE_TIME.long,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { setUserData } = useAuthStore();

  return useMutation({
    mutationFn: (data: UpdateProfileData) => updateUserProfile(data),
    onSuccess: (updatedProfile) => {
      if (updatedProfile) {
        queryClient.setQueryData(queryKeys.profile.all, updatedProfile);
        setUserData(mapProfileToUserData(updatedProfile));
      }
    },
  });
}
