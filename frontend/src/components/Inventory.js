// frontend/src/components/Inventory.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Alert,
  Paper,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// تعریف متادیتا مجوزهای مربوط به صفحه انبار
export const permissionMetadata = [
  {
    name: "view_inventory",
    description: "Ability to view inventory details",
    group: "Inventory"
  },
  {
    name: "add_inventory_item",
    description: "Ability to add new inventory items",
    group: "Inventory"
  },
  {
    name: "edit_inventory_item",
    description: "Ability to edit inventory items",
    group: "Inventory"
  },
  {
    name: "delete_inventory_item",
    description: "Ability to delete inventory items",
    group: "Inventory"
  }
];

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // برای ویرایش آیتم
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editQuantity, setEditQuantity] = useState('');

  const fetchInventory = () => {
    axios.get('http://localhost:5000/api/inventory')
      .then(response => {
        setInventory(response.data);
        setError('');
      })
      .catch(err => {
        console.error(err);
        setError('Error fetching inventory data');
      });
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddItem = (e) => {
    e.preventDefault();
    const newItem = { item, quantity: parseInt(quantity, 10) };
    axios.post('http://localhost:5000/api/inventory', newItem)
      .then(() => {
        setSuccess('Item added successfully');
        setItem('');
        setQuantity('');
        fetchInventory();
        setTimeout(() => setSuccess(''), 3000);
      })
      .catch(err => {
        console.error(err);
        setError('Error adding inventory item');
      });
  };

  const handleDeleteItem = (id) => {
    axios.delete(`http://localhost:5000/api/inventory/${id}`)
      .then(() => {
        setSuccess('Item deleted successfully');
        fetchInventory();
        setTimeout(() => setSuccess(''), 3000);
      })
      .catch(err => {
        console.error(err);
        setError('Error deleting inventory item');
      });
  };

  const handleOpenEditDialog = (item) => {
    setEditItem(item);
    setEditQuantity(item.quantity);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditItem(null);
    setEditQuantity('');
  };

  const handleSaveEdit = () => {
    axios.put(`http://localhost:5000/api/inventory/${editItem.id}`, {
      item: editItem.item,
      quantity: parseInt(editQuantity, 10)
    })
      .then(() => {
        setSuccess('Item updated successfully');
        fetchInventory();
        handleCloseEditDialog();
        setTimeout(() => setSuccess(''), 3000);
      })
      .catch(err => {
        console.error(err);
        setError('Error updating inventory item');
      });
  };

  const totalInventory = inventory.reduce((sum, inv) => sum + (inv.quantity || 0), 0);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Inventory</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* فرم افزودن آیتم */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box component="form" onSubmit={handleAddItem} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            label="Item Name"
            variant="outlined"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            required
          />
          <TextField
            label="Quantity"
            variant="outlined"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" color="primary">
            Add Inventory Item
          </Button>
        </Box>
      </Paper>

      <Typography variant="h6" gutterBottom>Inventory List</Typography>
      <Paper elevation={1}>
        <Box>
          {inventory.map(inv => (
            <Box key={inv.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderBottom: '1px solid #ddd' }}>
              <Typography>{`${inv.item}: ${inv.quantity} units`}</Typography>
              <Box>
                <IconButton color="primary" onClick={() => handleOpenEditDialog(inv)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleDeleteItem(inv.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          ))}
          {inventory.length === 0 && (
            <Typography align="center" sx={{ p: 2 }}>No inventory items found.</Typography>
          )}
        </Box>
      </Paper>

      <Typography variant="h6" sx={{ mt: 2 }}>
        Total Inventory Quantity: {totalInventory}
      </Typography>

      {/* دیالوگ ویرایش آیتم */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Edit Inventory Item</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Item Name"
            variant="outlined"
            value={editItem ? editItem.item : ''}
            onChange={(e) => setEditItem({ ...editItem, item: e.target.value })}
          />
          <TextField
            label="Quantity"
            variant="outlined"
            type="number"
            value={editQuantity}
            onChange={(e) => setEditQuantity(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Inventory;
