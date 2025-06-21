import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Grid, Card, CardContent, Typography, CircularProgress, Alert } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import Login from './Login';

// تعریف متادیتای حرفه‌ای دسترسی‌ها
export const dashboardPermissions = [
  {
    name: "view_dashboard",
    description: "Allows viewing the dashboard overview",
    group: "Dashboard",
  },
  {
    name: "manage_dashboard_data",
    description: "Allows managing dashboard data (e.g., editing metrics)",
    group: "Dashboard",
  },
];

// اضافه کردن متادیتا به آرایه سراسری
if (window.permissionsMetadata) {
  window.permissionsMetadata.push(dashboardPermissions);
}

function Dashboard() {
  const { token, role, loading: authLoading } = useContext(AuthContext);

  const [machines, setMachines] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const [machinesRes, inventoryRes] = await Promise.all([
          axios.get('http://localhost:5000/api/machines/Machines&Equipments'), // تغییر از MachinesAndMolds
          axios.get('http://localhost:5000/api/inventory')
        ]);
        setMachines(machinesRes.data);
        setInventory(inventoryRes.data);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Error fetching dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (authLoading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!token || role === 'guest') {
    return <Login />;
  }

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
      <CircularProgress />
    </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const totalMachines = machines.length;
  const totalInventory = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Dashboard Overview
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ backgroundColor: '#e3f2fd' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Machines</Typography>
              <Typography variant="h3">{totalMachines}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card sx={{ backgroundColor: '#ffebee' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Inventory Quantity</Typography>
              <Typography variant="h3">{totalInventory}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;