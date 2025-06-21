import React, { useContext, useState, useEffect } from 'react';
import { Container, Tabs, Tab, Box, Typography, Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow, Checkbox, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import UserManagement from './UserManagement';
import RoleManagement from './RoleManagement';
import AddPage from './AddPage';
import ManageDynamicPage from '../pages/ManageDynamicPage';
import DynamicPage from './DynamicPage';
import { AdminUpdateProvider, AdminUpdateContext } from '../context/AdminUpdateContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const AdminCombinedPanel = () => {
  const { permissions, role, updatePermissions } = useContext(AuthContext);
  const { triggerUpdate } = useContext(AdminUpdateContext);
  const [tabIndex, setTabIndex] = useState(0);
  const [roles, setRoles] = useState([]);
  const [rolePermissions, setRolePermissions] = useState({});
  const [openDialog, setOpenDialog] = useState(false);

  // دریافت لیست المان‌ها از App.js
  const availableElements = window.elements || []; // فرض می‌کنیم App.js این رو به window اضافه کنه

  useEffect(() => {
    const fetchRolesAndPermissions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/roles', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const fetchedRoles = response.data.roles || [];
        setRoles(fetchedRoles);

        const permissionsData = {};
        for (const r of fetchedRoles) {
          const roleResponse = await axios.get(`http://localhost:5000/api/roles/${r}/permissions`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          permissionsData[r] = roleResponse.data.permissions || [];
        }
        setRolePermissions(permissionsData);
      } catch (err) {
        console.error('Error fetching roles and permissions:', err);
      }
    };

    if (role === 'admin') {
      fetchRolesAndPermissions();
    }
  }, [role]);

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handlePermissionChange = (role, element) => (event) => {
    const updatedPermissions = { ...rolePermissions };
    if (event.target.checked) {
      updatedPermissions[role] = [...(updatedPermissions[role] || []), element];
    } else {
      updatedPermissions[role] = (updatedPermissions[role] || []).filter((p) => p !== element);
    }
    setRolePermissions(updatedPermissions);
  };

  const handleSavePermissions = async () => {
    try {
      for (const r of Object.keys(rolePermissions)) {
        await axios.post(
          `http://localhost:5000/api/roles/${r}/permissions`,
          { permissions: rolePermissions[r] },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
      }
      await updatePermissions(rolePermissions[role] || []);
      triggerUpdate();
      setOpenDialog(false);
    } catch (err) {
      console.error('Error saving permissions:', err);
    }
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
          <Tab label="Access Management" />
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
              <DynamicPage config={{ title: "Page Preview", sections: [] }} />
            </Paper>
          </Box>
        )}

        {tabIndex === 2 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Access Management
            </Typography>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Element</TableCell>
                    {roles.map((r) => (
                      <TableCell key={r}>{r}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {availableElements.map((element) => (
                    <TableRow key={element}>
                      <TableCell>{element}</TableCell>
                      {roles.map((r) => (
                        <TableCell key={`${element}-${r}`}>
                          <Checkbox
                            checked={rolePermissions[r]?.includes(element) || false}
                            onChange={handlePermissionChange(r, element)}
                            disabled={role !== 'admin'}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button
                variant="contained"
                onClick={() => setOpenDialog(true)}
                sx={{ mt: 2 }}
                disabled={role !== 'admin'}
              >
                Save Permissions
              </Button>
            </Paper>
          </Box>
        )}

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Confirm Changes</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to save these permissions?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSavePermissions} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AdminUpdateProvider>
  );
};

export default AdminCombinedPanel;