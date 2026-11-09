import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import * as authService from '../services/authService';
import { setAuthFailureHandler } from '../api/axios';
import type { RegisterPayload, User } from '../types';

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuthFailureHandler(() => {
      setToken(null);
      setUser(null);
    });
    (async () => {
      try {
        const session = await authService.loadStoredSession();
        if (session) {
          setToken(session.token);
          setUser(session.user);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password);
    setToken(res.accessToken);
    setUser(res.user);
    return res.user;
  };

  const register = async (data: RegisterPayload) => {
    const res = await authService.register(data);
    setToken(res.accessToken);
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    await authService.logout();
    setToken(null);
    setUser(null);
  };

  const updateUser = (patch: Partial<User>) => {
    setUser((prev) => {
      const next = { ...(prev ?? {}), ...patch } as User;
      authService.updateStoredUser(next);
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
