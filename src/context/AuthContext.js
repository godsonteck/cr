'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getCurrentCustomerSession,
  getCurrentAdminSession,
  signInCustomer as apiSignInCustomer,
  signUpCustomer as apiSignUpCustomer,
  signInWithGoogle as apiSignInWithGoogle,
  signOutCustomer as apiSignOutCustomer,
  signInAdmin as apiSignInAdmin,
  signOutAdmin as apiSignOutAdmin,
} from '@/services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(() => {
    try {
      const c = getCurrentCustomerSession();
      const a = getCurrentAdminSession();
      setCustomer(c);
      setAdmin(a);
    } catch (e) {
      console.error('Error loading auth sessions:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();

    const handleAuthChange = () => {
      loadSessions();
    };

    window.addEventListener('cr-auth-changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('cr-auth-changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [loadSessions]);

  const signInCustomer = async (creds) => {
    const user = await apiSignInCustomer(creds);
    setCustomer(user);
    return user;
  };

  const signUpCustomer = async (data) => {
    const res = await apiSignUpCustomer(data);
    setCustomer(res.user);
    return res;
  };

  const signInWithGoogle = async () => {
    const user = await apiSignInWithGoogle();
    setCustomer(user);
    return user;
  };

  const signOutCustomer = () => {
    apiSignOutCustomer();
    setCustomer(null);
  };

  const signInAdmin = async (creds) => {
    const staff = await apiSignInAdmin(creds);
    setAdmin(staff);
    return staff;
  };

  const signOutAdmin = () => {
    apiSignOutAdmin();
    setAdmin(null);
  };

  const hasAdminPermission = (permKey) => {
    if (!admin) return false;
    if (admin.role === 'SUPER_ADMIN') return true;
    return admin.permissions?.includes(permKey) || false;
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        isAuthenticated: !!customer,
        admin,
        isAdminAuthenticated: !!admin,
        hasAdminPermission,
        loading,
        signInCustomer,
        signUpCustomer,
        signInWithGoogle,
        signOutCustomer,
        signInAdmin,
        signOutAdmin,
        refreshSessions: loadSessions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
