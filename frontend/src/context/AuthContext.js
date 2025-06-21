import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { AdminUpdateContext } from './AdminUpdateContext';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState('guest');
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(!localStorage.getItem('lastLogin'));

  const { triggerUpdate } = useContext(AdminUpdateContext);

  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp < Date.now() / 1000;
    } catch (err) {
      console.error('Error decoding token:', err);
      return true;
    }
  };

  async function fetchUserProfile() {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/me');
      console.log('User profile response:', response.data);
      setRole(response.data.role || 'guest');
      setPermissions(response.data.permissions || ['view-dashboard', 'view-machines', 'view-machinesandequipments']); // تغییر از machines&equipments به view-machinesandequipments
    } catch (err) {
      console.error('Error fetching user profile:', err.response?.data || err.message);
      setRole('guest');
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    console.log('Initial stored token:', storedToken);
    if (storedToken) {
      if (isTokenExpired(storedToken)) {
        console.log('Token expired, logging out...');
        logout();
      } else {
        setToken(storedToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        fetchUserProfile();
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { username, password }, {
        headers: { 'Content-Type': 'application/json' },
      });
      const newToken = res.data.token;
      if (newToken) {
        localStorage.setItem('token', newToken);
        localStorage.setItem('lastLogin', new Date().toISOString());
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setToken(newToken);
        console.log('Stored token after login:', newToken);
        setIsFirstLogin(!localStorage.getItem('lastLogin'));
        await fetchUserProfile();
        window.location.href = '/welcome';
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('lastLogin');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setRole('guest');
    setPermissions([]);
    setIsFirstLogin(true);
  };

  const updatePermissions = async (newPermissions) => {
    try {
      console.log('Syncing permissions:', newPermissions);
      console.log('Using token for sync:', token);
      await axios.post('http://localhost:5000/api/permissions', { permissions: newPermissions });
      console.log('Permissions synced successfully');
      await fetchUserProfile();
      triggerUpdate();
    } catch (err) {
      console.error('Error updating permissions:', err.response?.data || err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        permissions,
        loading,
        login,
        logout,
        isFirstLogin,
        updatePermissions,
        canAccessDashboard: permissions.includes('view-dashboard'),
        canAccessMachines: permissions.includes('view-machines'),
        canAccessMachinesAndEquipments: permissions.includes('view-machinesandequipments'), // تغییر از machines&equipments
        canAccessMoldAssignment: permissions.includes('view-moldassignment'),
        canAccessMaintenance: permissions.includes('view-maintenancemanagement'),
        canAccessInventory: permissions.includes('view-inventory'),
        canAccessProductionHistory: permissions.includes('view-productionhistory'),
        canAccessAdminPanel: permissions.includes('view-adminpanel'),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}