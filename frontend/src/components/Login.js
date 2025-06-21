import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Box, TextField, Button, Typography, Container, IconButton, InputAdornment, Link, Switch, CircularProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import EmailIcon from '@mui/icons-material/Email';
import SettingsIcon from '@mui/icons-material/Settings';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleThemeToggle = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDarkMode
          ? 'linear-gradient(135deg, #1f2937, #4b5563, #1f2937)'
          : 'linear-gradient(135deg, #1e3a8a, #e5e7eb, #1e3a8a)',
        backgroundSize: '200% 200%',
        animation: 'gradientMove 15s ease infinite',
        '@keyframes gradientMove': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* سوئیچ حالت تیره/روشن */}
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <Switch
          checked={isDarkMode}
          onChange={handleThemeToggle}
          color="default"
          sx={{
            '& .MuiSwitch-thumb': { backgroundColor: isDarkMode ? '#ffffff' : '#1e3a8a' },
            '& .MuiSwitch-track': { backgroundColor: isDarkMode ? '#4b5563' : '#e5e7eb' },
          }}
        />
      </Box>

      <Container maxWidth="xs">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <Box
            sx={{
              backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              p: 4,
              textAlign: 'center',
              position: 'relative',
            }}
          >
            {/* لوگو و شعار */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <SettingsIcon sx={{ fontSize: 32, color: isDarkMode ? '#ffffff' : '#1e3a8a', mr: 1 }} />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: isDarkMode ? '#ffffff' : '#1e3a8a',
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                Management Application
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: isDarkMode ? '#d1d5db' : '#64748b',
                mb: 3,
                fontFamily: '"Inter", sans-serif',
              }}
            >
              Smart Business Management
            </Typography>

            {/* فرم ورود */}
            <Box component="form" onSubmit={handleSubmit}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <TextField
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: isDarkMode ? '#d1d5db' : '#64748b' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiInputBase-root': { borderRadius: 2, color: isDarkMode ? '#ffffff' : '#000000' },
                    '& .MuiInputLabel-root': {
                      fontFamily: '"Inter", sans-serif',
                      color: isDarkMode ? '#d1d5db' : '#64748b',
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: isDarkMode ? '#4b5563' : '#e5e7eb' },
                      '&:hover fieldset': { borderColor: isDarkMode ? '#ffffff' : '#1e3a8a' },
                    },
                  }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <TextField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: isDarkMode ? '#d1d5db' : '#64748b' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleTogglePassword} edge="end">
                          {showPassword ? (
                            <VisibilityOff sx={{ color: isDarkMode ? '#d1d5db' : '#64748b' }} />
                          ) : (
                            <Visibility sx={{ color: isDarkMode ? '#d1d5db' : '#64748b' }} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiInputBase-root': { borderRadius: 2, color: isDarkMode ? '#ffffff' : '#000000' },
                    '& .MuiInputLabel-root': {
                      fontFamily: '"Inter", sans-serif',
                      color: isDarkMode ? '#d1d5db' : '#64748b',
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: isDarkMode ? '#4b5563' : '#e5e7eb' },
                      '&:hover fieldset': { borderColor: isDarkMode ? '#ffffff' : '#1e3a8a' },
                    },
                  }}
                />
              </motion.div>

              {/* پیام خطا */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Typography
                      color="error"
                      variant="body2"
                      sx={{ mt: 1, mb: 2, fontFamily: '"Inter", sans-serif' }}
                    >
                      {error}
                    </Typography>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* دکمه ورود */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isLoading}
                  sx={{
                    mt: 2,
                    mb: 2,
                    py: 1.5,
                    borderRadius: 2,
                    backgroundColor: '#22c55e', // سبز نئونی
                    '&:hover': {
                      backgroundColor: '#16a34a',
                    },
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.4)' },
                      '70%': { boxShadow: '0 0 0 10px rgba(34, 197, 94, 0)' },
                      '100%': { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0)' },
                    },
                    fontFamily: '"Inter", sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  {isLoading ? (
                    <>
                      <CircularProgress size={20} color="inherit" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </motion.div>

              {/* گزینه‌های ورود بیشتر */}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  startIcon={<GoogleIcon />}
                  sx={{
                    flex: 1,
                    mr: 1,
                    borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
                    color: isDarkMode ? '#d1d5db' : '#64748b',
                    fontFamily: '"Inter", sans-serif',
                    '&:hover': { borderColor: isDarkMode ? '#ffffff' : '#1e3a8a' },
                  }}
                >
                  Google
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<EmailIcon />}
                  sx={{
                    flex: 1,
                    ml: 1,
                    borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
                    color: isDarkMode ? '#d1d5db' : '#64748b',
                    fontFamily: '"Inter", sans-serif',
                    '&:hover': { borderColor: isDarkMode ? '#ffffff' : '#1e3a8a' },
                  }}
                >
                  Email
                </Button>
              </Box>

              {/* لینک فراموشی رمز */}
              <Link
                href="#"
                variant="body2"
                sx={{
                  display: 'block',
                  mt: 2,
                  color: isDarkMode ? '#d1d5db' : '#1e3a8a',
                  fontFamily: '"Inter", sans-serif',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Forgot Password?
              </Link>
            </Box>

            {/* لینک درباره ما */}
            <Typography
              variant="body2"
              sx={{
                mt: 2,
                color: isDarkMode ? '#d1d5db' : '#64748b',
                fontFamily: '"Inter", sans-serif',
              }}
            >
              <Link
                href="#"
                sx={{
                  color: isDarkMode ? '#d1d5db' : '#1e3a8a',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                About Us
              </Link>
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Login;