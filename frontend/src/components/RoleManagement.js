import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, TextField, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, Box, FormGroup, FormControlLabel, Checkbox, IconButton, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import SettingsIcon from '@mui/icons-material/Settings';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function RoleManagement() {
  const { token } = useContext(AuthContext);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [permissionGroups, setPermissionGroups] = useState({});
  const [newRole, setNewRole] = useState({ name: '', description: '', permissions: [] });
  const [selectedRole, setSelectedRole] = useState(null);
  const [editRole, setEditRole] = useState({ name: '', description: '', permissions: [] });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchRoles = () => {
    axios.get('http://localhost:5000/api/roles', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        setRoles(response.data);
      })
      .catch(err => {
        console.error('Fetch roles error:', err.response?.data || err.message);
        setError('Error fetching roles: ' + (err.response?.data?.message || err.message));
      });
  };

  const fetchPermissions = () => {
    axios.get('http://localhost:5000/api/permissions', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        const perms = response.data;
        setPermissions(perms);
        const grouped = {};
        perms.forEach(perm => {
          const group = perm.group || 'Ungrouped';
          if (!grouped[group]) grouped[group] = [];
          grouped[group].push(perm);
        });
        setPermissionGroups(grouped);
      })
      .catch(err => {
        console.error('Fetch permissions error:', err.response?.data || err.message);
        setError('Error fetching permissions: ' + (err.response?.data?.message || err.message));
      });
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [token]);

  const handleAddRole = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/roles', {
        name: newRole.name,
        description: newRole.description,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const roleId = res.data.id;
      if (newRole.permissions.length > 0) {
        await axios.put(`http://localhost:5000/api/roles/${roleId}/permissions`, {
          permissions: newRole.permissions,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setSuccess('Role created successfully');
      fetchRoles();
      setNewRole({ name: '', description: '', permissions: [] });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Add role error:', err.response?.data || err.message);
      setError('Error adding role: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteRole = async (roleId) => {
    try {
      await axios.delete(`http://localhost:5000/api/roles/${roleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Role deleted successfully');
      fetchRoles();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Delete role error:', err.response?.data || err.message);
      setError('Error deleting role: ' + (err.response?.data?.message || err.message));
    }
  };

  const handlePermissionChange = (permName, isNewRole = true) => {
    if (isNewRole) {
      setNewRole(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permName)
          ? prev.permissions.filter(p => p !== permName)
          : [...prev.permissions, permName],
      }));
    } else {
      setEditRole(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permName)
          ? prev.permissions.filter(p => p !== permName)
          : [...prev.permissions, permName],
      }));
    }
  };

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setEditRole({
      name: role.name,
      description: role.description || '',
      permissions: role.Permissions ? role.Permissions.map(p => p.name) : [],
    });
  };

  const handleUpdateRole = async () => {
    if (!selectedRole) return;
    try {
      await axios.put(`http://localhost:5000/api/roles/${selectedRole.id}`, {
        name: editRole.name,
        description: editRole.description,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await axios.put(`http://localhost:5000/api/roles/${selectedRole.id}/permissions`, {
        permissions: editRole.permissions,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Role updated successfully');
      fetchRoles();
      setSelectedRole(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Update role error:', err.response?.data || err.message);
      setError('Error updating role: ' + (err.response?.data?.message || err.message));
    }
  };

  // تابع برای انتخاب آیکون بر اساس نام گروه
  const getGroupIcon = (group) => {
    switch (group.toLowerCase()) {
      case 'dashboard':
        return <DashboardIcon sx={{ mr: 1, color: '#1976d2' }} />;
      case 'inventory':
        return <InventoryIcon sx={{ mr: 1, color: '#388e3c' }} />;
      default:
        return <SettingsIcon sx={{ mr: 1, color: '#757575' }} />;
    }
  };

  // مرتب‌سازی گروه‌ها به ترتیب الفبا
  const sortedGroups = Object.keys(permissionGroups).sort();

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        Role Management
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>
          Add New Role
        </Typography>
        <Box component="form" onSubmit={handleAddRole} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Role Name"
            variant="outlined"
            value={newRole.name}
            onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
            required
          />
          <TextField
            label="Description"
            variant="outlined"
            value={newRole.description}
            onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
          />
          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
            Select Permissions:
          </Typography>
          {sortedGroups.map(group => (
            <Accordion key={group} sx={{ mb: 1, borderRadius: 1, boxShadow: 2 }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  bgcolor: '#f5f5f5',
                  '&:hover': { bgcolor: '#e0e0e0' },
                  borderRadius: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {getGroupIcon(group)}
                  <Typography sx={{ fontWeight: 'medium' }}>
                    {group} ({permissionGroups[group].length} Permissions)
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <FormGroup>
                  {permissionGroups[group].map(perm => (
                    <FormControlLabel
                      key={perm.id}
                      control={
                        <Checkbox
                          checked={newRole.permissions.includes(perm.name)}
                          onChange={() => handlePermissionChange(perm.name)}
                          sx={{
                            color: perm.name.includes('view') ? 'green' : perm.name.includes('edit') ? 'orange' : 'red',
                            '&.Mui-checked': {
                              color: perm.name.includes('view') ? 'green' : perm.name.includes('edit') ? 'orange' : 'red',
                            },
                          }}
                        />
                      }
                      label={`${perm.name} ${perm.description ? `- ${perm.description}` : ''}`}
                    />
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>
          ))}
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Add Role
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h6" gutterBottom align="center" sx={{ fontWeight: 'medium' }}>
          Role List
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">ID</TableCell>
                <TableCell align="center">Name</TableCell>
                <TableCell align="center">Description</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.length > 0 ? (
                roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell align="center">{role.id}</TableCell>
                    <TableCell align="center">{role.name}</TableCell>
                    <TableCell align="center">{role.description || 'N/A'}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => handleSelectRole(role)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteRole(role.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell align="center" colSpan={4}>
                    No roles found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {selectedRole && (
        <Paper sx={{ p: 3, mt: 4, borderRadius: 2, boxShadow: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>
            Edit Role: {selectedRole.name}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Role Name"
              variant="outlined"
              value={editRole.name}
              onChange={(e) => setEditRole({ ...editRole, name: e.target.value })}
              required
            />
            <TextField
              label="Description"
              variant="outlined"
              value={editRole.description}
              onChange={(e) => setEditRole({ ...editRole, description: e.target.value })}
            />
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
              Select Permissions:
            </Typography>
            {sortedGroups.map(group => (
              <Accordion key={group} sx={{ mb: 1, borderRadius: 1, boxShadow: 2 }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    bgcolor: '#f5f5f5',
                    '&:hover': { bgcolor: '#e0e0e0' },
                    borderRadius: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getGroupIcon(group)}
                    <Typography sx={{ fontWeight: 'medium' }}>
                      {group} ({permissionGroups[group].length} Permissions)
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <FormGroup>
                    {permissionGroups[group].map(perm => (
                      <FormControlLabel
                        key={perm.id}
                        control={
                          <Checkbox
                            checked={editRole.permissions.includes(perm.name)}
                            onChange={() => handlePermissionChange(perm.name, false)}
                            sx={{
                              color: perm.name.includes('view') ? 'green' : perm.name.includes('edit') ? 'orange' : 'red',
                              '&.Mui-checked': {
                                color: perm.name.includes('view') ? 'green' : perm.name.includes('edit') ? 'orange' : 'red',
                              },
                            }}
                          />
                        }
                        label={`${perm.name} ${perm.description ? `- ${perm.description}` : ''}`}
                      />
                    ))}
                  </FormGroup>
                </AccordionDetails>
              </Accordion>
            ))}
            <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleUpdateRole}>
              Save Changes
            </Button>
          </Box>
        </Paper>
      )}

      <Paper sx={{ p: 3, mt: 4, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h6" gutterBottom align="center" sx={{ fontWeight: 'medium' }}>
          Permissions List
        </Typography>
        {sortedGroups.map(group => (
          <Accordion key={group} sx={{ mb: 1, borderRadius: 1, boxShadow: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                bgcolor: '#f5f5f5',
                '&:hover': { bgcolor: '#e0e0e0' },
                borderRadius: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {getGroupIcon(group)}
                <Typography sx={{ fontWeight: 'medium' }}>
                  {group} ({permissionGroups[group].length} Permissions)
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">ID</TableCell>
                      <TableCell align="center">Name</TableCell>
                      <TableCell align="center">Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {permissionGroups[group].map(permission => (
                      <TableRow key={permission.id}>
                        <TableCell align="center">{permission.id}</TableCell>
                        <TableCell align="center">{permission.name}</TableCell>
                        <TableCell align="center">{permission.description || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
    </Container>
  );
}

export default RoleManagement;