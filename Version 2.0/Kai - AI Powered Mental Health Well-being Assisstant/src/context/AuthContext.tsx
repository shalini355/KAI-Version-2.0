import React, { createContext, useContext, useState } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (email: string, pass: string) => Promise<User>;
  signup: (name: string, email: string, pass: string) => Promise<User>;
  guestLogin: () => User;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => User;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());

  const login = async (email: string, pass: string) => {
    const logged = await authService.login(email, pass);
    setUser(logged);
    return logged;
  };

  const signup = async (name: string, email: string, pass: string) => {
    const newUser = await authService.signup(name, email, pass);
    setUser(newUser);
    return newUser;
  };

  const guestLogin = () => {
    const guest = authService.loginAsGuest();
    setUser(guest);
    return guest;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    const updated = authService.updateProfile(updates);
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isGuest: Boolean(user?.isGuest),
        login,
        signup,
        guestLogin,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
