import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import {
  Container,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton as IconButtonMui,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { AuthContext } from '../context/AuthContext';

const AddPage = () => {
  const { token, role } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('My Dynamic Page');
  const [sections, setSections] = useState([]);
  const [pages, setPages] = useState([]);
  const [editPage, setEditPage] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);

  const fetchPages = async () => {
    try {
      console.log('Fetching pages with token:', token);
      const res = await axios.get('http://localhost:5000/api/pages', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPages(res.data);
    } catch (err) {
      console.error('Fetch pages error:', err.response);
      setError('Failed to fetch pages: ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    if (role === 'admin') {
      fetchPages();
    }
  }, [token, role]);

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage('');
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  const handleAddSection = () => {
    setSections([...sections, { type: 'text', title: '', content: '', src: '', alt: '', fields: [] }]);
  };

  const handleSectionChange = (index, field, value) => {
    const updatedSections = [...sections];
    updatedSections[index][field] = value;
    setSections(updatedSections);
  };

  const handleAddField = (sectionIndex) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].fields.push({ name: '', label: '', type: 'text', options: [] });
    setSections(updatedSections);
  };

  const handleFieldChange = (sectionIndex, fieldIndex, field, value) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].fields[fieldIndex][field] = value;
    setSections(updatedSections);
  };

  const handleRemoveField = (sectionIndex, fieldIndex) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].fields = updatedSections[sectionIndex].fields.filter((_, i) => i !== fieldIndex);
    setSections(updatedSections);
  };

  const handleRemoveSection = (index) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (role !== 'admin') {
      setError('Only admins can add pages.');
      return;
    }
    if (!name.trim()) {
      setError('Page name is required.');
      return;
    }
    if (!title.trim()) {
      setError('Page title is required.');
      return;
    }

    // ساخت route از روی name
    const route = `/${name.toLowerCase().replace(/\s+/g, '-')}`;
    
    // گرفتن userId از توکن
    let createdBy = 1; // مقدار پیش‌فرض
    if (token) {
      try {
        const decoded = jwtDecode(token);
        createdBy = decoded.userId || createdBy;
      } catch (err) {
        console.error('Error decoding token:', err);
      }
    }

    const config = { title, sections };
    const dataToSend = { name, route, config, createdBy };
    console.log('Token:', token);
    console.log('Data being sent:', dataToSend);
    try {
      const res = await axios.post('http://localhost:5000/api/pages', dataToSend, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPages([...pages, res.data]);
      setMessage(`Page "${res.data.name}" created successfully!`);
      setName('');
      setTitle('My Dynamic Page');
      setSections([]);
    } catch (err) {
      console.error('Create page error:', err.response);
      setError('Error creating page: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditPage = async () => {
    if (!editPage.name.trim() || !editPage.config.title.trim()) {
      setError('Page name and title are required.');
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/api/pages/${editPage.id}`,
        { name: editPage.name, config: editPage.config },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPages(pages.map((p) => (p.id === editPage.id ? res.data : p)));
      setMessage(`Page "${res.data.name}" updated successfully!`);
      setEditPage(null);
      setOpenEditDialog(false);
    } catch (err) {
      setError('Error updating page: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeletePage = async (id) => {
    try {
      const res = await axios.delete(`http://localhost:5000/api/pages/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPages(pages.filter((p) => p.id !== id));
      setMessage('Page deleted successfully!');
    } catch (err) {
      setError('Error deleting page: ' + (err.response?.data?.message || err.message));
    }
  };

  const renderPreview = () => {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h4">{title}</Typography>
        {sections.map((section, index) => (
          <Box key={index} sx={{ mt: 2 }}>
            <Typography variant="h6">{section.title}</Typography>
            {section.type === 'text' && <Typography>{section.content}</Typography>}
            {section.type === 'image' && (
              <img src={section.src} alt={section.alt} style={{ maxWidth: '100%' }} />
            )}
            {section.type === 'form' && (
              <Box>
                {section.fields.map((field, fieldIndex) => (
                  <Box key={fieldIndex} sx={{ mb: 1 }}>
                    <Typography>{field.label}</Typography>
                    {field.type === 'text' && <TextField disabled />}
                    {field.type === 'select' && (
                      <Select disabled>
                        {field.options.map((option, optIndex) => (
                          <MenuItem key={optIndex} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        ))}
      </Box>
    );
  };

  if (role !== 'admin') {
    return <Typography>Access denied. Only admins can view this page.</Typography>;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Page Management
      </Typography>

      {/* فرم اضافه کردن صفحه جدید */}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
        <TextField
          label="Page Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <TextField
          label="Page Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Typography variant="h6">Sections</Typography>
        {sections.map((section, index) => (
          <Box key={index} sx={{ border: '1px solid #ddd', p: 2, mb: 2, borderRadius: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={section.type}
                onChange={(e) => handleSectionChange(index, 'type', e.target.value)}
              >
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="image">Image</MenuItem>
                <MenuItem value="form">Form</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Section Title"
              value={section.title}
              onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            {section.type === 'text' && (
              <TextField
                label="Content"
                value={section.content}
                onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                fullWidth
                multiline
                rows={3}
              />
            )}
            {section.type === 'image' && (
              <>
                <TextField
                  label="Image URL"
                  value={section.src}
                  onChange={(e) => handleSectionChange(index, 'src', e.target.value)}
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Alt Text"
                  value={section.alt}
                  onChange={(e) => handleSectionChange(index, 'alt', e.target.value)}
                  fullWidth
                />
              </>
            )}
            {section.type === 'form' && (
              <>
                {section.fields.map((field, fieldIndex) => (
                  <Box key={fieldIndex} sx={{ mb: 2, border: '1px dashed #ccc', p: 2 }}>
                    <TextField
                      label="Field Name"
                      value={field.name}
                      onChange={(e) => handleFieldChange(index, fieldIndex, 'name', e.target.value)}
                      fullWidth
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      label="Field Label"
                      value={field.label}
                      onChange={(e) => handleFieldChange(index, fieldIndex, 'label', e.target.value)}
                      fullWidth
                      sx={{ mb: 1 }}
                    />
                    <FormControl fullWidth sx={{ mb: 1 }}>
                      <InputLabel>Field Type</InputLabel>
                      <Select
                        value={field.type}
                        onChange={(e) => handleFieldChange(index, fieldIndex, 'type', e.target.value)}
                      >
                        <MenuItem value="text">Text</MenuItem>
                        <MenuItem value="select">Select</MenuItem>
                      </Select>
                    </FormControl>
                    {field.type === 'select' && (
                      <TextField
                        label="Options (comma-separated, e.g., General:general,Support:support)"
                        value={field.options.map(opt => `${opt.label}:${opt.value}`).join(',')}
                        onChange={(e) => {
                          const opts = e.target.value.split(',').map(opt => {
                            const [label, value] = opt.split(':');
                            return { label, value };
                          });
                          handleFieldChange(index, fieldIndex, 'options', opts);
                        }}
                        fullWidth
                      />
                    )}
                    <IconButton onClick={() => handleRemoveField(index, fieldIndex)} color="error">
                      <RemoveIcon />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddField(index)}
                  sx={{ mt: 1 }}
                >
                  Add Field
                </Button>
              </>
            )}
            <IconButton onClick={() => handleRemoveSection(index)} color="error">
              <RemoveIcon />
            </IconButton>
          </Box>
        ))}
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddSection}
          sx={{ mb: 2 }}
        >
          Add Section
        </Button>
        <Button
          variant="outlined"
          startIcon={<VisibilityIcon />}
          onClick={() => setOpenPreviewDialog(true)}
          sx={{ mb: 2 }}
        >
          Preview
        </Button>
        <Button variant="contained" color="primary" type="submit">
          Create Page
        </Button>
      </Box>

      {/* دکمه رفرش */}
      <Button variant="outlined" onClick={fetchPages} sx={{ mb: 2 }}>
        Refresh
      </Button>

      {/* لیست صفحات موجود */}
      <Typography variant="h5" gutterBottom>
        Existing Pages
      </Typography>
      {pages.length === 0 ? (
        <Typography>No pages found.</Typography>
      ) : (
        <List>
          {pages.map((page) => (
            <React.Fragment key={page.id}>
              <ListItem
                secondaryAction={
                  <>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => {
                        setEditPage({
                          ...page,
                          config: { ...page.config, sections: page.config.sections || [] },
                        });
                        setOpenEditDialog(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeletePage(page.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </>
                }
              >
                <ListItemText
                  primary={page.name}
                  secondary={
                    page.config && page.config.title
                      ? `Config: ${page.config.title}`
                      : 'Config: No title available'
                  }
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      )}

      {/* دیالوگ ویرایش */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Page</DialogTitle>
        <DialogContent>
          {editPage && (
            <>
              <TextField
                label="Page Name"
                value={editPage.name}
                onChange={(e) => setEditPage({ ...editPage, name: e.target.value })}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Page Title"
                value={editPage.config.title}
                onChange={(e) =>
                  setEditPage({ ...editPage, config: { ...editPage.config, title: e.target.value } })
                }
                fullWidth
                margin="normal"
                required
              />
              <Typography variant="body2" color="textSecondary">
                Edit sections manually in JSON format for now.
              </Typography>
              <TextField
                label="Sections (JSON)"
                value={JSON.stringify(editPage.config.sections, null, 2)}
                onChange={(e) =>
                  setEditPage({
                    ...editPage,
                    config: { ...editPage.config, sections: JSON.parse(e.target.value) },
                  })
                }
                multiline
                rows={8}
                fullWidth
                margin="normal"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditPage} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* دیالوگ پیش‌نمایش */}
      <Dialog open={openPreviewDialog} onClose={() => setOpenPreviewDialog(false)}>
        <DialogTitle>Page Preview</DialogTitle>
        <DialogContent>{renderPreview()}</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreviewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* پیام‌های موفقیت و خطا */}
      <Snackbar open={!!message} autoHideDuration={3000} onClose={() => setMessage('')}>
        <Alert severity="success">{message}</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError('')}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Container>
  );
};

export default AddPage;