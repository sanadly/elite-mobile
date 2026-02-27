import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { UserData } from '../types/user';
import { supabase } from '../api/supabase';

interface AuthState {
  user: User | null;
  userData: UserData | null;
  session: Session | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setUserData: (data: UserData | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userData: null,
  session: null,
  loading: true,

  setUser: (user) => set({ user }),
  setUserData: (userData) => set({ userData }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),

  logout: async () => {
    await supabase.auth.signOut();
    set({
      user: null,
      userData: null,
      session: null,
    });
  },
}));
