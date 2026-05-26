import { createContext, useContext, useState, useCallback } from 'react';
import { AuthAdminAPI } from '@/services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (email, password) => {
    const res = await AuthAdminAPI.login({ email, password });
    const responseData = res?.data || res;
    const token = responseData?.token || responseData?.accessToken;
    const userObj = {
      name: responseData?.fullname || responseData?.name || responseData?.email || email,
      email: responseData?.email || email,
      role: responseData?.role || 'user',
    };
    if (!token) throw new Error('Không nhận được token từ hệ thống');
    
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(userObj));
    setUser(userObj);
    return userObj;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setUser(null);
  }, []);

  const isAuthenticated = Boolean(user && localStorage.getItem('admin_token'));

  return (
    <AuthContext.Provider value={{ admin: user, user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
