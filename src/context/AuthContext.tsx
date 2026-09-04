import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, Order, ShippingAddress } from '../types';
import { api, ApiError } from '../lib/api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (email: string, fullName: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  addOrder: (order: Order) => void;
  saveAddress: (address: ShippingAddress) => Promise<void>;
  updateAddress: (index: number, address: ShippingAddress) => Promise<void>;
  removeAddress: (index: number) => Promise<void>;
  setDefaultAddress: (index: number) => Promise<void>;
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
        const data = await api.get<UserProfile>('/users?me=true', token);
        if (data && data.email) {
          setUser(normalizeUser(data));
        }
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('cr_user_profile');
        setUser(null);
      }
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
      // Trigger user fetch to get complete orders list
      void fetchUser();
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async (credential: string) => {
    const result = await api.post<{ token: string; user: UserProfile }>('/auth?action=google', { credential });
    localStorage.setItem('auth_token', result.token);
    localStorage.setItem('user_id', result.user.id);
    setUser(normalizeUser(result.user));
    void fetchUser();
  };

  const register = async (email: string, fullName: string, password: string, phone: string = '') => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const result = await api.post<{ token: string; user: UserProfile }>('/users', {
        email: cleanEmail,
        fullName: fullName.trim(),
        phone: phone.trim(),
        password,
      });
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user_id', result.user.id);
      setUser(normalizeUser(result.user));
      void fetchUser();
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
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('Please sign in again before saving your profile');
    const previous = user;
    const optimistic = { ...user, ...data };
    setUser(optimistic);

    try {
      const updated = await api.patch<UserProfile>('/users?me=true', data, token);
      if (updated && updated.email) {
        setUser(normalizeUser(updated));
      }
    } catch (error) {
      setUser(previous);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error('Not authenticated');
    await api.post('/users?action=change-password', {
      currentPassword,
      newPassword,
    });
    // Refresh user profile state (e.g. hasPassword)
    await fetchUser();
  };

  const deleteAccount = async () => {
    if (!user) throw new Error('Not authenticated');
    await api.delete('/users?me=true');
    await logout();
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
    const newAddress: ShippingAddress = {
      ...address,
      id: address.id || `addr_${Date.now()}`,
      isDefault: existing.length === 0 ? true : Boolean(address.isDefault),
    };

    let updatedList: ShippingAddress[];
    if (newAddress.isDefault) {
      updatedList = [newAddress, ...existing.map(a => ({ ...a, isDefault: false }))];
    } else {
      updatedList = [...existing, newAddress];
    }

    await updateProfile({ savedAddresses: updatedList });
  };

  const updateAddress = async (index: number, updatedAddress: ShippingAddress) => {
    if (!user || !user.savedAddresses) return;
    const current = [...user.savedAddresses];
    if (index < 0 || index >= current.length) return;

    if (updatedAddress.isDefault) {
      const revised = current.map((a, i) =>
        i === index ? { ...updatedAddress, isDefault: true } : { ...a, isDefault: false }
      );
      await updateProfile({ savedAddresses: revised });
    } else {
      current[index] = updatedAddress;
      await updateProfile({ savedAddresses: current });
    }
  };

  const removeAddress = async (index: number) => {
    if (!user || !user.savedAddresses) return;
    const filtered = user.savedAddresses.filter((_, i) => i !== index);
    // If we removed the default address, make the first remaining default
    if (filtered.length > 0 && !filtered.some(a => a.isDefault)) {
      filtered[0].isDefault = true;
    }
    await updateProfile({ savedAddresses: filtered });
  };

  const setDefaultAddress = async (index: number) => {
    if (!user || !user.savedAddresses) return;
    const updated = user.savedAddresses.map((addr, i) => ({
      ...addr,
      isDefault: i === index,
    }));
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
        changePassword,
        deleteAccount,
        addOrder,
        saveAddress,
        updateAddress,
        removeAddress,
        setDefaultAddress,
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