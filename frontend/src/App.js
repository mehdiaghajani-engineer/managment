import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { createTheme, ThemeProvider, CssBaseline, AppBar, Toolbar, Typography, Container, Box, Button } from '@mui/material';
import { motion } from 'framer-motion';

// کامپوننت‌های مختلف
import Dashboard from './components/Dashboard';
import Machines from './components/Machines';
import Inventory from './components/Inventory';
import ProductionHistory from './components/ProductionHistory';
import Login from './components/Login';
import RoleSwitcher from './components/RoleSwitcher';
import ProtectedRoute from './components/ProtectedRoute';
import AdminCombinedPanel from './components/AdminCombinedPanel';
import Pages from './components/Pages'; // اضافه کردن کامپوننت جدید

import { AuthProvider, AuthContext } from './context/AuthContext';

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
  const { token, role, loading } = useContext(AuthContext);

  console.log('Token in AppContent:', token);
  console.log('Role in AppContent:', role);
  console.log('Loading in AppContent:', loading);

  if (loading || !token || role === 'guest') {
    return <Login />;
  }

  return (
    <>
      <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #283593, #3f51b5)' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Management Application
          </Typography>
          <RoleSwitcher />
          <Box sx={{ display: 'flex', gap: 2, ml: 2 }}>
            <Button component={Link} to="/" color="inherit">Dashboard</Button>
            <Button component={Link} to="/machines" color="inherit">Machines</Button>
            <Button component={Link} to="/inventory" color="inherit">Inventory</Button>
            <Button component={Link} to="/production-history" color="inherit">Production History</Button>
            <Button component={Link} to="/pages" color="inherit">Pages</Button> {/* اضافه کردن لینک جدید */}
            {role === 'admin' && (
              <Button component={Link} to="/admin" color="inherit">Admin Panel</Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        sx={{
          background: 'url(/background.jpg) no-repeat center center fixed',
          backgroundSize: 'cover',
          minHeight: '100vh',
          py: 4
        }}
      >
        <Container sx={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 3, p: 4 }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/machines" element={<Machines />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/production-history" element={<ProductionHistory />} />
              <Route path="/pages" element={<Pages />} /> {/* اضافه کردن روت جدید */}
              <Route path="/admin" element={<AdminCombinedPanel />} />
            </Route>
          </Routes>
        </Container>
      </Box>

      <Box sx={{ py: 2, backgroundColor: '#283593', textAlign: 'center', color: '#fff' }}>
        <Typography variant="body2">
          © 2025 Management App. All rights reserved.
        </Typography>
      </Box>
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;