import React, { useState } from 'react';
import { Container, Typography, Box, TextField, FormControl, InputLabel, Select, MenuItem, Grid, Card, CardContent, CardActions, Button } from '@mui/material';
import { Link } from 'react-router-dom'; // ایمپورت Link
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// ثبت المان‌های Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

// داده‌های سخت‌کدشده برای ماشین‌ها
const machinesData = [
  { id: 1, name: 'Machine 1', currentMold: 'Mold A', startDate: '1404/03/01', cycleTime: '30s', status: 'Operational' },
  { id: 2, name: 'Machine 2', currentMold: 'Mold B', startDate: '1404/03/02', cycleTime: '45s', status: 'Maintenance Required' },
  { id: 3, name: 'Machine 3', currentMold: 'Mold C', startDate: '1404/03/03', cycleTime: '25s', status: 'Out of Service' },
  { id: 4, name: 'Machine 4', currentMold: 'Mold D', startDate: '1404/03/04', cycleTime: '35s', status: 'Idle' },
];

// محاسبه داده‌ها برای چارت
const statusCount = machinesData.reduce((acc, machine) => {
  acc[machine.status] = (acc[machine.status] || 0) + 1;
  return acc;
}, {});

const chartData = {
  labels: Object.keys(statusCount),
  datasets: [
    {
      label: 'Machine Status',
      data: Object.values(statusCount),
      backgroundColor: [
        'rgba(75, 192, 192, 0.6)',  // Operational - سبز
        'rgba(255, 206, 86, 0.6)',  // Maintenance Required - زرد
        'rgba(255, 99, 132, 0.6)',  // Out of Service - قرمز
        'rgba(128, 128, 128, 0.6)', // Idle - خاکستری
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(128, 128, 128, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Machine Status Distribution',
    },
  },
};

function MachinesDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // فیلتر کردن ماشین‌ها
  const filteredMachines = machinesData.filter((machine) => {
    const matchesSearch = machine.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || machine.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Container sx={{ mt: 4 }}>
      {/* هدر */}
      <Typography variant="h4" gutterBottom>
        Machines Status Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        Overview of all machines and their current status.
      </Typography>

      {/* فیلتر و جستجو */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <TextField
          label="Search by Machine Name"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1 }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Filter by Status"
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Operational">Operational</MenuItem>
            <MenuItem value="Maintenance Required">Maintenance Required</MenuItem>
            <MenuItem value="Out of Service">Out of Service</MenuItem>
            <MenuItem value="Idle">Idle</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* چارت */}
      <Box sx={{ maxWidth: 400, mx: 'auto', mb: 4 }}>
        <Pie data={chartData} options={chartOptions} />
      </Box>

      {/* کارت‌ها */}
      <Grid container spacing={3}>
        {filteredMachines.map((machine) => (
          <Grid item xs={12} sm={6} md={4} key={machine.id}>
            <Card
              sx={{
                border: 1,
                borderColor:
                  machine.status === 'Operational'
                    ? 'success.main'
                    : machine.status === 'Maintenance Required'
                    ? 'warning.main'
                    : machine.status === 'Out of Service'
                    ? 'error.main'
                    : 'grey.500',
              }}
            >
              <CardContent>
                <Typography variant="h6">{machine.name}</Typography>
                <Typography color="textSecondary">
                  Current Mold: {machine.currentMold}
                </Typography>
                <Typography color="textSecondary">
                  Start Date: {machine.startDate}
                </Typography>
                <Typography color="textSecondary">
                  Cycle Time: {machine.cycleTime}
                </Typography>
                <Typography
                  color={
                    machine.status === 'Operational'
                      ? 'success.main'
                      : machine.status === 'Maintenance Required'
                      ? 'warning.main'
                      : machine.status === 'Out of Service'
                      ? 'error.main'
                      : 'grey.500'
                  }
                >
                  Status: {machine.status}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  component={Link}
                  to="/machines/mold-assignment"
                >
                  Assign Mold
                </Button>
                <Button
                  size="small"
                  color="secondary"
                  component={Link}
                  to="/machines/maintenance"
                >
                  Maintenance
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default MachinesDashboard;