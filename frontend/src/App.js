import React, { useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { createTheme, ThemeProvider, CssBaseline, Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, IconButton, Switch, Divider, Collapse } from '@mui/material';
import { motion } from 'framer-motion';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BuildIcon from '@mui/icons-material/Build';
import InventoryIcon from '@mui/icons-material/Inventory';
import HistoryIcon from '@mui/icons-material/History';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import TuneIcon from '@mui/icons-material/Tune';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';

// کامپوننت‌های مختلف
import Dashboard from './components/Dashboard';
import MachinesDashboard from './components/MachinesDashboard';
import MachinesAndEquipments from './components/MachinesAndEquipments';
import MoldAssignment from './components/MoldAssignment';
import MaintenanceManagement from './components/MaintenanceManagement';
import Inventory from './components/Inventory';
import ProductionHistory from './components/ProductionHistory';
import Login from './components/Login';
import RoleSwitcher from './components/RoleSwitcher';
import ProtectedRoute from './components/ProtectedRoute';
import AdminCombinedPanel from './components/AdminCombinedPanel';
import DynamicPage from './components/DynamicPage';
import Welcome from './components/Welcome';

import { AuthProvider, AuthContext } from './context/AuthContext';
import { AdminUpdateProvider } from './context/AdminUpdateContext';

const theme = createTheme({
  palette: {
    primary: { main: '#283593' },
    secondary: { main: '#d32f2f' },
    background: { default: '#e8eaf6' }
  },
  typography: {
    fontFamily: 'Poppins, sans-serif',
    h1: { fontWeight: 700, fontSize: '2.8rem' },
    h4: { fontWeight: 600, fontSize: '2rem' }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 10 }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 20, boxShadow: '0px 8px 24px rgba(0,0,0,0.2)' }
      }
    }
  }
});

