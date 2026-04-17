'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<{ error: any }>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth session error:', error.message || error);
          // If the refresh token is invalid, we must clear the session to avoid being stuck
          if (error.message.includes('Refresh Token Not Found') || error.message.includes('invalid_refresh_token')) {
            await supabase.auth.signOut();
            // Force clear local storage keys related to supabase auth as a safety measure
            Object.keys(localStorage).forEach(key => {
              if (key.includes('sb-') && key.includes('-auth-token')) {
                localStorage.removeItem(key);
              }
            });
            setUser(null);
          }
        } else {
          setUser(session?.user ?? null);
        }
      } catch (err: any) {
        console.error('Unexpected auth error:', err.message || err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        setUser(session?.user ?? null);
      } else if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        if (error.message.includes('provider is not enabled')) {
          console.error('ERRO DE CONFIGURAÇÃO: O provedor Google não está ativado no painel do Supabase. Vá em Authentication > Providers e ative o Google.');
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Login error:', error.message || error);
      // Removed alert as per instructions
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Login error:', error.message || error);
      return { error };
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: name,
          },
        },
      });
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Signup error:', error.message || error);
      return { error };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error('Logout error:', error.message || error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithEmail, signUpWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
