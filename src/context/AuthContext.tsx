import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Order, ShippingAddress } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, fullName?: string, phone?: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  addOrder: (order: Order) => void;
  saveAddress: (address: ShippingAddress) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'cr_shop_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  const login = (email: string, fullName = 'Valued Customer', phone = '+233 55 123 4567') => {
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      fullName,
      email,
      phone,
      savedAddresses: [
        {
          fullName,
          phone,
          email,
          city: 'Accra',
          area: 'East Legon / Botwe',
          landmarkOrGps: 'Near Botwe School Junction'
        }
      ],
      orders: [],
      savedItemIds: []
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) {
      // Create user if not existing
      setUser({
        id: `usr-${Date.now()}`,
        fullName: data.fullName || 'Valued Customer',
        email: data.email || 'customer@gmail.com',
        phone: data.phone || '+233 55 123 4567',
        savedAddresses: data.savedAddresses || [],
        orders: data.orders || [],
        savedItemIds: data.savedItemIds || []
      });
      return;
    }
    setUser(prev => prev ? { ...prev, ...data } : null);
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

  const saveAddress = (address: ShippingAddress) => {
    setUser(prev => {
      if (!prev) return prev;
      const existing = prev.savedAddresses || [];
      const updated = [address, ...existing.filter(a => a.area !== address.area)];
      return {
        ...prev,
        savedAddresses: updated
      };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateProfile,
        addOrder,
        saveAddress
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
