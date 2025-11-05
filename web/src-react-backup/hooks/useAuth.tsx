import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse, LoginRequest, RegisterRequest, JoinHouseholdRequest } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  joinHousehold: (data: JoinHouseholdRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    // Check for existing token on app load
    const token = localStorage.getItem('auth_token');
    if (token) {
      refreshUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = async () => {
    try {
      const response = await apiService.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        // Invalid token, clear it
        apiService.clearToken();
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      apiService.clearToken();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await apiService.login(data);
      if (response.success && response.data) {
        setUser(response.data.user);
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const response = await apiService.register(data);
      if (response.success && response.data) {
        setUser(response.data.user);
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const joinHousehold = async (data: JoinHouseholdRequest) => {
    setIsLoading(true);
    try {
      const response = await apiService.joinHousehold(data);
      if (response.success && response.data) {
        setUser(response.data.user);
      } else {
        throw new Error(response.error || 'Failed to join household');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiService.clearToken();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    joinHousehold,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};