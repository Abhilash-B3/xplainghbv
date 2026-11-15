import { apiRequest } from './apiClient';
import type { Currency, PaymentMethod, ResalePlan } from '@/types';

export interface BackendUser {
  id: string;
  email: string;
  phone: string;
  role: 'INVESTOR' | 'ADMIN' | 'SUPPORT' | 'SUPERADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED' | 'PENDING_VERIFICATION';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  partnerProfile?: {
    id: string;
    fullName: string;
    preferredCurrency: Currency;
    referralCode: string;
    kycStatus: string;
    resalePlan: ResalePlan | null;
    defaultPaymentMethod?: PaymentMethod;
  } | null;
}

export interface RegisterPayload {
  email: string;
  password: string;
  phone: string;
  fullName: string;
  preferredCurrency?: Currency;
  resalePlan?: ResalePlan;
  referralCode?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  fullName?: string;
  preferredCurrency?: Currency;
  defaultPaymentMethod?: PaymentMethod;
  resalePlan?: ResalePlan;
  address?: {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    country: string;
    phone?: string;
    isDefault?: boolean;
  };
}

export const authService = {
  async register(payload: RegisterPayload): Promise<{ user: BackendUser }> {
    return await apiRequest<{ user: BackendUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async login(payload: LoginPayload): Promise<{ user: BackendUser }> {
    return await apiRequest<{ user: BackendUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async logout(): Promise<{ message: string }> {
    return await apiRequest<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  },

  async getMe(): Promise<{ user: BackendUser }> {
    return await apiRequest<{ user: BackendUser }>('/auth/me', {
      method: 'GET',
    });
  },

  async getProfile(): Promise<{ user: BackendUser }> {
    return await apiRequest<{ user: BackendUser }>('/users/me', {
      method: 'GET',
    });
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<{ user: BackendUser }> {
    return await apiRequest<{ user: BackendUser }>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return await apiRequest<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return await apiRequest<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return await apiRequest<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    return await apiRequest<{ message: string }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },
};
