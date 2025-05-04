// frontend/src/components/RoleSwitcher.js
import React, { useState, useContext } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { AuthContext } from '../context/AuthContext';

function RoleSwitcher() {
  const { role, login, logout } = useContext(AuthContext);
  const [openDialog, setOpenDialog] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleOpen = () => {
    setOpenDialog(true);
    setUsername('');
    setPassword('');
  };

  const handleClose = () => {
    setOpenDialog(false);
  };

  const handleLogin = async () => {
    const success = await login(username, password);
    if (!success) {
      alert('Login failed. Check username/password.');
    }
    setOpenDialog(false);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div>
      {role === 'guest' && (
        <Button variant="outlined" color="inherit" onClick={handleOpen}>
          Login
        </Button>
      )}
      {role !== 'guest' && (
        <Button variant="outlined" color="inherit" onClick={handleLogout}>
          Logout ({role})
        </Button>
      )}

      <Dialog open={openDialog} onClose={handleClose}>
        <DialogTitle>Login</DialogTitle>
        <DialogContent>
          <TextField
            label="Username"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mt: 1 }}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleLogin}>
            Login
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default RoleSwitcher;
