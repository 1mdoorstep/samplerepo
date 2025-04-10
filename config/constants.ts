export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_OTP: 'Please enter a valid 6-digit OTP',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Session expired. Please login again.',
};

export const API_ENDPOINTS = {
  AUTH: {
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    LOGOUT: '/auth/logout',
  },
};

export const STORAGE_KEYS = {
  AUTH: 'auth-storage',
  TOKEN: 'token',
  REFRESH_TOKEN: 'refresh-token',
}; 