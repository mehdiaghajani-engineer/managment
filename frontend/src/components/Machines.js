import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { motion } from 'framer-motion';
import PermissionWrapper from './PermissionWrapper';

function Machines() {
  const { role } = useContext(AuthContext); // نقش کاربر از context
  const [machines, setMachines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const [newMachine, setNewMachine] = useState({
    name: '',
    description: '',
    location: '',
    serial_number: '',
    customFields: {}
  });

  const [editOpen, setEditOpen] = useState(false);
  const [machineToEdit, setMachineToEdit] = useState(null);

  // دریافت لیست ماشین‌ها
  const fetchMachines = () => {
    axios
      .get('http://localhost:5000/api/machines/configuration')
      .then((response) => {
        setMachines(response.data);
        setError('');
      })
      .catch((err) => {
        console.error(err);
        setError('Error fetching machines data');
      });
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  // افزودن دستگاه جدید
  const handleAddMachine = (e) => {
    e.preventDefault();
    axios
      .post('http://localhost:5000/api/machines/configuration', newMachine)
      .then((response) => {
        setNewMachine({
          name: '',
          description: '',
          location: '',
          serial_number: '',
          customFields: {}
        });
        fetchMachines();
      })
      .catch((err) => {
        console.error(err);
        setError('Error adding machine');
      });
  };

  // حذف دستگاه
  const handleDeleteMachine = (id) => {
    axios
      .delete(`http://localhost:5000/api/machines/configuration/${id}`)
      .then(() => fetchMachines())
      .catch((err) => {
        console.error(err);
        setError('Error deleting machine');
      });
  };

  // انتخاب دستگاه برای ویرایش
  const handleEditMachine = (machine) => {
    setMachineToEdit(machine);
    setEditOpen(true);
  };

  const handleEditSave = () => {
    if (!machineToEdit) return;
    axios
      .put(`http://localhost:5000/api/machines/configuration/${machineToEdit.id}`, machineToEdit)
      .then(() => {
        setEditOpen(false);
        setMachineToEdit(null);
        fetchMachines();
      })
      .catch((err) => {
        console.error(err);
        setError('Error updating machine');
      });
  };

  // فیلتر و صفحه‌بندی
  const filteredMachines = machines.filter((machine) =>
    machine.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredMachines.length / itemsPerPage);
  const paginatedMachines = filteredMachines.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Machines (Logged in as: <b>{role}</b>)
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* جستجو */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        <TextField
          label="Search by Name"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>

      {/* فرم افزودن دستگاه */}
      <PermissionWrapper requiredPermission="create_machine">
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Box
            component="form"
            onSubmit={handleAddMachine}
            sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}
          >
            <TextField
              label="Machine Name"
              variant="outlined"
              value={newMachine.name}
              onChange={(e) => setNewMachine({ ...newMachine, name: e.target.value })}
              required
            />
            <TextField
              label="Description"
              variant="outlined"
              value={newMachine.description}
              onChange={(e) => setNewMachine({ ...newMachine, description: e.target.value })}
            />
            <TextField
              label="Location"
              variant="outlined"
              value={newMachine.location}
              onChange={(e) => setNewMachine({ ...newMachine, location: e.target.value })}
            />
            <TextField
              label="Serial Number"
              variant="outlined"
              value={newMachine.serial_number}
              onChange={(e) => setNewMachine({ ...newMachine, serial_number: e.target.value })}
            />
            {/* Custom Fields */}
            <Box sx={{ width: '100%', mt: 2 }}>
              <Typography variant="h6">Custom Fields</Typography>
              {Object.entries(newMachine.customFields).map(([key, value], index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <TextField
                    label="Field Name"
                    value={key}
                    onChange={(e) => {
                      const updatedFields = { ...newMachine.customFields };
                      const newKey = e.target.value;
                      if (newKey !== key) {
                        updatedFields[newKey] = updatedFields[key];
                        delete updatedFields[key];
                        setNewMachine({ ...newMachine, customFields: updatedFields });
                      }
                    }}
                    fullWidth
                  />
                  <TextField
                    label="Field Value"
                    value={value}
                    onChange={(e) => {
                      const updatedFields = { ...newMachine.customFields };
                      updatedFields[key] = e.target.value;
                      setNewMachine({ ...newMachine, customFields: updatedFields });
                    }}
                    fullWidth
                  />
                </Box>
              ))}
              <Button
                variant="outlined"
                onClick={() => {
                  setNewMachine({
                    ...newMachine,
                    customFields: { ...newMachine.customFields, '': '' }
                  });
                }}
              >
                Add New Field
              </Button>
            </Box>

            <Button type="submit" variant="contained" color="primary">
              Add Machine
            </Button>
          </Box>
        </Paper>
      </PermissionWrapper>

      {/* جدول نمایش ماشین‌ها */}
      <Paper elevation={1} sx={{ mb: 2 }}>
        <TableContainer component={motion.div} layout>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Serial Number</TableCell>
                <TableCell>Custom Fields</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedMachines.map((machine) => (
                <TableRow key={machine.id}>
                  <TableCell>{machine.name}</TableCell>
                  <TableCell>{machine.description || 'N/A'}</TableCell>
                  <TableCell>{machine.location || 'N/A'}</TableCell>
                  <TableCell>{machine.serial_number || 'N/A'}</TableCell>
                  <TableCell>
                    {machine.customFields ? (
                      Object.entries(machine.customFields).map(([key, value], i) => (
                        <Typography variant="body2" key={i}>
                          {key}: {value}
                        </Typography>
                      ))
                    ) : (
                      'None'
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <PermissionWrapper requiredPermission="edit_machine">
                      <IconButton onClick={() => handleEditMachine(machine)} color="primary">
                        <Edit />
                      </IconButton>
                    </PermissionWrapper>
                    <PermissionWrapper requiredPermission="delete_machine">
                      <IconButton onClick={() => handleDeleteMachine(machine.id)} color="secondary">
                        <Delete />
                      </IconButton>
                    </PermissionWrapper>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* صفحه‌بندی */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
        />
      </Box>

      {/* دیالوگ ویرایش ماشین */}
      <PermissionWrapper requiredPermission="edit_machine">
        <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Edit Machine (Admin Only)</DialogTitle>
          <DialogContent
            dividers
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 3 }}
          >
            <TextField
              fullWidth
              margin="normal"
              label="Machine Name"
              variant="outlined"
              value={machineToEdit?.name || ''}
              onChange={(e) =>
                setMachineToEdit({ ...machineToEdit, name: e.target.value })
              }
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Description"
              variant="outlined"
              value={machineToEdit?.description || ''}
              onChange={(e) =>
                setMachineToEdit({ ...machineToEdit, description: e.target.value })
              }
            />
            <TextField
              fullWidth
              margin="normal"
              label="Location"
              variant="outlined"
              value={machineToEdit?.location || ''}
              onChange={(e) =>
                setMachineToEdit({ ...machineToEdit, location: e.target.value })
              }
            />
            <TextField
              fullWidth
              margin="normal"
              label="Serial Number"
              variant="outlined"
              value={machineToEdit?.serial_number || ''}
              onChange={(e) =>
                setMachineToEdit({ ...machineToEdit, serial_number: e.target.value })
              }
            />
            <Box sx={{ width: '100%', mt: 2 }}>
              <Typography variant="h6">Custom Fields</Typography>
              {machineToEdit?.customFields &&
                Object.entries(machineToEdit.customFields).map(([key, value], index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <TextField
                      label="Field Name"
                      value={key}
                      onChange={(e) => {
                        const updatedFields = { ...machineToEdit.customFields };
                        const newKey = e.target.value;
                        if (newKey !== key) {
                          updatedFields[newKey] = updatedFields[key];
                          delete updatedFields[key];
                          setMachineToEdit({ ...machineToEdit, customFields: updatedFields });
                        }
                      }}
                      fullWidth
                      disabled={role === 'operator'}
                    />
                    <TextField
                      label="Field Value"
                      value={value}
                      onChange={(e) => {
                        const updatedFields = { ...machineToEdit.customFields };
                        updatedFields[key] = e.target.value;
                        setMachineToEdit({ ...machineToEdit, customFields: updatedFields });
                      }}
                      fullWidth
                      disabled={role === 'operator'}
                    />
                  </Box>
                ))}
              {role === 'admin' && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setMachineToEdit({
                      ...machineToEdit,
                      customFields: { ...machineToEdit.customFields, '': '' }
                    });
                  }}
                >
                  Add New Field
                </Button>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSave} variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </PermissionWrapper>
    </Container>
  );
}

export default Machines;