import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/auth.service';

type User = {
  id: string;
  phone: string;
  name: string;
  type: 'worker' | 'employer';
  verified: boolean;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (phone: string) => Promise<void>;
  verifyOtp: (code: string) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      login: async (phone) => {
        set({ isLoading: true, error: null });
        try {
          await authService.login(phone);
          set({ isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false 
          });
        }
      },
      verifyOtp: async (code) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await authService.verifyOtp(
            useAuthStore.getState().user?.phone || '',
            code
          );
          set({ user, token, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Verification failed',
            isLoading: false 
          });
        }
      },
      logout: () => {
        set({ user: null, token: null });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        token: state.token 
      }),
    }
  )
);
