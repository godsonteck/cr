import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, Order, ShippingAddress } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (email: string, fullName: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  addOrder: (order: Order) => void;
  saveAddress: (address: ShippingAddress) => Promise<void>;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeUser = (profile: UserProfile): UserProfile => ({
  ...profile,
  savedAddresses: profile.savedAddresses || [],
  orders: profile.orders || [],
  savedItemIds: profile.savedItemIds || [],
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('cr_user_profile');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignored
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Keep local user profile synced to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('cr_user_profile', JSON.stringify(user));
    } else {
      localStorage.removeItem('cr_user_profile');
    }
  }, [user]);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const data = await api.get<UserProfile>('/users?me=true');
        if (data && data.email) {
          setUser(normalizeUser(data));
        }
      }
    } catch {
      // If remote fetch fails, preserve existing localStorage profile
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const result = await api.post<{ token: string; user: UserProfile }>('/auth', { email: cleanEmail, password });
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user_id', result.user.id);
      setUser(normalizeUser(result.user));
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async (credential: string) => {
    const result = await api.post<{ token: string; user: UserProfile }>('/auth?action=google', { credential });
    localStorage.setItem('auth_token', result.token);
    localStorage.setItem('user_id', result.user.id);
    setUser(normalizeUser(result.user));
  };

  const register = async (email: string, fullName: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const result = await api.post<{ token: string; user: UserProfile }>('/users', { email: cleanEmail, fullName, password });
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user_id', result.user.id);
      setUser(normalizeUser(result.user));
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('cr_user_profile');
    setUser(null);
    try {
      await api.delete('/auth');
    } catch {
      // Ignored
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    setUser(prev => (prev ? { ...prev, ...data } : null));
    try {
      const updated = await api.patch<UserProfile>(`/users/${user.id}`, data);
      if (updated) setUser(normalizeUser(updated));
    } catch {
      // Handled locally
    }
  };

  const addOrder = (order: Order) => {
    setUser(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        orders: [order, ...(prev.orders || [])],
      };
    });
  };

  const saveAddress = async (address: ShippingAddress) => {
    if (!user) return;
    const existing = user.savedAddresses || [];
    const updated = [address, ...existing.filter(a => a.area !== address.area)];
    await updateProfile({ savedAddresses: updated });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        register,
        logout,
        updateProfile,
        addOrder,
        saveAddress,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};