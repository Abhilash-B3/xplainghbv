import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, type BackendUser, type RegisterPayload, type LoginPayload } from '@/services/authService';
import type { PartnerProfile, Currency, PaymentMethod, ResalePlan } from '@/types';

interface AuthContextType {
  user: BackendUser | null;
  partner: PartnerProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  updatePartnerProfile: (updated: Partial<PartnerProfile>) => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapBackendUserToPartnerProfile(user: BackendUser): PartnerProfile {
  const profile = user.partnerProfile;
  return {
    id: profile?.id || user.id,
    name: profile?.fullName || user.email.split('@')[0],
    email: user.email,
    phone: user.phone,
    currency: (profile?.preferredCurrency as Currency) || 'EUR',
    paymentMethod: (profile?.defaultPaymentMethod as PaymentMethod) || 'visa',
    resalePlan: (profile?.resalePlan as ResalePlan) || 'sellfor',
    referralCode: profile?.referralCode || 'XP-000000',
    role: user.role,
    startDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    stockValue: 0,
    batches: [],
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [partner, setPartner] = useState<PartnerProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshAuth = useCallback(async () => {
    try {
      const data = await authService.getMe();
      if (data?.user) {
        setUser(data.user);
        setPartner(mapBackendUserToPartnerProfile(data.user));
      } else {
        setUser(null);
        setPartner(null);
      }
    } catch {
      // 401 or network error → unauthenticated
      setUser(null);
      setPartner(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const login = async (payload: LoginPayload) => {
    const data = await authService.login(payload);
    setUser(data.user);
    setPartner(mapBackendUserToPartnerProfile(data.user));
  };

  const register = async (payload: RegisterPayload) => {
    const data = await authService.register(payload);
    setUser(data.user);
    setPartner(mapBackendUserToPartnerProfile(data.user));
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setPartner(null);
    }
  };

  const updatePartnerProfile = async (updated: Partial<PartnerProfile>) => {
    if (!user) return;
    const res = await authService.updateProfile({
      fullName: updated.name,
      preferredCurrency: updated.currency,
      defaultPaymentMethod: updated.paymentMethod,
      resalePlan: updated.resalePlan,
    });
    setUser(res.user);
    setPartner(mapBackendUserToPartnerProfile(res.user));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        partner,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updatePartnerProfile,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
