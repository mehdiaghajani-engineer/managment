import React from 'react';
import { Container, Typography, Box } from '@mui/material';

function MaintenanceManagement() {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Maintenance Management
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body1">
          This section is for managing machine maintenance.
        </Typography>
      </Box>
    </Container>
  );
}

export default MaintenanceManagement;