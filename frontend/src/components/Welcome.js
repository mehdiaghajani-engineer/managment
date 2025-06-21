import React from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BuildIcon from '@mui/icons-material/Build';
import InventoryIcon from '@mui/icons-material/Inventory';
import HistoryIcon from '@mui/icons-material/History';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #1e3a8a, #4b5563)',
        backgroundSize: '200% 200%',
        animation: 'gradientMove 15s ease infinite',
        '@keyframes gradientMove': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        p: 4,
        color: '#ffffff',
      }}
    >
      {/* هدر با انیمیشن */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <Typography
          variant="h2"
          align="center"
          sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 800, mb: 2 }}
        >
          Your Management Hub
        </Typography>
        <Typography
          variant="h6"
          align="center"
          sx={{ fontFamily: '"Inter", sans-serif', mb: 4, opacity: 0.9 }}
        >
          Welcome aboard, admin! Let’s optimize your workflow.
        </Typography>
      </motion.div>

      {/* بخش Quick Actions با کاشی‌های شیک */}
      <Box sx={{ flexGrow: 1, mt: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
            >
              <Card
                sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 16,
                  color: '#ffffff',
                  textAlign: 'center',
                  p: 3,
                  height: '100%',
                  transition: 'all 0.3s',
                }}
              >
                <CardContent>
                  <DashboardIcon sx={{ fontSize: 50, mb: 2, color: '#22c55e' }} />
                  <Typography variant="h6" sx={{ fontFamily: '"Inter", sans-serif', mb: 2 }}>
                    Dashboard Overview
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/dashboard')}
                    sx={{
                      bgcolor: '#22c55e',
                      '&:hover': { bgcolor: '#16a34a' },
                      borderRadius: 8,
                    }}
                  >
                    Enter Dashboard
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
            >
              <Card
                sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 16,
                  color: '#ffffff',
                  textAlign: 'center',
                  p: 3,
                  height: '100%',
                  transition: 'all 0.3s',
                }}
              >
                <CardContent>
                  <BuildIcon sx={{ fontSize: 50, mb: 2, color: '#3b82f6' }} />
                  <Typography variant="h6" sx={{ fontFamily: '"Inter", sans-serif', mb: 2 }}>
                    Machine Management
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/machines')}
                    sx={{
                      bgcolor: '#3b82f6',
                      '&:hover': { bgcolor: '#2563eb' },
                      borderRadius: 8,
                    }}
                  >
                    Manage Machines
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
            >
              <Card
                sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 16,
                  color: '#ffffff',
                  textAlign: 'center',
                  p: 3,
                  height: '100%',
                  transition: 'all 0.3s',
                }}
              >
                <CardContent>
                  <InventoryIcon sx={{ fontSize: 50, mb: 2, color: '#f97316' }} />
                  <Typography variant="h6" sx={{ fontFamily: '"Inter", sans-serif', mb: 2 }}>
                    Inventory Check
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/inventory')}
                    sx={{
                      bgcolor: '#f97316',
                      '&:hover': { bgcolor: '#ea580c' },
                      borderRadius: 8,
                    }}
                  >
                    Check Inventory
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
            >
              <Card
                sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 16,
                  color: '#ffffff',
                  textAlign: 'center',
                  p: 3,
                  height: '100%',
                  transition: 'all 0.3s',
                }}
              >
                <CardContent>
                  <HistoryIcon sx={{ fontSize: 50, mb: 2, color: '#a855f7' }} />
                  <Typography variant="h6" sx={{ fontFamily: '"Inter", sans-serif', mb: 2 }}>
                    Production History
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/production-history')}
                    sx={{
                      bgcolor: '#a855f7',
                      '&:hover': { bgcolor: '#9333ea' },
                      borderRadius: 8,
                    }}
                  >
                    View History
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Box>

      {/* فوتر کوچک */}
      <Box sx={{ py: 2, textAlign: 'center', mt: 4 }}>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          © 2025 Management App. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Welcome;