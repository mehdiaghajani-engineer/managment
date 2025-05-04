// frontend/src/components/AddPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Alert, Box } from '@mui/material';

// مقدار پیش‌فرض تنظیمات صفحه
const initialConfig = `{
  "title": "My Dynamic Page",
  "sections": [
    {
      "type": "text",
      "title": "Introduction",
      "content": "Welcome to our dynamic page!"
    },
    {
      "type": "image",
      "src": "https://example.com/image.jpg",
      "alt": "Example image"
    },
    {
      "type": "form",
      "title": "Contact Us",
      "fields": [
        { "name": "fullName", "label": "Full Name", "type": "text" },
        { "name": "email", "label": "Email", "type": "text" },
        {
          "name": "inquiryType",
          "label": "Inquiry Type",
          "type": "select",
          "options": [
            { "label": "General", "value": "general" },
            { "label": "Support", "value": "support" }
          ]
        }
      ]
    }
  ]
}`;

const AddPage = () => {
  const [name, setName] = useState('');
  const [config, setConfig] = useState(initialConfig); // استفاده از مقدار پیش‌فرض
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // تابع اعتبارسنجی JSON
  const validateJSON = (jsonStr) => {
    try {
      JSON.parse(jsonStr);
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Page name is required.');
      return;
    }
    if (!validateJSON(config)) {
      setError('Config must be a valid JSON.');
      return;
    }
    setError('');
    try {
      const parsedConfig = JSON.parse(config);
      const res = await axios.post('http://localhost:5000/api/pages', { name, config: parsedConfig });
      setMessage(`Page "${res.data.name}" created successfully!`);
      setName('');
      setConfig(initialConfig);
    } catch (err) {
      console.error(err);
      setError('Error creating page.');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Add New Page
      </Typography>
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Page Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <TextField
          label="Page Config (JSON)"
          value={config}
          onChange={(e) => setConfig(e.target.value)}
          multiline
          rows={8}
          required
          helperText='Enter a valid JSON. For example: {"title": "My Page", "sections": [{"title": "Header", "content": "Welcome to my page"}]}'
        />
        <Button variant="contained" color="primary" type="submit">
          Create Page
        </Button>
      </Box>
    </Container>
  );
};

export default AddPage;