function AppContent() {
  const { token, role, loading, logout, isFirstLogin } = useContext(AuthContext);
  const [pages, setPages] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [machinesMenuOpen, setMachinesMenuOpen] = useState(false);
  const location = useLocation();

  const handleThemeToggle = () => {
    setIsDarkMode((prev) => !prev);
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleMachinesMenuClick = () => {
    setMachinesMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    const fetchPages = async () => {
      if (!token || role !== 'admin') return;
      try {
        const res = await axios.get('http://localhost:5000/api/pages', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPages(res.data || []);
      } catch (err) {
        console.error('Error fetching pages:', err.response ? err.response.data : err.message);
      }
    };
    fetchPages();
  }, [token, role]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!token || role === 'guest') {
    return <Login />;
  }

  if (isFirstLogin && location.pathname !== '/welcome') {
    return <Navigate to="/welcome" replace />;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: sidebarOpen ? 240 : 60,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: sidebarOpen ? 240 : 60,
            boxSizing: 'border-box',
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#283593',
            transition: 'width 0.3s',
            overflowX: 'hidden',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
          <SettingsIcon sx={{ fontSize: 30, mr: sidebarOpen ? 1 : 0 }} />
          {sidebarOpen && (
            <Typography variant="h6" sx={{ fontFamily: '"Inter", sans-serif' }}>
              Management App
            </Typography>
          )}
          <IconButton onClick={toggleSidebar} sx={{ ml: 'auto' }}>
            <MenuIcon sx={{ color: isDarkMode ? '#ffffff' : '#283593' }} />
          </IconButton>
        </Box>
        <Divider />
        <List>
          <ListItem button component={Link} to="/dashboard">
            <ListItemIcon>
              <DashboardIcon sx={{ color: isDarkMode ? '#ffffff' : '#283593' }} />
            </ListItemIcon>
            {sidebarOpen && <ListItemText primary="Dashboard" />}
          </ListItem>

          <ListItem button onClick={handleMachinesMenuClick}>
            <ListItemIcon>
              <BuildIcon sx={{ color: isDarkMode ? '#ffffff' : '#283593' }} />
            </ListItemIcon>
            {sidebarOpen && <ListItemText primary="Machines" />}
            {sidebarOpen && (machinesMenuOpen ? <ExpandLess /> : <ExpandMore />)}
          </ListItem>
          <Collapse in={machinesMenuOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem button component={Link} to="/machines" sx={{ pl: 4 }}>
                <ListItemIcon>
                  <DashboardIcon sx={{ color: isDarkMode ? '#ffffff' : '#283593' }} />
                </ListItemIcon>
                {sidebarOpen && <ListItemText primary="Status Dashboard" />}
              </ListItem>
              <ListItem button component={Link} to="/machines-and-equipments" sx={{ pl: 4 }}>
                <ListItemIcon>
                  <TuneIcon sx={{ color: isDarkMode ? '#ffffff' : '#283593' }} />
                </ListItemIcon>
                {sidebarOpen && <ListItemText primary="Machines & Equipments" />}
              </ListItem>
              <ListItem button component={Link} to="/machines/mold-assignment" sx={{ pl: 4 }}>
                <ListItemIcon>
                  <SwapHorizIcon sx={{ color: isDarkMode ? '#ffffff' : '#283593' }} />
                </ListItemIcon>
                {sidebarOpen && <ListItemText primary="Mold Assignment" />}
              </ListItem>
              <ListItem button component={Link} to="/machines/maintenance" sx={{ pl: 4 }}>
                <ListItemIcon>
                  <BuildCircleIcon sx={{ color: isDarkMode ? '#ffffff' : '#283593' }} />
                </ListItemIcon>
                {sidebarOpen && <ListItemText primary="Maintenance" />}
              </ListItem>
            </List>
          </Collapse>

          <ListItem button component={Link} to="/inventory">
            <ListItemIcon>
              <InventoryIcon sx={{ color: isDarkMode ? '#ffffff' : '#283593' }} />
            </ListItemIcon>
            {sidebarOpen && <ListItemText primary="Inventory" />}
          </ListItem>
          <ListItem button component={Link} to="/production-history">
            <ListItemIcon>
              <HistoryIcon sx={{ color: isDarkMode ? '#ffffff' : '#283593' }} />
            </ListItemIcon>
            {sidebarOpen && <ListItemText primary="Production History" />}
          </ListItem>
          {role === 'admin' && (
            <ListItem button component={Link} to="/admin">
              <ListItemIcon>
                <AdminPanelSettingsIcon sx={{ color: isDarkMode ? '#ffffff' : '#283593' }} />
              </ListItemIcon>
              {sidebarOpen && <ListItemText primary="Admin Panel" />}
            </ListItem>
          )}
          {role === 'admin' && pages.length > 0 && pages.map((page) => (
            <ListItem button key={page.id} component={Link} to={page.route}>
              <ListItemIcon>
                <DashboardIcon sx={{ color: isDarkMode ? '#ffffff' : '#283593' }} />
              </ListItemIcon>
              {sidebarOpen && <ListItemText primary={page.name} />}
            </ListItem>
          ))}
        </List>
        <Divider />
        <Box sx={{ p: 2, mt: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Switch
              checked={isDarkMode}
              onChange={handleThemeToggle}
              color="default"
              sx={{
                '& .MuiSwitch-thumb': { backgroundColor: isDarkMode ? '#ffffff' : '#283593' },
                '& .MuiSwitch-track': { backgroundColor: isDarkMode ? '#4b5563' : '#e5e7eb' },
              }}
            />
            {sidebarOpen && (
              <Typography variant="body2" sx={{ ml: 1 }}>
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
              </Typography>
            )}
          </Box>
          <ListItem button onClick={logout}>
            <ListItemIcon>
              <LogoutIcon sx={{ color: isDarkMode ? '#ffffff' : '#283593' }} />
            </ListItemIcon>
            {sidebarOpen && <ListItemText primary={`Logout (${role})`} />}
          </ListItem>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          background: isDarkMode
            ? 'linear-gradient(135deg, #1f2937, #4b5563)'
            : 'linear-gradient(135deg, #e0f2fe, #ffffff)',
          minHeight: '100vh',
          p: 4,
          transition: 'all 0.3s',
        }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/machines" element={<MachinesDashboard />} />
            <Route path="/machines-and-equipments" element={<MachinesAndEquipments />} />
            <Route path="/machines/mold-assignment" element={<MoldAssignment />} />
            <Route path="/machines/maintenance" element={<MaintenanceManagement />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/production-history" element={<ProductionHistory />} />
            <Route path="/admin" element={<AdminCombinedPanel />} />
            <Route path="/:route" element={<DynamicPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/welcome" />} />
        </Routes>

        <Box sx={{ py: 2, textAlign: 'center', color: isDarkMode ? '#ffffff' : '#283593', mt: 4 }}>
          <Typography variant="body2">
            © 2025 Management App. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AdminUpdateProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </AdminUpdateProvider>
    </ThemeProvider>
  );
}

export default App;