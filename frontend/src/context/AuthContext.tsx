import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

export interface User {
  id: number;
  email: string;
  full_name: string;
  target_role: string;
  target_min_ctc_lpa: string | number;
  current_ctc_lpa: string | number;
  experience_years: string | number;
  candidate_pool: string;
  is_verified?: boolean;
}

export interface CandidateProfile {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  target_role: string;
  target_min_ctc_lpa: number;
  current_ctc_lpa: number;
  experience_years: number;
  notice_period_days: number;
  candidate_pool: string;
  bio: string;
  experiences: any[];
  internships: any[];
  education: any[];
  skills: {
    languages?: string[];
    frameworks?: string[];
    cloud_db?: string[];
    aiml?: string[];
    tools?: string[];
  };
  certifications: any[];
  social_links: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    leetcode?: string;
  };
  preferences: any;
}

interface AuthContextType {
  user: User | null;
  profile: CandidateProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setSession: (token: string, user: User, profile?: CandidateProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('acos_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const currentToken = localStorage.getItem('acos_token');
    if (!currentToken) {
      setToken(null);
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.getMe();
      if (res && res.user) {
        setToken(currentToken);
        setUser(res.user);
        setProfile(res.profile);
      } else {
        localStorage.removeItem('acos_token');
        setToken(null);
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      console.warn('Invalid or expired session:', err);
      localStorage.removeItem('acos_token');
      setToken(null);
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const setSession = (newToken: string, newUser: User, newProfile?: CandidateProfile) => {
    localStorage.setItem('acos_token', newToken);
    setToken(newToken);
    setUser(newUser);
    if (newProfile) setProfile(newProfile);
  };

  const login = async (email: string, pass: string) => {
    const res = await api.login({ email, password: pass });
    if (res.access_token) {
      localStorage.setItem('acos_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      await loadCurrentUser();
      setIsAuthModalOpen(false);
    }
  };

  const register = async (formData: any) => {
    const res = await api.register(formData);
    if (res.access_token) {
      localStorage.setItem('acos_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      await loadCurrentUser();
      setIsAuthModalOpen(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('acos_token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await api.getProfile();
      if (res) setProfile(res);
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isLoading,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        login,
        register,
        logout,
        refreshProfile,
        refreshUser: loadCurrentUser,
        setSession
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
