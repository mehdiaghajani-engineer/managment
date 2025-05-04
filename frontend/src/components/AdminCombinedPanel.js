// frontend/src/components/AdminCombinedPanel.js
import React, { useState } from 'react';
import { Container, Tabs, Tab, Box, Typography, Grid, Paper } from '@mui/material';
import UserManagement from './UserManagement';
import RoleManagement from './RoleManagement';
import AddPage from './AddPage';
import ManageDynamicPage from '../pages/ManageDynamicPage'; // تغییر نام از ManageDynamicForm به ManageDynamicPage
import DynamicPage from './DynamicPage'; // استفاده از کامپوننت DynamicPage
import { AdminUpdateProvider } from '../context/AdminUpdateContext';

const AdminCombinedPanel = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <AdminUpdateProvider>
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Admin Panel
        </Typography>
        <Tabs value={tabIndex} onChange={handleChange} centered>
          <Tab label="Users & Roles" />
          <Tab label="Page Management" />
        </Tabs>

        {tabIndex === 0 && (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    User Management
                  </Typography>
                  <UserManagement />
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Role Management
                  </Typography>
                  <RoleManagement />
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {tabIndex === 1 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Page Management
            </Typography>
            <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
              <AddPage />
            </Paper>
            <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
              <ManageDynamicPage pageId={1} />
            </Paper>
            <Paper elevation={3} sx={{ p: 3 }}>
              {/* برای تست پیش‌نمایش صفحه؛ در یک پروژه واقعی، این بخش می‌تواند داده واقعی دریافت کند */}
              <DynamicPage config={{ title: "Page Preview", sections: [] }} />
            </Paper>
          </Box>
        )}
      </Container>
    </AdminUpdateProvider>
  );
};

export default AdminCombinedPanel;
