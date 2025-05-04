// frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState('guest');
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // تابعی برای دریافت پروفایل کاربر از بک‌اند (GET /api/auth/me)
  async function fetchUserProfile() {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/me');
      // انتظار می‌رود پاسخ سرور به شکل زیر باشد:
      // {
      //   userId: number,
      //   username: string,
      //   role: string,
      //   permissions: string[]
      // }
      setRole(response.data.role || 'guest');
      setPermissions(response.data.permissions || []);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      // در صورت خطا یا توکن نامعتبر، کاربر را guest در نظر می‌گیریم
      setRole('guest');
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }

  // در اولین رندر بررسی می‌کنیم که آیا توکنی در localStorage وجود دارد یا خیر
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      // دریافت اطلاعات کاربر با استفاده از توکن
      fetchUserProfile();
    } else {
      // اگر توکنی نداریم، کاربر به عنوان guest در نظر گرفته می‌شود
      setLoading(false);
    }
  }, []);

  // متد login برای ورود کاربر
  const login = async (username, password) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { username, password });
      const newToken = res.data.token;
      if (newToken) {
        // ذخیره توکن در localStorage و ست کردن هدر Authorization
        localStorage.setItem('token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setToken(newToken);
        // دریافت پروفایل کاربر برای تنظیم role و permissions
        await fetchUserProfile();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  // متد logout برای خروج کاربر
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setRole('guest');
    setPermissions([]);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        permissions,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
