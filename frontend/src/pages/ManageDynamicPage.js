// frontend/src/pages/ManageDynamicPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DynamicPage from '../components/DynamicPage';
import { Container, Typography, Alert, TextField, Button, Box } from '@mui/material';

const ManageDynamicPage = ({ pageId }) => {
  const [pageConfig, setPageConfig] = useState(null);
  const [configText, setConfigText] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // دریافت تنظیمات صفحه از API
  useEffect(() => {
    console.log('Fetching page config for pageId:', pageId); // دیباگ برای چک کردن pageId
    if (!pageId) {
      setError('No page ID provided');
      return;
    }

    axios.get(`http://localhost:5000/api/pages/${pageId}`)
      .then(res => {
        console.log('Page config response:', res.data);
        setPageConfig(res.data.config);
        setConfigText(JSON.stringify(res.data.config, null, 2));
      })
      .catch(err => {
        console.error('Error fetching page configuration:', err.response || err);
        setError('Error fetching page configuration: ' + (err.response?.data?.error || 'Page not found'));
      });
  }, [pageId]);

  const handleSave = () => {
    let parsedConfig;
    try {
      parsedConfig = JSON.parse(configText);
    } catch (err) {
      setError('Invalid JSON configuration');
      return;
    }
    axios.put(`http://localhost:5000/api/pages/${pageId}`, { config: parsedConfig })
      .then(res => {
        setMessage('Configuration updated successfully!');
        setError('');
        setPageConfig(parsedConfig);
      })
      .catch(err => {
        console.error(err);
        setError('Error updating configuration: ' + (err.response?.data?.error || 'Server error'));
      });
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage Dynamic Page
      </Typography>
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Typography variant="h6">Edit Page Configuration (JSON)</Typography>
      <TextField
        multiline
        rows={10}
        fullWidth
        value={configText}
        onChange={(e) => setConfigText(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" color="primary" onClick={handleSave}>
        Save Configuration
      </Button>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Page Preview
        </Typography>
        {pageConfig ? (
          <DynamicPage config={pageConfig} />
        ) : (
          <Typography>Loading page preview...</Typography>
        )}
      </Box>
    </Container>
  );
};

export default ManageDynamicPage;