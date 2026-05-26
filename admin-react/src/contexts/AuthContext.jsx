import { createContext, useContext, useState, useCallback } from 'react';
import { AuthAdminAPI } from '@/services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
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
    const user = {
      name: responseData?.fullname || responseData?.name || responseData?.email || email,
      email: responseData?.email || email,
      role: responseData?.role || 'admin',
    };
    if (!token) throw new Error('Không nhận được token từ hệ thống');
    if (user.role !== 'admin') {
      throw new Error('Tài khoản không có quyền quản trị viên!');
    }
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(user));
    setAdmin(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setAdmin(null);
  }, []);

  const isAuthenticated = Boolean(admin && localStorage.getItem('admin_token'));

  return (
    <AuthContext.Provider value={{ admin, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
