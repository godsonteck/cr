import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, Order, ShippingAddress } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, fullName: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  addOrder: (order: Order) => void;
  saveAddress: (address: ShippingAddress) => Promise<void>;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const data = await api.get<UserProfile>('/users/me');
        setUser(data);
      }
    } catch (e) {
      console.error('Failed to fetch user:', e);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_id');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const result = await api.post<{ token: string; user: UserProfile }>('/auth', { email, password });
    localStorage.setItem('auth_token', result.token);
    localStorage.setItem('user_id', result.user.id);
    setUser(result.user);
  };

  const register = async (email: string, fullName: string, phone: string, password: string) => {
    const result = await api.post<{ token: string; user: UserProfile }>('/users', { email, fullName, phone, password });
    localStorage.setItem('auth_token', result.token);
    localStorage.setItem('user_id', result.user.id);
    setUser(result.user);
  };

  const logout = async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    setUser(null);
    await api.delete('/auth');
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = await api.patch<UserProfile>(`/users/${user.id}`, data);
    setUser(updated);
  };

  const addOrder = (order: Order) => {
    setUser(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        orders: [order, ...(prev.orders || [])]
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