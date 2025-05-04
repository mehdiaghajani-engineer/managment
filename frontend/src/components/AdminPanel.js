// frontend/src/components/AdminPanel.js
import React, { useState } from 'react';
import { Container, Tabs, Tab, Box, Typography } from '@mui/material';
import UserManagement from './UserManagement';
import RoleManagement from './RoleManagement';
import AddPage from './AddPage';       // کامپوننت اضافه کردن صفحه جدید
import PageList from './PageList';     // (اختیاری) کامپوننت لیست صفحات

function AdminPanel() {
  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Admin Panel
      </Typography>
      <Tabs value={tabIndex} onChange={handleChange} centered>
        <Tab label="User Management" />
        <Tab label="Role Management" />
        <Tab label="Page Management" />
      </Tabs>
      <Box sx={{ mt: 2 }}>
        {tabIndex === 0 && <UserManagement />}
        {tabIndex === 1 && <RoleManagement />}
        {tabIndex === 2 && (
          <>
            <AddPage />
            <PageList />
          </>
        )}
      </Box>
    </Container>
  );
}

export default AdminPanel;
