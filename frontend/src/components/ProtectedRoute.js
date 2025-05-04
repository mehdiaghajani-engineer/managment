// frontend/src/components/ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

function ProtectedRoute() {
  // برای غیرفعال کردن محافظت، این متغیر را به true تغییر دهید
  const disableProtection = true;
  
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // اگر محافظت غیرفعال باشد، به صورت مستقیم Outlet را برگردانید
  if (disableProtection) {
    return <Outlet />;
  }

  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
