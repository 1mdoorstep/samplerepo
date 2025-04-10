import axios from 'axios';

const API_BASE_URL = 'https://api.fyke.example.com/v1';

export const authService = {
  async login(phone: string): Promise<{ otpSent: boolean }> {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { phone });
    return response.data;
  },

  async verifyOtp(phone: string, code: string): Promise<{ 
    user: {
      id: string;
      phone: string;
      name: string;
      type: 'worker' | 'employer';
      verified: boolean;
    };
    token: string;
  }> {
    const response = await axios.post(`${API_BASE_URL}/auth/verify`, { 
      phone, 
      code 
    });
    return response.data;
  }
};
