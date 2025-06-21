import React from 'react';
import { Container, Typography, Box } from '@mui/material';

function MoldAssignment() {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Mold Assignment
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body1">
          This section is for assigning molds to machines.
        </Typography>
      </Box>
    </Container>
  );
}

export default MoldAssignment;