import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const { data } = await supabase.auth.getSession();
      
      if (storedUser && token && data.session) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          logout();
        }
      } else if (storedUser || token) {
        // Clear invalid partial state
        logout();
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      // Authenticate directly with Supabase for DB access
      const { data: supaData, error: supaError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (supaError) throw new Error(supaError.message);

      // Repair public.users table so the emotions foreign key doesn't block the user
      if (supaData?.user) {
        await supabase.from('users').upsert([{
          id: supaData.user.id,
          email: supaData.user.email,
          password_hash: 'managed-by-supabase',
          full_name: email.split('@')[0]
        }], { onConflict: 'id' });
      }

      // We still call backend just to get the Flask JWT if needed by emotionAPI
      const res = await authAPI.login(email, password);
      const { access_token, user_id, name, email: userEmail } = res.data;
      const userData = { id: user_id, name: name || email.split('@')[0], email: userEmail || email };
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(access_token);
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || error.response?.data?.error || 'Login failed. Please try again.',
      };
    }
  };

  const signup = async (name, email, password) => {
    try {
      // Supabase signup
      const { data: supaData, error: supaError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });
      if (supaError) throw new Error(supaError.message);

      // Repair public.users table
      if (supaData?.user) {
        await supabase.from('users').upsert([{
          id: supaData.user.id,
          email: supaData.user.email,
          password_hash: 'managed-by-supabase',
          full_name: name || email.split('@')[0]
        }], { onConflict: 'id' });
      }

      const res = await authAPI.signup(name, email, password);
      const { access_token, user_id } = res.data;
      const userData = { id: user_id, name, email };
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(access_token);
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || error.response?.data?.error || 'Signup failed. Please try again.',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
