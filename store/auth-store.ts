import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, User } from '@/types/auth';

interface AuthStore extends AuthState {
  login: (phone: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  signup: (name: string, phone: string, referralCode: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Mock user for demo purposes
const MOCK_USER: User = {
  id: "user-1",
  name: "John Doe",
  phone: "+1234567890",
  isDriver: true,
  referralCode: "JOHN123",
  createdAt: new Date().toISOString()
};

// FIXED: Added better error handling and default values
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (phone: string) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would call an API to send OTP
          // For now, we'll simulate a delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // For demo purposes, we'll just set a flag indicating OTP was sent
          set({ isLoading: false });
          return Promise.resolve();
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : "Failed to send OTP" 
          });
          return Promise.reject(error);
        }
      },

      verifyOtp: async (otp: string) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would verify the OTP with an API
          // For now, we'll simulate a delay and success if OTP is "1234"
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (otp !== "1234") {
            throw new Error("Invalid OTP");
          }
          
          set({ 
            user: MOCK_USER,
            isAuthenticated: true,
            isLoading: false 
          });
          return Promise.resolve();
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : "Failed to verify OTP" 
          });
          return Promise.reject(error);
        }
      },

      signup: async (name: string, phone: string, referralCode: string) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would call an API to register the user
          // For now, we'll simulate a delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Validate referral code (in a real app, this would be done on the server)
          // FIXED: Accept any referral code for demo purposes
          const validReferralCode = referralCode.trim().length > 0;
          if (!validReferralCode) {
            throw new Error("Please enter a referral code");
          }
          
          // Mock user data
          const mockUser: User = {
            id: "user-" + Date.now(),
            name,
            phone,
            isDriver: true,
            referralCode: name.toUpperCase().substring(0, 4) + Math.floor(Math.random() * 1000),
            referredBy: referralCode,
            createdAt: new Date().toISOString()
          };
          
          set({ 
            user: mockUser,
            isAuthenticated: true,
            isLoading: false 
          });
          return Promise.resolve();
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : "Failed to sign up" 
          });
          return Promise.reject(error);
        }
      },

      logout: () => {
        set({ 
          user: null,
          isAuthenticated: false,
          error: null
        });
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);