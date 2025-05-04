// frontend/src/components/RoleManagement.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  Divider
} from '@mui/material';
import axios from 'axios';

function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // State for adding a new role
  const [newRoleName, setNewRoleName] = useState('');
  const [newRolePermissions, setNewRolePermissions] = useState([]);

  // State for editing an existing role
  const [selectedRole, setSelectedRole] = useState(null);
  const [editRoleName, setEditRoleName] = useState('');
  const [editRolePermissions, setEditRolePermissions] = useState([]);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = () => {
    axios.get('http://localhost:5000/api/roles')
      .then((res) => setRoles(res.data))
      .catch((err) => setError('Error fetching roles'));
  };

  const fetchPermissions = () => {
    axios.get('http://localhost:5000/api/permissions')
      .then((res) => setPermissions(res.data))
      .catch((err) => setError('Error fetching permissions'));
  };

  // افزودن نقش جدید با مجوزهای انتخابی
  const handleAddRole = async () => {
    if (!newRoleName) return;
    try {
      const res = await axios.post('http://localhost:5000/api/roles', { name: newRoleName });
      const roleId = res.data.id;
      if (newRolePermissions.length > 0) {
        await axios.put(`http://localhost:5000/api/roles/${roleId}/permissions`, { permissions: newRolePermissions });
      }
      setSuccess('Role added successfully');
      fetchRoles();
      setNewRoleName('');
      setNewRolePermissions([]);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Error adding role');
    }
  };

  // انتخاب یک نقش برای ویرایش
  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setEditRoleName(role.name);
    setEditRolePermissions(role.Permissions ? role.Permissions.map(p => p.name) : []);
  };

  // تغییر انتخاب چک‌باکس در حالت ویرایش
  const handleEditCheckboxChange = (permName) => {
    if (editRolePermissions.includes(permName)) {
      setEditRolePermissions(editRolePermissions.filter(p => p !== permName));
    } else {
      setEditRolePermissions([...editRolePermissions, permName]);
    }
  };

  // به‌روزرسانی نقش انتخاب‌شده
  const handleUpdateRole = async () => {
    if (!selectedRole) return;
    try {
      // به‌روزرسانی نام نقش
      await axios.put(`http://localhost:5000/api/roles/${selectedRole.id}`, { name: editRoleName });
      // به‌روزرسانی مجوزهای نقش
      const updateRes = await axios.put(`http://localhost:5000/api/roles/${selectedRole.id}/permissions`, { permissions: editRolePermissions });
      const updatedRole = updateRes.data;
      // به‌روزرسانی state لیست نقش‌ها
      setRoles(prevRoles => prevRoles.map(r => (r.id === updatedRole.id ? updatedRole : r)));
      setSuccess('Role updated successfully');
      setSelectedRole(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Error updating role or role permissions');
    }
  };

  // حذف نقش
  const handleDeleteRole = async (roleId) => {
    try {
      await axios.delete(`http://localhost:5000/api/roles/${roleId}`);
      setSuccess('Role deleted successfully');
      fetchRoles();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Error deleting role');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Role Management</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      {/* فرم افزودن نقش جدید */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Add New Role</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Role Name"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            fullWidth
          />
          <Typography variant="subtitle1">Select Permissions:</Typography>
          <FormGroup>
            {permissions.map((perm) => (
              <FormControlLabel
                key={perm.id}
                control={
                  <Checkbox
                    checked={newRolePermissions.includes(perm.name)}
                    onChange={() => {
                      if (newRolePermissions.includes(perm.name)) {
                        setNewRolePermissions(newRolePermissions.filter(p => p !== perm.name));
                      } else {
                        setNewRolePermissions([...newRolePermissions, perm.name]);
                      }
                    }}
                  />
                }
                label={`${perm.name} ${perm.description ? `- ${perm.description}` : ''}`}
              />
            ))}
          </FormGroup>
          <Button variant="contained" onClick={handleAddRole}>Add Role</Button>
        </Box>
      </Paper>

      <Divider />

      {/* لیست نقش‌های موجود */}
      <Paper sx={{ p: 2, mb: 4 }}>
        {roles.map(role => (
          <Box key={role.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderBottom: '1px solid #ddd' }}>
            <Box>
              <Typography variant="subtitle1">{role.name}</Typography>
              {role.Permissions && role.Permissions.length > 0 && (
                <Typography variant="body2">
                  Permissions: {role.Permissions.map(p => p.name).join(', ')}
                </Typography>
              )}
            </Box>
            <Box>
              <Button variant="outlined" onClick={() => handleSelectRole(role)}>Edit</Button>
              <Button variant="outlined" color="error" onClick={() => handleDeleteRole(role.id)}>Delete</Button>
            </Box>
          </Box>
        ))}
        {roles.length === 0 && (
          <Typography align="center">No roles found.</Typography>
        )}
      </Paper>

      {/* فرم ویرایش نقش انتخاب شده */}
      {selectedRole && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Edit Role: {selectedRole.name}</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Role Name"
              value={editRoleName}
              onChange={(e) => setEditRoleName(e.target.value)}
              fullWidth
            />
            <Typography variant="subtitle1">Select Permissions:</Typography>
            <FormGroup>
              {permissions.map((perm) => (
                <FormControlLabel
                  key={perm.id}
                  control={
                    <Checkbox
                      checked={editRolePermissions.includes(perm.name)}
                      onChange={() => handleEditCheckboxChange(perm.name)}
                    />
                  }
                  label={`${perm.name} ${perm.description ? `- ${perm.description}` : ''}`}
                />
              ))}
            </FormGroup>
            <Button variant="contained" onClick={handleUpdateRole}>Save Changes</Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
}

export default RoleManagement;
