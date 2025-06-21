import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, CircularProgress, TextField, MenuItem, Button } from '@mui/material';

// کامپوننت فرم داینامیک داخلی که برای بخش‌های فرم استفاده می‌شود
const DynamicForm = ({ config, onSubmit }) => {
  const [values, setValues] = React.useState({});

  const handleChange = (e) => {
    setValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(values);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {config.title && (
        <Typography variant="h6" gutterBottom>
          {config.title}
        </Typography>
      )}
      {config.fields && config.fields.map((field, index) => {
        switch (field.type) {
          case 'text':
            return (
              <TextField
                key={index}
                label={field.label}
                name={field.name}
                value={values[field.name] || ''}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            );
          case 'select':
            return (
              <TextField
                key={index}
                select
                label={field.label}
                name={field.name}
                value={values[field.name] || ''}
                onChange={handleChange}
                fullWidth
                margin="normal"
              >
                {field.options && field.options.map((option, idx) => (
                  <MenuItem key={idx} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            );
          // سایر انواع فیلد می‌تواند اضافه شود
          default:
            return null;
        }
      })}
      <Button variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
        Submit
      </Button>
    </Box>
  );
};

const DynamicPage = () => {
  const { route } = useParams(); // گرفتن route از URL
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPageData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`http://localhost:5000/api/pages/route/${route}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setConfig(res.data.config);
      } catch (err) {
        console.error('Error fetching page data:', err);
        setError('Failed to load page: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [route]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error" sx={{ mt: 4, textAlign: 'center' }}>{error}</Typography>;
  if (!config) return <Typography sx={{ mt: 4, textAlign: 'center' }}>No content available</Typography>;

  return (
    <Box sx={{ p: 2 }}>
      {/* عنوان صفحه */}
      <Typography variant="h4" gutterBottom>
        {config.title || 'Untitled Page'}
      </Typography>
      
      {/* رندر هر بخش بر اساس نوع */}
      {config.sections && config.sections.map((section, idx) => {
        switch (section.type) {
          case 'text':
            return (
              <Box key={idx} sx={{ mb: 2 }}>
                {section.title && (
                  <Typography variant="h6" gutterBottom>
                    {section.title}
                  </Typography>
                )}
                {section.content && (
                  <Typography variant="body1">
                    {section.content}
                  </Typography>
                )}
              </Box>
            );
          case 'image':
            return (
              <Box key={idx} sx={{ mb: 2 }}>
                <img
                  src={section.src}
                  alt={section.alt || 'Dynamic Image'}
                  style={{ maxWidth: '100%' }}
                />
              </Box>
            );
          case 'form':
            return (
              <Box key={idx} sx={{ mb: 2 }}>
                <DynamicForm 
                  config={section} 
                  onSubmit={(values) => console.log('Form submitted:', values)} 
                />
              </Box>
            );
          default:
            return (
              <Typography key={idx} variant="body2" color="error">
                Unknown section type: {section.type}
              </Typography>
            );
        }
      })}
    </Box>
  );
};

export default DynamicPage;