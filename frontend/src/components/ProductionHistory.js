// frontend/src/components/ProductionHistory.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
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
  TextField,
  MenuItem,
  Button,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

// ------------------------------------
// 1) تابع کمکی برای دیکد ساده JWT
// (اگر کتابخانه jwt-decode ندارید)
// ------------------------------------
const parseJwt = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Invalid JWT token:', error);
    return null;
  }
};

// ------------------------------------
// 2) گرفتن توکن از localStorage و تشخیص نقش کاربر
// ------------------------------------
let token = localStorage.getItem('token') || '';
let userRole = 'guest';

if (token) {
  // تمام درخواست‌های axios با این هدر ارسال می‌شوند
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  const decoded = parseJwt(token);
  if (decoded && decoded.role) {
    userRole = decoded.role; // مثلاً 'admin' یا 'operator'
  }
}

function ProductionHistory() {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  const [machines, setMachines] = useState([]);
  const [machineFilter, setMachineFilter] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // برای کنترل دیالوگ ویرایش
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState(null); // رکورد انتخاب‌شده برای ویرایش

  // دریافت رکوردهای تولید از سرور
  const fetchRecords = () => {
    axios
      .get('http://localhost:5000/api/production-history')
      .then((response) => {
        setRecords(response.data);
        setError('');
      })
      .catch((err) => {
        console.error(err);
        setError('Error fetching production history');
      });
  };

  // دریافت لیست ماشین‌ها
  const fetchMachines = () => {
    axios
      .get('http://localhost:5000/api/machines')
      .then((response) => {
        setMachines(response.data);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchRecords();
    fetchMachines();
  }, []);

  // فیلتر کردن رکوردها بر اساس ماشین انتخاب شده
  const filteredRecords = records.filter((record) => {
    if (!machineFilter) return true;
    return record.machineId.toString() === machineFilter;
  });

  // حذف رکورد (فقط برای ادمین)
  const handleDeleteRecord = (recordId) => {
    if (userRole !== 'admin') {
      alert('You do not have permission to delete this record!');
      return;
    }
    const confirmed = window.confirm('Are you sure you want to delete this record?');
    if (!confirmed) return;

    axios
      .delete(`http://localhost:5000/api/production-history/${recordId}`)
      .then((response) => {
        fetchRecords();
      })
      .catch((err) => {
        console.error(err);
        setError('Error deleting production record');
      });
  };

  // باز کردن دیالوگ ویرایش (فقط ادمین)
  const handleOpenEditDialog = (record) => {
    if (userRole !== 'admin') {
      alert('You do not have permission to edit this record!');
      return;
    }
    setRecordToEdit(record);
    setEditDialogOpen(true);
  };

  // بستن دیالوگ ویرایش
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setRecordToEdit(null);
  };

  // ذخیره تغییرات رکورد
  const handleSaveEdit = () => {
    if (!recordToEdit) return;
    if (userRole !== 'admin') {
      alert('You do not have permission to edit this record!');
      return;
    }
    const recordId = recordToEdit.id;

    axios
      .put(`http://localhost:5000/api/production-history/${recordId}`, recordToEdit)
      .then((response) => {
        // موفقیت
        setEditDialogOpen(false);
        setRecordToEdit(null);
        fetchRecords();
      })
      .catch((err) => {
        console.error(err);
        setError('Error updating production record');
      });
  };

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Production History (Logged in as: <b>{userRole}</b>)
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* بخش فیلتر کردن */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <TextField
          select
          label="Filter by Machine"
          value={machineFilter}
          onChange={(e) => {
            setMachineFilter(e.target.value);
            setPage(1);
          }}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All Machines</MenuItem>
          {machines.map((machine) => (
            <MenuItem key={machine.id} value={machine.id.toString()}>
              {machine.name}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="outlined" onClick={fetchRecords}>
          Refresh
        </Button>
      </Box>

      {/* جدول نمایش رکوردها */}
      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Machine</TableCell>
                <TableCell>Mold</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Produced Quantity</TableCell>
                {/* ستون اکشن‌ها (ویرایش / حذف) فقط برای ادمین */}
                {userRole === 'admin' && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRecords.map((record) => {
                // پیدا کردن نام ماشین از لیست ماشین‌ها
                const machine = machines.find((m) => m.id === record.machineId);
                return (
                  <TableRow key={record.id}>
                    <TableCell>{machine ? machine.name : record.machineId}</TableCell>
                    <TableCell>{record.mold}</TableCell>
                    <TableCell>
                      {new Date(record.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {record.endDate
                        ? new Date(record.endDate).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>{record.producedQuantity}</TableCell>

                    {/* دکمه‌های Edit و Delete فقط اگر admin باشد */}
                    {userRole === 'admin' && (
                      <TableCell>
                        <Button
                          variant="outlined"
                          onClick={() => handleOpenEditDialog(record)}
                          sx={{ mr: 1 }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleDeleteRecord(record.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
        />
      </Box>

      {/* دیالوگ ویرایش رکورد تولید (فقط ادمین) */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} fullWidth maxWidth="sm">
        <DialogTitle>Edit Production Record</DialogTitle>
        <DialogContent dividers>
          {recordToEdit && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Mold"
                value={recordToEdit.mold}
                onChange={(e) => setRecordToEdit({ ...recordToEdit, mold: e.target.value })}
                fullWidth
              />
              <TextField
                label="Start Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={
                  recordToEdit.startDate
                    ? new Date(recordToEdit.startDate).toISOString().split('T')[0]
                    : ''
                }
                onChange={(e) => setRecordToEdit({ ...recordToEdit, startDate: e.target.value })}
                fullWidth
              />
              <TextField
                label="End Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={
                  recordToEdit.endDate
                    ? new Date(recordToEdit.endDate).toISOString().split('T')[0]
                    : ''
                }
                onChange={(e) => setRecordToEdit({ ...recordToEdit, endDate: e.target.value })}
                fullWidth
              />
              <TextField
                label="Produced Quantity"
                type="number"
                value={recordToEdit.producedQuantity}
                onChange={(e) => setRecordToEdit({
                  ...recordToEdit,
                  producedQuantity: Number(e.target.value)
                })}
                fullWidth
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ProductionHistory;
