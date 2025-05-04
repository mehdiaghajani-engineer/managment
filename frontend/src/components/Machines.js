// Machines.js
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
import ImageUploader from './ImageUploader';
import PermissionWrapper from './PermissionWrapper';

// وضعیت‌های ماشین به‌صورت ثابت
const statuses = ['Operational', 'Maintenance Required', 'Out of Service', 'Idle'];

function Machines() {
  const { role } = useContext(AuthContext);

  const [machines, setMachines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // فرم ساخت ماشین جدید
  const [newMachine, setNewMachine] = useState({
    name: '',
    status: '',
    image: '',
    repairs: [],
    customFieldGroups: []
  });

  // ---- برای دیالوگ ویرایش کامل ----
  const [editOpen, setEditOpen] = useState(false);
  const [machineToEdit, setMachineToEdit] = useState(null);

  // ---- برای دیالوگ تغییر قالب ----
  const [moldDialogOpen, setMoldDialogOpen] = useState(false);
  const [machineForMoldChange, setMachineForMoldChange] = useState(null);
  const [producedQuantity, setProducedQuantity] = useState('');
  const [newMold, setNewMold] = useState('');
  const [newMoldStartDate, setNewMoldStartDate] = useState('');

  // فقط برای ریست کردن ورودی تصویر
  const [addImageResetCounter, setAddImageResetCounter] = useState(0);

  // دریافت لیست ماشین‌ها
  const fetchMachines = () => {
    axios
      .get('http://localhost:5000/api/machines')
      .then((res) => {
        setMachines(res.data);
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
      .post('http://localhost:5000/api/machines', newMachine)
      .then((res) => {
        const createdMachine = res.data;
        // ریست فرم
        setNewMachine({
          name: '',
          status: '',
          image: '',
          repairs: [],
          customFieldGroups: []
        });
        setAddImageResetCounter((prev) => prev + 1);
        fetchMachines();
      })
      .catch((err) => {
        console.error(err);
        setError('Error adding machine');
      });
  };

  // حذف ماشین
  const handleDeleteMachine = (id) => {
    axios
      .delete(`http://localhost:5000/api/machines/${id}`)
      .then(() => fetchMachines())
      .catch((err) => {
        console.error(err);
        setError('Error deleting machine');
      });
  };

  // کلیک روی آیکن Edit => نمایش دیالوگ ویرایش کامل
  const handleEditMachine = (machine) => {
    setMachineToEdit(machine);
    setEditOpen(true);
  };

  const handleEditSave = () => {
    if (!machineToEdit) return;
    axios
      .put(`http://localhost:5000/api/machines/${machineToEdit.id}`, machineToEdit)
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

  // ---- مربوط به تغییر قالب ----
  const handleOpenMoldChangeDialog = (machine) => {
    setMachineForMoldChange(machine);
    setNewMold(machine.currentMold || '');
    setNewMoldStartDate(machine.moldStartDate || '');
    setProducedQuantity('');
    setMoldDialogOpen(true);
  };

  const handleCloseMoldDialog = () => {
    setMoldDialogOpen(false);
    setMachineForMoldChange(null);
    setNewMold('');
    setNewMoldStartDate('');
    setProducedQuantity('');
  };

  const handleSubmitMoldChange = () => {
    if (!machineForMoldChange) return;
    if (!producedQuantity || isNaN(Number(producedQuantity))) {
      alert('Please enter a valid produced quantity.');
      return;
    }
    if (!newMoldStartDate) {
      alert('Please enter the new mold start date.');
      return;
    }

    axios
      .post('http://localhost:5000/api/mold-change', {
        machineId: machineForMoldChange.id,
        newMold,
        productionQuantity: Number(producedQuantity),
        timestamp: newMoldStartDate
      })
      .then(() => {
        // پس از موفقیت، لیست ماشین‌ها را رفرش می‌کنیم
        fetchMachines();
        handleCloseMoldDialog();
      })
      .catch((err) => {
        console.error('Error submitting mold change:', err.response || err);
        const errorMsg =
          err.response && err.response.data && err.response.data.error
            ? err.response.data.error
            : 'Unknown error occurred';
        alert('Error submitting mold change: ' + errorMsg);
      });
  };

  // ---- فیلتر و صفحه‌بندی ----
  const filteredMachines = machines.filter((machine) => {
    const matchesSearch = machine.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus ? machine.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });
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

      {/* جستجو و فیلتر */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        <TextField
          label="Search by Name"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <TextField
          select
          label="Filter by Status"
          variant="outlined"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All</MenuItem>
          {statuses.map((st) => (
            <MenuItem key={st} value={st}>
              {st}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* فرم افزودن دستگاه (مجوز create_machine) */}
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
              select
              label="Status"
              variant="outlined"
              value={newMachine.status}
              onChange={(e) => setNewMachine({ ...newMachine, status: e.target.value })}
              required
              sx={{ minWidth: 150 }}
            >
              {statuses.map((st) => (
                <MenuItem key={st} value={st}>
                  {st}
                </MenuItem>
              ))}
            </TextField>
            <ImageUploader
              key={addImageResetCounter}
              inputId="upload-image-add"
              onImageSelect={(file) =>
                setNewMachine({ ...newMachine, image: URL.createObjectURL(file) })
              }
            />
            <TextField
              label="Repairs (comma separated)"
              variant="outlined"
              value={newMachine.repairs.join(', ')}
              onChange={(e) =>
                setNewMachine({
                  ...newMachine,
                  repairs: e.target.value.split(',').map((r) => r.trim())
                })
              }
            />

            {/* فیلدهای سفارشی */}
            <Box sx={{ width: '100%', mt: 2 }}>
              <Typography variant="h6">Custom Field Groups</Typography>
              {newMachine.customFieldGroups.map((group, groupIndex) => (
                <Box
                  key={groupIndex}
                  sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2, mb: 2 }}
                >
                  <TextField
                    label="Group Title"
                    value={group.groupTitle}
                    onChange={(e) => {
                      const updatedGroups = [...newMachine.customFieldGroups];
                      updatedGroups[groupIndex].groupTitle = e.target.value;
                      setNewMachine({ ...newMachine, customFieldGroups: updatedGroups });
                    }}
                    fullWidth
                  />
                  {group.fields.map((field, fieldIndex) => (
                    <Box key={fieldIndex} sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <TextField
                        label="Field Name"
                        value={field.key}
                        onChange={(e) => {
                          const updatedGroups = [...newMachine.customFieldGroups];
                          updatedGroups[groupIndex].fields[fieldIndex].key = e.target.value;
                          setNewMachine({ ...newMachine, customFieldGroups: updatedGroups });
                        }}
                        fullWidth
                      />
                      <TextField
                        label="Field Value"
                        value={field.value}
                        onChange={(e) => {
                          const updatedGroups = [...newMachine.customFieldGroups];
                          updatedGroups[groupIndex].fields[fieldIndex].value = e.target.value;
                          setNewMachine({ ...newMachine, customFieldGroups: updatedGroups });
                        }}
                        fullWidth
                      />
                    </Box>
                  ))}
                  <Button
                    variant="outlined"
                    onClick={() => {
                      const updatedGroups = [...newMachine.customFieldGroups];
                      updatedGroups[groupIndex].fields.push({ key: '', value: '' });
                      setNewMachine({ ...newMachine, customFieldGroups: updatedGroups });
                    }}
                  >
                    Add Field to Group
                  </Button>
                </Box>
              ))}
              <Button
                variant="outlined"
                onClick={() => {
                  setNewMachine({
                    ...newMachine,
                    customFieldGroups: [
                      ...(newMachine.customFieldGroups || []),
                      { groupTitle: '', fields: [] }
                    ]
                  });
                }}
              >
                Add New Group
              </Button>
            </Box>

            <Button type="submit" variant="contained" color="primary">
              Add Machine
            </Button>
          </Box>
        </Paper>
      </PermissionWrapper>

      {/* جدول ماشین‌ها */}
      <Paper elevation={1} sx={{ mb: 2 }}>
        <TableContainer component={motion.div} layout>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Repairs</TableCell>
                <TableCell>Current Mold</TableCell>
                <TableCell>Mold Start Date</TableCell>
                <TableCell>Custom Fields</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedMachines.map((machine) => (
                <TableRow key={machine.id}>
                  <TableCell>
                    {machine.image ? (
                      <img
                        src={machine.image}
                        alt={machine.name}
                        style={{ width: 50, height: 50, borderRadius: '50%' }}
                      />
                    ) : (
                      <Box sx={{ width: 50, height: 50, bgcolor: '#ccc', borderRadius: '50%' }} />
                    )}
                  </TableCell>
                  <TableCell>{machine.name}</TableCell>
                  <TableCell>{machine.status}</TableCell>
                  <TableCell>{machine.repairs?.length ? machine.repairs.join(', ') : 'None'}</TableCell>
                  <TableCell>{machine.currentMold || 'N/A'}</TableCell>
                  <TableCell>{machine.moldStartDate || 'N/A'}</TableCell>
                  <TableCell>
                    {machine.customFieldGroups?.length ? (
                      machine.customFieldGroups.map((group, i) => (
                        <Box key={i} sx={{ mb: 1 }}>
                          <Typography variant="subtitle2">
                            {group.groupTitle || 'Untitled Group'}
                          </Typography>
                          {group.fields.map((field, j) => (
                            <Typography variant="body2" key={j}>
                              {field.key}: {field.value}
                            </Typography>
                          ))}
                        </Box>
                      ))
                    ) : (
                      'None'
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {/* آیکن ویرایش (مجوز edit_machine) */}
                    <PermissionWrapper requiredPermission="edit_machine">
                      <IconButton onClick={() => handleEditMachine(machine)} color="primary">
                        <Edit />
                      </IconButton>
                    </PermissionWrapper>

                    {/* آیکن حذف (مجوز delete_machine) */}
                    <PermissionWrapper requiredPermission="delete_machine">
                      <IconButton onClick={() => handleDeleteMachine(machine.id)} color="secondary">
                        <Delete />
                      </IconButton>
                    </PermissionWrapper>

                    {/* دکمه تغییر قالب (مجوز change_mold) */}
                    <PermissionWrapper requiredPermission="change_mold">
                      <Button variant="outlined" onClick={() => handleOpenMoldChangeDialog(machine)}>
                        Change Mold
                      </Button>
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

      {/* دیالوگ ویرایش کامل ماشین (مجوز edit_machine) */}
      <PermissionWrapper requiredPermission="edit_machine">
        <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Edit Machine (Admin Only)</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {machineToEdit && (
              <>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Machine Name"
                  variant="outlined"
                  value={machineToEdit.name}
                  onChange={(e) => setMachineToEdit({ ...machineToEdit, name: e.target.value })}
                  required
                />
                <TextField
                  fullWidth
                  select
                  margin="normal"
                  label="Status"
                  variant="outlined"
                  value={machineToEdit.status || ''}
                  onChange={(e) => setMachineToEdit({ ...machineToEdit, status: e.target.value })}
                  required
                >
                  {statuses.map((st) => (
                    <MenuItem key={st} value={st}>
                      {st}
                    </MenuItem>
                  ))}
                </TextField>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1">Machine Image</Typography>
                  <ImageUploader
                    inputId="upload-image-edit"
                    onImageSelect={(file) =>
                      setMachineToEdit({
                        ...machineToEdit,
                        image: URL.createObjectURL(file)
                      })
                    }
                  />
                  {machineToEdit.image && (
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
                      <img
                        src={machineToEdit.image}
                        alt={machineToEdit.name}
                        style={{ width: 100, height: 100, borderRadius: '50%' }}
                      />
                    </Box>
                  )}
                </Box>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Repairs (comma separated)"
                  variant="outlined"
                  value={machineToEdit.repairs ? machineToEdit.repairs.join(', ') : ''}
                  onChange={(e) =>
                    setMachineToEdit({
                      ...machineToEdit,
                      repairs: e.target.value.split(',').map((r) => r.trim())
                    })
                  }
                />

                {/* فیلدهای سفارشی */}
                <Box sx={{ width: '100%', mt: 2 }}>
                  <Typography variant="h6">Custom Field Groups</Typography>
                  {machineToEdit.customFieldGroups?.map((group, groupIndex) => (
                    <Box
                      key={groupIndex}
                      sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2, mb: 2 }}
                    >
                      <TextField
                        label="Group Title"
                        value={group.groupTitle}
                        onChange={(e) => {
                          const updated = [...machineToEdit.customFieldGroups];
                          updated[groupIndex].groupTitle = e.target.value;
                          setMachineToEdit({
                            ...machineToEdit,
                            customFieldGroups: updated
                          });
                        }}
                        fullWidth
                      />
                      {group.fields.map((field, fieldIndex) => (
                        <Box key={fieldIndex} sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <TextField
                            label="Field Name"
                            value={field.key}
                            onChange={(e) => {
                              const updated = [...machineToEdit.customFieldGroups];
                              updated[groupIndex].fields[fieldIndex].key = e.target.value;
                              setMachineToEdit({
                                ...machineToEdit,
                                customFieldGroups: updated
                              });
                            }}
                            fullWidth
                          />
                          <TextField
                            label="Field Value"
                            value={field.value}
                            onChange={(e) => {
                              const updated = [...machineToEdit.customFieldGroups];
                              updated[groupIndex].fields[fieldIndex].value = e.target.value;
                              setMachineToEdit({
                                ...machineToEdit,
                                customFieldGroups: updated
                              });
                            }}
                            fullWidth
                          />
                        </Box>
                      ))}
                      <Button
                        variant="outlined"
                        onClick={() => {
                          const updated = [...machineToEdit.customFieldGroups];
                          updated[groupIndex].fields.push({ key: '', value: '' });
                          setMachineToEdit({ ...machineToEdit, customFieldGroups: updated });
                        }}
                      >
                        Add Field to Group
                      </Button>
                    </Box>
                  ))}
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setMachineToEdit({
                        ...machineToEdit,
                        customFieldGroups: [
                          ...(machineToEdit.customFieldGroups || []),
                          { groupTitle: '', fields: [] }
                        ]
                      });
                    }}
                  >
                    Add New Group
                  </Button>
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSave} variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </PermissionWrapper>

      {/* دیالوگ تغییر قالب (مجوز change_mold) */}
      <PermissionWrapper requiredPermission="change_mold">
        <Dialog
          open={moldDialogOpen}
          onClose={handleCloseMoldDialog}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Change Mold</DialogTitle>
          <DialogContent dividers>
            <TextField
              label="New Mold"
              fullWidth
              margin="normal"
              value={newMold}
              onChange={(e) => setNewMold(e.target.value)}
            />
            <TextField
              label="Produced Quantity (for previous mold)"
              type="number"
              fullWidth
              margin="normal"
              value={producedQuantity}
              onChange={(e) => setProducedQuantity(e.target.value)}
            />
            <TextField
              label="New Mold Start Date"
              type="date"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              value={newMoldStartDate}
              onChange={(e) => setNewMoldStartDate(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseMoldDialog}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmitMoldChange}>
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </PermissionWrapper>

    </Container>
  );
}

export default Machines;
