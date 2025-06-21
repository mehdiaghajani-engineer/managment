import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  Typography,
  Box,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { AuthContext } from '../context/AuthContext';

const Pages = () => {
  const { token } = useContext(AuthContext);
  const [pages, setPages] = useState([]);
  const [error, setError] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [newPage, setNewPage] = useState({ name: '', route: '' });
  const [editPage, setEditPage] = useState(null);

  // دریافت لیست صفحات
  useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/pages', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPages(response.data);
      } catch (err) {
        console.error('Error fetching pages:', err);
        setError('Failed to fetch pages.');
      }
    };
    fetchPages();
  }, [token]);

  // ایجاد صفحه جدید
  const handleCreatePage = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/pages',
        { ...newPage, createdBy: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPages([...pages, response.data]);
      setNewPage({ name: '', route: '' });
      setOpenCreateDialog(false);
    } catch (err) {
      console.error('Error creating page:', err);
      setError('Failed to create page.');
    }
  };

  // ویرایش صفحه
  const handleEditPage = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/pages/${editPage.id}`,
        { name: editPage.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPages(pages.map((p) => (p.id === editPage.id ? response.data : p)));
      setEditPage(null);
      setOpenEditDialog(false);
    } catch (err) {
      console.error('Error editing page:', err);
      setError('Failed to edit page.');
    }
  };

  // حذف صفحه
  const handleDeletePage = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/pages/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPages(pages.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Error deleting page:', err);
      setError('Failed to delete page.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Manage Pages
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenCreateDialog(true)}
        sx={{ mb: 3 }}
      >
        Create New Page
      </Button>

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
                      setEditPage(page);
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
                secondary={`Route: ${page.route}`}
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>

      {/* دیالوگ ایجاد صفحه */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
        <DialogTitle>Create New Page</DialogTitle>
        <DialogContent>
          <TextField
            label="Page Name"
            value={newPage.name}
            onChange={(e) => setNewPage({ ...newPage, name: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Route (must start with /)"
            value={newPage.route}
            onChange={(e) => setNewPage({ ...newPage, route: e.target.value })}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreatePage} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* دیالوگ ویرایش صفحه */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Page</DialogTitle>
        <DialogContent>
          {editPage && (
            <TextField
              label="Page Name"
              value={editPage.name}
              onChange={(e) =>
                setEditPage({ ...editPage, name: e.target.value })
              }
              fullWidth
              margin="normal"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditPage} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Pages;