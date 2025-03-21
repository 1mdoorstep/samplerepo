export interface User {
  id: string;
  name: string;
  phone: string;
  isDriver: boolean;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}