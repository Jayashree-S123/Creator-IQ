import React, { createContext, useContext, useEffect, useState } from 'react';
import type { CreatorUser, CreatorStoreState } from '@/types/creator';
import { CreatorStore } from '@/services/creatorStore';

const API_URL = 'http://127.0.0.1:8000';

interface CreatorAuthContextType {
  user: CreatorUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginDemo: () => void;
  register: (data: {
    name: string;
    email: string;
    password: string;
    category?: string;
    handle?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<CreatorUser>) => void;
  state: CreatorStoreState;
}

const CreatorAuthContext = createContext<CreatorAuthContextType | undefined>(undefined);

export const CreatorAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CreatorStoreState>(() => CreatorStore.getState());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = CreatorStore.subscribe(() => {
      setState({ ...CreatorStore.getState() });
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);

    try {
      const url =
        API_URL +
        '/auth/login?email=' +
        encodeURIComponent(email) +
        '&password=' +
        encodeURIComponent(password);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || 'Invalid email or password'
        };
      }
      localStorage.setItem('creatoriq_token', data.access_token);
      const backendUser = data.user;

      const user: CreatorUser = {
        id: String(backendUser.id),
        name: backendUser.name,
        email: backendUser.email,
        role: backendUser.role,
        category: 'Creator',
        handle: ''
      };

      CreatorStore.setCurrentUser(user);

      return {
        success: true
      };
    } catch (error) {
      console.error('Login error:', error);

      return {
        success: false,
        error: 'Could not connect to backend'
      };
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = () => {
    setLoading(true);
    CreatorStore.loginDemo();
    setLoading(false);
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    category?: string;
    handle?: string;
  }) => {
    setLoading(true);

    try {
      const params = new URLSearchParams();

      params.append('name', data.name);
      params.append('email', data.email);
      params.append('password', data.password);
      params.append('role', 'Creator');

      const response = await fetch(
        API_URL + '/auth/register?' + params.toString(),
        {
          method: 'POST',
          headers: {
            Accept: 'application/json'
          }
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.detail || 'Registration failed'
        };
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Registration error:', error);

      return {
        success: false,
        error: 'Could not connect to backend'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('creatoriq_token');
    CreatorStore.logout();
  };

  const updateProfile = (updates: Partial<CreatorUser>) => {
    CreatorStore.updateProfile(updates);
  };

  return (
    <CreatorAuthContext.Provider
      value={{
        user: state.currentUser,
        loading,
        login,
        loginDemo,
        register,
        logout,
        updateProfile,
        state
      }}
    >
      {children}
    </CreatorAuthContext.Provider>
  );
};

export function useCreatorAuth() {
  const ctx = useContext(CreatorAuthContext);

  if (!ctx) {
    throw new Error('useCreatorAuth must be used within a CreatorAuthProvider');
  }

  return ctx;
}