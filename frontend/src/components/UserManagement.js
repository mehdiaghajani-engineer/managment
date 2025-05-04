// frontend/src/components/UserManagement.js
import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Box,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { AdminUpdateContext } from '../context/AdminUpdateContext'; // Context جدید

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', roleName: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // استفاده از updateCounter از AdminUpdateContext
  const { updateCounter } = useContext(AdminUpdateContext);

  const fetchUsers = () => {
    axios.get('http://localhost:5000/api/admin/users')
      .then(response => {
        setUsers(response.data);
        setError('');
      })
      .catch(err => {
        console.error(err);
        setError('Error fetching users');
      });
  };

  // هر زمان updateCounter تغییر کرد، لیست کاربران بروزرسانی شود
  useEffect(() => {
    fetchUsers();
  }, [updateCounter]);

  // همچنین فراخوانی اولیه
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/users', newUser);
      setSuccess('User created successfully');
      fetchUsers();
      setNewUser({ username: '', password: '', roleName: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Error adding user');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
      setSuccess('User deleted successfully');
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Error deleting user');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        User Management
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      {/* فرم افزودن کاربر جدید */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add New User
        </Typography>
        <Box
          component="form"
          onSubmit={handleAddUser}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <TextField
            label="Username"
            variant="outlined"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            required
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            required
          />
          <TextField
            label="Role"
            variant="outlined"
            value={newUser.roleName}
            onChange={(e) => setNewUser({ ...newUser, roleName: e.target.value })}
            placeholder="e.g. admin or operator"
            required
          />
          <Button type="submit" variant="contained" color="primary">
            Add User
          </Button>
        </Box>
      </Paper>

      {/* لیست کاربران */}
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h6" gutterBottom align="center">
          User List
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">ID</TableCell>
                <TableCell align="center">Username</TableCell>
                <TableCell align="center">Current Role</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell align="center">{user.id}</TableCell>
                    <TableCell align="center">{user.username}</TableCell>
                    <TableCell align="center">{user.Role ? user.Role.name : 'N/A'}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => handleDeleteUser(user.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell align="center" colSpan={4}>
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
}

export default UserManagement;
