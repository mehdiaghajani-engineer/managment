import React, { useState, useContext, useEffect, useRef } from 'react';
import { Container, Typography, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, InputLabel, FormControl, IconButton, Paper, styled, Checkbox, FormControlLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import BuildIcon from '@mui/icons-material/Build';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15), 0 5px 15px rgba(0, 0, 0, 0.1)',
  background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2), 0 8px 20px rgba(0, 0, 0, 0.15)',
  },
}));

const StyledButton = styled(Button)(({ theme, variant }) => ({
  margin: theme.spacing(1),
  padding: theme.spacing(2, 4),
  borderRadius: 12,
  textTransform: 'none',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  background: variant === 'contained' ? 'linear-gradient(45deg, #1E3A8A 0%, #3B82F6 100%)' : 'transparent',
  color: variant === 'contained' ? '#FFFFFF' : '#1E3A8A',
  border: variant === 'outlined' ? '2px solid #1E3A8A' : 'none',
  '&:hover': {
    transform: 'translateY(-3px)',
    background: variant === 'contained' ? 'linear-gradient(45deg, #163172 0%, #2563EB 100%)' : 'rgba(30, 58, 138, 0.1)',
    borderColor: variant === 'outlined' ? '#163172' : 'none',
  },
}));

const BackButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  padding: theme.spacing(1, 2),
  borderRadius: 12,
  color: '#6B7280',
  border: '2px solid #E5E7EB',
  fontWeight: 500,
  '&:hover': {
    color: '#374151',
    borderColor: '#D1D5DB',
    background: 'rgba(229, 231, 235, 0.2)',
  },
}));

const MosaicPaper = styled(Paper)(({ theme, isSelectedSection }) => ({
  padding: theme.spacing(2.5),
  borderRadius: 16,
  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
  height: 200,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: isSelectedSection ? 'linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%)' : 'linear-gradient(135deg, #F1F8E9 0%, #DCEDC8 100%)',
  transition: 'all 0.4s ease',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.2), inset 0 4px 6px rgba(255, 255, 255, 0.4)',
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
    animation: 'ripple 6s infinite',
  },
}));

const MosaicActionBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 10,
  right: 10,
  display: 'flex',
  gap: 1,
  opacity: 0,
  transition: 'opacity 0.3s ease',
  '& .MuiIconButton-root': {
    background: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    padding: 6,
    '&:hover': {
      background: 'rgba(255, 255, 255, 1)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
  },
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.2)',
    background: 'linear-gradient(135deg, #FFFFFF 0%, #F3F4F6 100%)',
  },
}));

function MachinesAndEquipments() {
  const { permissions } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [machines, setMachines] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [machineCategories, setMachineCategories] = useState([]);
  const [equipmentCategories, setEquipmentCategories] = useState([]);
  const [openMachineDialog, setOpenMachineDialog] = useState(false);
  const [openEquipmentDialog, setOpenEquipmentDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [newMachine, setNewMachine] = useState({ name: '', location: '', serial_number: '', description: '', custom_field_groups: [], images: [], files: [], related_items: [] });
  const [newEquipment, setNewEquipment] = useState({ name: '', type: '', description: '', customFields: [], location: '', specifications: '', images: [], files: [], related_items: [] });
  const [newCategory, setNewCategory] = useState({ name: '', type: '', parentId: null });
  const [editMachine, setEditMachine] = useState(null);
  const [editEquipment, setEditEquipment] = useState(null);
  const [editCategory, setEditCategory] = useState(null);
  const [newCustomField, setNewCustomField] = useState({ label: '', type: 'text', value: '' });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [showRelatedItemsMachine, setShowRelatedItemsMachine] = useState(false);
  const [showRelatedItemsEquipment, setShowRelatedItemsEquipment] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [machinesResp, equipmentsResp, machineCatsResp, equipCatsResp] = await Promise.all([
        axios.get('http://localhost:5000/api/machines', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        axios.get('http://localhost:5000/api/equipments', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        axios.get('http://localhost:5000/api/categories', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, params: { type: 'machine' } }),
        axios.get('http://localhost:5000/api/categories', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, params: { type: 'equipment' } }),
      ]);
      setMachines(machinesResp.data.map(item => ({
        ...item,
        custom_field_groups: Array.isArray(item.custom_field_groups) ? item.custom_field_groups : [],
        images: item.images || [],
        files: item.files || [],
        related_items: item.related_items || []
      })));
      setEquipments(equipmentsResp.data.map(item => ({
        ...item,
        customFields: Array.isArray(item.customFields) ? item.customFields : [],
        images: item.images || [],
        files: item.files || [],
        related_items: item.related_items || []
      })));
      setMachineCategories(machineCatsResp.data);
      setEquipmentCategories(equipCatsResp.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleOpenMachineDialog = (machine = null) => {
    setEditMachine(machine);
    setNewMachine(machine ? { ...machine, custom_field_groups: Array.isArray(machine.custom_field_groups) ? [...machine.custom_field_groups] : [], images: machine.images || [], files: machine.files || [], related_items: machine.related_items || [] } : { name: '', location: '', serial_number: '', description: '', custom_field_groups: [], images: [], files: [], related_items: [] });
    setImagePreviews(machine?.images ? machine.images.map(img => URL.createObjectURL(new Blob([new Uint8Array(img.data)]))) : []);
    setFilePreviews(machine?.files ? machine.files.map(file => URL.createObjectURL(new Blob([new Uint8Array(file.data)]))) : []);
    setShowRelatedItemsMachine(!!machine?.related_items.length);
    setOpenMachineDialog(true);
  };

  const handleCloseMachineDialog = () => {
    setOpenMachineDialog(false);
    setEditMachine(null);
    setNewMachine({ name: '', location: '', serial_number: '', description: '', custom_field_groups: [], images: [], files: [], related_items: [] });
    setImagePreviews([]);
    setFilePreviews([]);
    setShowRelatedItemsMachine(false);
    setPreviewOpen(false);
  };

  const handleSaveMachine = async () => {
    const token = localStorage.getItem('token');
    try {
      const url = editMachine ? `http://localhost:5000/api/machines/${editMachine.id}` : 'http://localhost:5000/api/machines';
      const method = editMachine ? 'put' : 'post';
      const formData = new FormData();
      Object.keys(newMachine).forEach(key => {
        if (key === 'custom_field_groups' && Array.isArray(newMachine[key])) {
          formData.append(key, JSON.stringify(newMachine[key]));
        } else if (key !== 'images' && key !== 'files' && key !== 'related_items') {
          formData.append(key, newMachine[key]);
        }
      });
      newMachine.images.forEach((img, index) => formData.append(`images`, img));
      newMachine.files.forEach((file, index) => formData.append(`files`, file));
      if (Array.isArray(newMachine.related_items)) {
        formData.append('related_items', JSON.stringify(newMachine.related_items));
      }
      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      fetchData();
      handleCloseMachineDialog();
    } catch (err) {
      console.error('Error saving machine:', err);
    }
  };

  const handleOpenEquipmentDialog = (equipment = null) => {
    setEditEquipment(equipment);
    setNewEquipment(equipment ? { ...equipment, customFields: Array.isArray(equipment.customFields) ? [...equipment.customFields] : [], images: equipment.images || [], files: equipment.files || [], related_items: equipment.related_items || [] } : { name: '', type: '', description: '', customFields: [], location: '', specifications: '', images: [], files: [], related_items: [] });
    setImagePreviews(equipment?.images ? equipment.images.map(img => URL.createObjectURL(new Blob([new Uint8Array(img.data)]))) : []);
    setFilePreviews(equipment?.files ? equipment.files.map(file => URL.createObjectURL(new Blob([new Uint8Array(file.data)]))) : []);
    setShowRelatedItemsEquipment(!!equipment?.related_items.length);
    setOpenEquipmentDialog(true);
  };

  const handleCloseEquipmentDialog = () => {
    setOpenEquipmentDialog(false);
    setEditEquipment(null);
    setNewEquipment({ name: '', type: '', description: '', customFields: [], location: '', specifications: '', images: [], files: [], related_items: [] });
    setImagePreviews([]);
    setFilePreviews([]);
    setShowRelatedItemsEquipment(false);
    setPreviewOpen(false);
  };

  const handleSaveEquipment = async () => {
    const token = localStorage.getItem('token');
    try {
      const url = editEquipment ? `http://localhost:5000/api/equipments/${editEquipment.id}` : 'http://localhost:5000/api/equipments';
      const method = editEquipment ? 'put' : 'post';
      const formData = new FormData();
      Object.keys(newEquipment).forEach(key => {
        if (key === 'customFields' && Array.isArray(newEquipment[key])) {
          formData.append(key, JSON.stringify(newEquipment[key]));
        } else if (key !== 'images' && key !== 'files' && key !== 'related_items') {
          formData.append(key, newEquipment[key]);
        }
      });
      newEquipment.images.forEach((img, index) => formData.append(`images`, img));
      newEquipment.files.forEach((file, index) => formData.append(`files`, file));
      if (Array.isArray(newEquipment.related_items)) {
        formData.append('related_items', JSON.stringify(newEquipment.related_items));
      }
      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      fetchData();
      handleCloseEquipmentDialog();
    } catch (err) {
      console.error('Error saving equipment:', err);
    }
  };

  const handleOpenCategoryDialog = (category = null, type = selectedSection === 'machines' ? 'machine' : 'equipment') => {
    setEditCategory(category);
    setNewCategory(category ? { ...category } : { name: '', type, parentId: null });
    setOpenCategoryDialog(true);
  };

  const handleCloseCategoryDialog = () => {
    setOpenCategoryDialog(false);
    setEditCategory(null);
    setNewCategory({ name: '', type: '', parentId: null });
  };

  const handleSaveCategory = async () => {
    const token = localStorage.getItem('token');
    try {
      const url = editCategory ? `http://localhost:5000/api/categories/${editCategory.id}` : 'http://localhost:5000/api/categories';
      const method = editCategory ? 'put' : 'post';
      await axios[method](url, newCategory, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
      handleCloseCategoryDialog();
    } catch (err) {
      console.error('Error saving category:', err);
    }
  };

  const handleOpenDeleteDialog = (item, type) => {
    setItemToDelete(item);
    setDeleteType(type);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setItemToDelete(null);
    setDeleteType(null);
  };

  const handleConfirmDelete = async () => {
    const token = localStorage.getItem('token');
    try {
      if (deleteType === 'machine') {
        await axios.delete(`http://localhost:5000/api/machines/${itemToDelete.id}`, { headers: { Authorization: `Bearer ${token}` } });
      } else if (deleteType === 'equipment') {
        await axios.delete(`http://localhost:5000/api/equipments/${itemToDelete.id}`, { headers: { Authorization: `Bearer ${token}` } });
      } else if (deleteType === 'machine-category') {
        await axios.delete(`http://localhost:5000/api/categories/${itemToDelete.id}`, { headers: { Authorization: `Bearer ${token}` } });
      } else if (deleteType === 'equipment-category') {
        await axios.delete(`http://localhost:5000/api/categories/${itemToDelete.id}`, { headers: { Authorization: `Bearer ${token}` } });
      } else if (deleteType === 'machine-custom-field' || deleteType === 'equipment-custom-field') {
        const setItem = deleteType === 'machine-custom-field' ? setNewMachine : setNewEquipment;
        const fieldArray = deleteType === 'machine-custom-field' ? 'custom_field_groups' : 'customFields';
        setItem((prev) => ({
          ...prev,
          [fieldArray]: Array.isArray(prev[fieldArray]) ? prev[fieldArray].filter((_, index) => index !== itemToDelete.index) : [],
        }));
      } else if (deleteType === 'machine-image' || deleteType === 'equipment-image') {
        const setItem = deleteType === 'machine-image' ? setNewMachine : setNewEquipment;
        const imageArray = 'images';
        setItem((prev) => ({
          ...prev,
          [imageArray]: Array.isArray(prev[imageArray]) ? prev[imageArray].filter((_, index) => index !== itemToDelete.index) : [],
        }));
        setImagePreviews((prev) => prev.filter((_, index) => index !== itemToDelete.index));
      } else if (deleteType === 'machine-file' || deleteType === 'equipment-file') {
        const setItem = deleteType === 'machine-file' ? setNewMachine : setNewEquipment;
        const fileArray = 'files';
        setItem((prev) => ({
          ...prev,
          [fileArray]: Array.isArray(prev[fileArray]) ? prev[fileArray].filter((_, index) => index !== itemToDelete.index) : [],
        }));
        setFilePreviews((prev) => prev.filter((_, index) => index !== itemToDelete.index));
      }
      fetchData();
      handleCloseDeleteDialog();
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  const handleAddCustomField = (setItem) => {
    setItem((prev) => {
      const updatedItem = { ...prev };
      if (setItem === setNewMachine) {
        updatedItem.custom_field_groups = [
          ...(Array.isArray(prev.custom_field_groups) ? prev.custom_field_groups : []),
          { label: newCustomField.label, type: newCustomField.type, value: newCustomField.value },
        ];
      } else if (setItem === setNewEquipment) {
        updatedItem.customFields = [
          ...(Array.isArray(prev.customFields) ? prev.customFields : []),
          { label: newCustomField.label, type: newCustomField.type, value: newCustomField.value },
        ];
      }
      return updatedItem;
    });
    setNewCustomField({ label: '', type: 'text', value: '' });
  };

  const handleUpdateCustomFieldValue = (setItem, index, value) => {
    setItem((prev) => {
      const updatedItem = { ...prev };
      const fieldArray = setItem === setNewMachine ? 'custom_field_groups' : 'customFields';
      const updatedFields = Array.isArray(prev[fieldArray]) ? [...prev[fieldArray]] : [];
      if (index >= 0 && index < updatedFields.length) {
        updatedFields[index] = { ...updatedFields[index], value };
      }
      updatedItem[fieldArray] = updatedFields;
      return updatedItem;
    });
  };

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      if (type === 'images') {
        setNewMachine((prev) => ({ ...prev, images: [...prev.images, ...files] }));
        setImagePreviews((prev) => [...prev, ...files.map(file => URL.createObjectURL(file))]);
      } else if (type === 'files') {
        if (openMachineDialog) {
          setNewMachine((prev) => ({ ...prev, files: [...prev.files, ...files] }));
        } else if (openEquipmentDialog) {
          setNewEquipment((prev) => ({ ...prev, files: [...prev.files, ...files] }));
        }
        setFilePreviews((prev) => [...prev, ...files.map(file => URL.createObjectURL(file))]);
      }
    }
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const handleSectionClick = (section) => {
    setSelectedSection(section);
    setSelectedCategory(null);
    setSelectedItem(null);
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedItem(null);
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setOpenDetailsDialog(true);
  };

  const handleBack = () => {
    if (selectedItem) {
      setSelectedItem(null);
      setOpenDetailsDialog(false);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    } else if (selectedSection) {
      setSelectedSection(null);
    }
  };

  const filteredItems = selectedSection === 'machines'
    ? (selectedCategory ? machines.filter((m) => m.category_id === selectedCategory) : [])
    : (selectedCategory ? equipments.filter((e) => e.category_id === selectedCategory) : []);

  const categories = selectedSection === 'machines' ? machineCategories : equipmentCategories;

  const hasAccess = () => true;

  return (
    <Container sx={{ mt: 4, maxWidth: '1200px !important', background: 'linear-gradient(135deg, #E5E7EB 0%, #F3F4F6 100%)', minHeight: '100vh', padding: 3, borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes ripple {
            0% { transform: translate(50%, 50%) rotate(0deg); }
            100% { transform: translate(50%, 50%) rotate(360deg); }
          }
          .mosaic-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 24px;
            padding: 24px 0;
            justify-content: center;
          }
          .MuiDialogContent-root {
            padding: 24px !important;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            align-items: flex-start;
          }
          .MuiInputBase-root {
            borderRadius: 12px !important;
          }
        `}
      </style>
      <Typography variant="h3" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#1E40AF', animation: 'fadeIn 0.6s ease', fontSize: '2.8rem', textAlign: 'center', textShadow: '0 2px 4px rgba(30, 64, 175, 0.2)' }}>
        Machines & Equipments
      </Typography>
      <Typography variant="h6" color="#374151" gutterBottom sx={{ mb: 4, animation: 'fadeIn 0.6s ease 0.3s', fontFamily: 'Roboto, sans-serif', textAlign: 'center', opacity: 0.9 }}>
        Explore and manage your machines and equipments with ease.
      </Typography>

      {!selectedSection && (
        <Box className="mosaic-grid">
          <MosaicPaper onClick={() => handleSectionClick('machines')} onMouseEnter={(e) => { const actionBox = e.currentTarget.querySelector('.action-box'); if (actionBox) actionBox.style.opacity = 1; }} onMouseLeave={(e) => { const actionBox = e.currentTarget.querySelector('.action-box'); if (actionBox) actionBox.style.opacity = 0; }} sx={{ background: 'linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%)' }}>
            <SettingsIcon sx={{ fontSize: 48, color: '#1E40AF', mb: 2, transition: 'transform 0.3s ease', '&:hover': { transform: 'rotate(15deg)' } }} />
            <Typography variant="h5" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#1E40AF', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 }}>
              Machines
            </Typography>
          </MosaicPaper>
          <MosaicPaper onClick={() => handleSectionClick('equipments')} onMouseEnter={(e) => { const actionBox = e.currentTarget.querySelector('.action-box'); if (actionBox) actionBox.style.opacity = 1; }} onMouseLeave={(e) => { const actionBox = e.currentTarget.querySelector('.action-box'); if (actionBox) actionBox.style.opacity = 0; }} sx={{ background: 'linear-gradient(135deg, #F1F8E9 0%, #DCEDC8 100%)' }}>
            <BuildIcon sx={{ fontSize: 48, color: '#10B981', mb: 2, transition: 'transform 0.3s ease', '&:hover': { transform: 'rotate(-15deg)' } }} />
            <Typography variant="h5" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#10B981', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 }}>
              Equipments
            </Typography>
          </MosaicPaper>
        </Box>
      )}

      {(selectedSection || selectedCategory) && (
        <StyledPaper>
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <BackButton
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
            >
              Back
            </BackButton>
            <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#1F2937', flexGrow: 1, textAlign: 'center' }}>
              {selectedCategory
                ? `${selectedSection === 'machines' ? 'Machines' : 'Equipments'} in ${categories.find(c => c.id === selectedCategory)?.name}`
                : selectedSection === 'machines' ? 'Machine Categories' : 'Equipment Categories'}
            </Typography>
            <StyledButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => selectedCategory ? (selectedSection === 'machines' ? handleOpenMachineDialog() : handleOpenEquipmentDialog()) : handleOpenCategoryDialog(null)}
              color="primary"
              disabled={!hasAccess()}
            >
              Add New {selectedCategory ? (selectedSection === 'machines' ? 'Machine' : 'Equipment') : 'Category'}
            </StyledButton>
          </Box>
          <Box className="mosaic-grid">
            {selectedCategory
              ? filteredItems.map((item) => (
                  <MosaicPaper
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    onMouseEnter={(e) => { const actionBox = e.currentTarget.querySelector('.action-box'); if (actionBox) actionBox.style.opacity = 1; }}
                    onMouseLeave={(e) => { const actionBox = e.currentTarget.querySelector('.action-box'); if (actionBox) actionBox.style.opacity = 0; }}
                    isSelectedSection={selectedSection === 'machines'}
                  >
                    <SettingsIcon sx={{ fontSize: 48, color: selectedSection === 'machines' ? '#1E40AF' : '#10B981', mb: 2 }} />
                    <Typography variant="h5" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: selectedSection === 'machines' ? '#1E40AF' : '#10B981', textAlign: 'center' }}>
                      {item.name}
                    </Typography>
                    <MosaicActionBox className="action-box">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); selectedSection === 'machines' ? handleOpenMachineDialog(item) : handleOpenEquipmentDialog(item); }} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenDeleteDialog(item, selectedSection); }} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </MosaicActionBox>
                  </MosaicPaper>
                ))
              : categories.map((category) => (
                  <MosaicPaper
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    onMouseEnter={(e) => { const actionBox = e.currentTarget.querySelector('.action-box'); if (actionBox) actionBox.style.opacity = 1; }}
                    onMouseLeave={(e) => { const actionBox = e.currentTarget.querySelector('.action-box'); if (actionBox) actionBox.style.opacity = 0; }}
                    isSelectedSection={selectedSection === 'machines'}
                  >
                    <Typography variant="h5" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: selectedSection === 'machines' ? '#1E40AF' : '#10B981', textAlign: 'center' }}>
                      {category.name}
                    </Typography>
                    <MosaicActionBox className="action-box">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenCategoryDialog(category); }} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenDeleteDialog(category, `${selectedSection}-category`); }} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </MosaicActionBox>
                  </MosaicPaper>
                ))}
          </Box>
        </StyledPaper>
      )}

      <StyledDialog open={openMachineDialog} onClose={handleCloseMachineDialog} maxWidth="md" fullWidth>
  <DialogTitle sx={{ background: 'linear-gradient(45deg, #1E40AF 0%, #3B82F6 100%)', color: '#FFFFFF', p: 3, fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
    {editMachine ? 'Edit Machine' : 'Add New Machine'}
  </DialogTitle>
  <DialogContent sx={{ p: 3, overflowY: 'auto', maxHeight: '70vh', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
    <TextField
      label="Machine Name"
      fullWidth
      value={newMachine.name}
      onChange={(e) => setNewMachine({ ...newMachine, name: e.target.value })}
      sx={{ mb: 2 }}
      variant="outlined"
      InputLabelProps={{ shrink: true }}
      InputProps={{ sx: { borderRadius: 12 } }}
    />
    <TextField
      label="Location"
      fullWidth
      value={newMachine.location}
      onChange={(e) => setNewMachine({ ...newMachine, location: e.target.value })}
      sx={{ mb: 2 }}
      variant="outlined"
      InputLabelProps={{ shrink: true }}
      InputProps={{ sx: { borderRadius: 12 } }}
    />
    <TextField
      label="Serial Number"
      fullWidth
      value={newMachine.serial_number}
      onChange={(e) => setNewMachine({ ...newMachine, serial_number: e.target.value })}
      sx={{ mb: 2 }}
      variant="outlined"
      InputLabelProps={{ shrink: true }}
      InputProps={{ sx: { borderRadius: 12 } }}
    />
    <FormControl fullWidth sx={{ mb: 2 }} variant="outlined">
      <InputLabel>Category</InputLabel>
      <Select
        value={newMachine.category_id || 0}
        onChange={(e) => setNewMachine({ ...newMachine, category_id: Number(e.target.value) })}
        label="Category"
        MenuProps={{ PaperProps: { sx: { borderRadius: 12 } } }}
      >
        <MenuItem value={0}>Uncategorized</MenuItem>
        {machineCategories.length === 0 ? (
          <MenuItem disabled>No categories available. Please add a category first.</MenuItem>
        ) : (
          machineCategories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))
        )}
      </Select>
    </FormControl>
    <TextField
      label="Description"
      fullWidth
      value={newMachine.description}
      onChange={(e) => setNewMachine({ ...newMachine, description: e.target.value })}
      sx={{ mb: 2, gridColumn: '1 / -1' }}
      variant="outlined"
      InputLabelProps={{ shrink: true }}
      multiline
      rows={4}
      InputProps={{ sx: { borderRadius: 12 } }}
    />
    <Box sx={{ mb: 2, gridColumn: '1 / -1' }}>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileChange(e, 'images')}
        ref={imageInputRef}
        style={{ display: 'none' }}
      />
      <Button variant="outlined" onClick={() => imageInputRef.current.click()} sx={{ mr: 2 }}>
        Upload Images
      </Button>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
        {imagePreviews.map((preview, index) => (
          <Box key={index} sx={{ position: 'relative' }}>
            <img src={preview} alt={`Preview ${index}`} style={{ maxWidth: '100px', maxHeight: '100px' }} />
            <IconButton
              size="small"
              onClick={() => {
                setNewMachine((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
                setImagePreviews((prev) => prev.filter((_, i) => i !== index));
              }}
              sx={{ position: 'absolute', top: 0, right: 0, color: 'red' }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
      </Box>
    </Box>
    <Box sx={{ mb: 2, gridColumn: '1 / -1' }}>
      <input
        type="file"
        multiple
        onChange={(e) => handleFileChange(e, 'files')}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      <Button variant="outlined" onClick={() => fileInputRef.current.click()} sx={{ mr: 2 }}>
        Upload Files
      </Button>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
        {filePreviews.map((preview, index) => (
          <Box key={index} sx={{ position: 'relative' }}>
            <a href={preview} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#1E40AF' }}>
              File {index + 1}
            </a>
            <IconButton
              size="small"
              onClick={() => {
                setNewMachine((prev) => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }));
                setFilePreviews((prev) => prev.filter((_, i) => i !== index));
              }}
              sx={{ position: 'absolute', top: 0, right: 0, color: 'red' }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
      </Box>
    </Box>
    <FormControlLabel
      control={<Checkbox checked={showRelatedItemsMachine} onChange={(e) => setShowRelatedItemsMachine(e.target.checked)} />}
      label="Add Related Items"
      sx={{ mb: 2, gridColumn: '1 / -1' }}
    />
    {showRelatedItemsMachine && (
      <>
        <FormControl fullWidth sx={{ mb: 2 }} variant="outlined">
          <InputLabel>Equipment Category</InputLabel>
          <Select
            value={newMachine.related_category_id || 0}
            onChange={(e) => setNewMachine({ ...newMachine, related_category_id: Number(e.target.value) })}
            label="Equipment Category"
            MenuProps={{ PaperProps: { sx: { borderRadius: 12 } } }}
          >
            <MenuItem value={0}>Uncategorized</MenuItem>
            {equipmentCategories.length === 0 ? (
              <MenuItem disabled>No equipment categories available. Please add a category first.</MenuItem>
            ) : (
              equipmentCategories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mb: 2 }} variant="outlined">
          <InputLabel>Related Equipments</InputLabel>
          <Select
            multiple
            value={newMachine.related_items}
            onChange={(e) => setNewMachine({ ...newMachine, related_items: e.target.value })}
            label="Related Equipments"
            MenuProps={{ PaperProps: { sx: { borderRadius: 12 } } }}
          >
            {equipments
              .filter(e => e.category_id === newMachine.related_category_id)
              .map((equipment) => (
                <MenuItem key={equipment.id} value={equipment.id}>
                  {equipment.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </>
    )}
    <Typography variant="h6" sx={{ mt: 3, mb: 2, fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#1F2937', textAlign: 'center', gridColumn: '1 / -1' }}>
      Custom Fields
    </Typography>
    {Array.isArray(newMachine.custom_field_groups) ? newMachine.custom_field_groups.map((field, index) => (
      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2, gridColumn: '1 / -1' }}>
        <TextField
          label={field.label}
          value={field.value}
          onChange={(e) => handleUpdateCustomFieldValue(setNewMachine, index, e.target.value)}
          sx={{ mr: 2, flex: 1 }}
          type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          InputProps={{ sx: { borderRadius: 12 } }}
        />
        <IconButton onClick={() => handleOpenDeleteDialog({ index }, 'machine-custom-field')} color="error">
          <DeleteIcon />
        </IconButton>
      </Box>
    )) : null}
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2, gridColumn: '1 / -1' }}>
      <TextField
        label="Field Label"
        value={newCustomField.label}
        onChange={(e) => setNewCustomField({ ...newCustomField, label: e.target.value })}
        sx={{ mr: 2, flex: 1 }}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        InputProps={{ sx: { borderRadius: 12 } }}
      />
      <FormControl sx={{ mr: 2, minWidth: 120, maxWidth: 120 }} variant="outlined">
        <InputLabel>Type</InputLabel>
        <Select
          value={newCustomField.type}
          onChange={(e) => setNewCustomField({ ...newCustomField, type: e.target.value })}
          label="Type"
          MenuProps={{ PaperProps: { sx: { borderRadius: 12 } } }}
        >
          <MenuItem value="text">Text</MenuItem>
          <MenuItem value="number">Number</MenuItem>
          <MenuItem value="date">Date</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Value"
        value={newCustomField.value}
        onChange={(e) => setNewCustomField({ ...newCustomField, value: e.target.value })}
        sx={{ mr: 2, flex: 1 }}
        type={newCustomField.type === 'date' ? 'date' : newCustomField.type === 'number' ? 'number' : 'text'}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        InputProps={{ sx: { borderRadius: 12 } }}
      />
      <StyledButton
        variant="outlined"
        onClick={() => handleAddCustomField(setNewMachine)}
        disabled={!newCustomField.label || !newCustomField.value}
        color="primary"
      >
        Add Field
      </StyledButton>
    </Box>
  </DialogContent>
  <DialogActions sx={{ p: 3, background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)', justifyContent: 'center' }}>
    <Button onClick={handleCloseMachineDialog} sx={{ color: '#374151', fontWeight: 500 }}>Cancel</Button>
    <StyledButton variant="contained" color="primary" onClick={handlePreview} disabled={!newMachine.name || !newMachine.category_id}>
      Preview
    </StyledButton>
    <StyledButton variant="contained" color="primary" onClick={handleSaveMachine}>
      Save
    </StyledButton>
  </DialogActions>
</StyledDialog>

<StyledDialog open={openEquipmentDialog} onClose={handleCloseEquipmentDialog} maxWidth="md" fullWidth>
  <DialogTitle sx={{ background: 'linear-gradient(45deg, #10B981 0%, #34D399 100%)', color: '#FFFFFF', p: 3, fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
    {editEquipment ? 'Edit Equipment' : 'Add New Equipment'}
  </DialogTitle>
  <DialogContent sx={{ p: 3, overflowY: 'auto', maxHeight: '70vh', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
    <TextField
      label="Equipment Name"
      fullWidth
      value={newEquipment.name}
      onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
      sx={{ mb: 2 }}
      variant="outlined"
      InputLabelProps={{ shrink: true }}
      InputProps={{ sx: { borderRadius: 12 } }}
    />
    <TextField
      label="Equipment Type"
      fullWidth
      value={newEquipment.type}
      onChange={(e) => setNewEquipment({ ...newEquipment, type: e.target.value })}
      sx={{ mb: 2 }}
      variant="outlined"
      InputLabelProps={{ shrink: true }}
      InputProps={{ sx: { borderRadius: 12 } }}
    />
    <TextField
      label="Location"
      fullWidth
      value={newEquipment.location}
      onChange={(e) => setNewEquipment({ ...newEquipment, location: e.target.value })}
      sx={{ mb: 2 }}
      variant="outlined"
      InputLabelProps={{ shrink: true }}
      InputProps={{ sx: { borderRadius: 12 } }}
    />
    <FormControl fullWidth sx={{ mb: 2 }} variant="outlined">
      <InputLabel>Category</InputLabel>
      <Select
        value={newEquipment.category_id || 0}
        onChange={(e) => setNewEquipment({ ...newEquipment, category_id: Number(e.target.value) })}
        label="Category"
        MenuProps={{ PaperProps: { sx: { borderRadius: 12 } } }}
      >
        <MenuItem value={0}>Uncategorized</MenuItem>
        {equipmentCategories.length === 0 ? (
          <MenuItem disabled>No categories available. Please add a category first.</MenuItem>
        ) : (
          equipmentCategories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))
        )}
      </Select>
    </FormControl>
    <TextField
      label="Specifications"
      fullWidth
      value={newEquipment.specifications}
      onChange={(e) => setNewEquipment({ ...newEquipment, specifications: e.target.value })}
      sx={{ mb: 2, gridColumn: '1 / -1' }}
      variant="outlined"
      InputLabelProps={{ shrink: true }}
      multiline
      rows={4}
      InputProps={{ sx: { borderRadius: 12 } }}
    />
    <Box sx={{ mb: 2, gridColumn: '1 / -1' }}>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileChange(e, 'images')}
        ref={imageInputRef}
        style={{ display: 'none' }}
      />
      <Button variant="outlined" onClick={() => imageInputRef.current.click()} sx={{ mr: 2 }}>
        Upload Images
      </Button>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
        {imagePreviews.map((preview, index) => (
          <Box key={index} sx={{ position: 'relative' }}>
            <img src={preview} alt={`Preview ${index}`} style={{ maxWidth: '100px', maxHeight: '100px' }} />
            <IconButton
              size="small"
              onClick={() => {
                setNewEquipment((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
                setImagePreviews((prev) => prev.filter((_, i) => i !== index));
              }}
              sx={{ position: 'absolute', top: 0, right: 0, color: 'red' }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
      </Box>
    </Box>
    <Box sx={{ mb: 2, gridColumn: '1 / -1' }}>
      <input
        type="file"
        multiple
        onChange={(e) => handleFileChange(e, 'files')}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      <Button variant="outlined" onClick={() => fileInputRef.current.click()} sx={{ mr: 2 }}>
        Upload Files
      </Button>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
        {filePreviews.map((preview, index) => (
          <Box key={index} sx={{ position: 'relative' }}>
            <a href={preview} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#1E40AF' }}>
              File {index + 1}
            </a>
            <IconButton
              size="small"
              onClick={() => {
                setNewEquipment((prev) => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }));
                setFilePreviews((prev) => prev.filter((_, i) => i !== index));
              }}
              sx={{ position: 'absolute', top: 0, right: 0, color: 'red' }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
      </Box>
    </Box>
    <FormControlLabel
      control={<Checkbox checked={showRelatedItemsEquipment} onChange={(e) => setShowRelatedItemsEquipment(e.target.checked)} />}
      label="Add Related Items"
      sx={{ mb: 2, gridColumn: '1 / -1' }}
    />
    {showRelatedItemsEquipment && (
      <>
        <FormControl fullWidth sx={{ mb: 2 }} variant="outlined">
          <InputLabel>Machine Category</InputLabel>
          <Select
            value={newEquipment.related_category_id || 0}
            onChange={(e) => setNewEquipment({ ...newEquipment, related_category_id: Number(e.target.value) })}
            label="Machine Category"
            MenuProps={{ PaperProps: { sx: { borderRadius: 12 } } }}
          >
            <MenuItem value={0}>Uncategorized</MenuItem>
            {machineCategories.length === 0 ? (
              <MenuItem disabled>No machine categories available. Please add a category first.</MenuItem>
            ) : (
              machineCategories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mb: 2 }} variant="outlined">
          <InputLabel>Related Machines</InputLabel>
          <Select
            multiple
            value={newEquipment.related_items}
            onChange={(e) => setNewEquipment({ ...newEquipment, related_items: e.target.value })}
            label="Related Machines"
            MenuProps={{ PaperProps: { sx: { borderRadius: 12 } } }}
          >
            {machines
              .filter(m => m.category_id === newEquipment.related_category_id)
              .map((machine) => (
                <MenuItem key={machine.id} value={machine.id}>
                  {machine.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </>
    )}
    <Typography variant="h6" sx={{ mt: 3, mb: 2, fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#1F2937', textAlign: 'center', gridColumn: '1 / -1' }}>
      Custom Fields
    </Typography>
    {Array.isArray(newEquipment.customFields) ? newEquipment.customFields.map((field, index) => (
      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2, gridColumn: '1 / -1' }}>
        <TextField
          label={field.label}
          value={field.value}
          onChange={(e) => handleUpdateCustomFieldValue(setNewEquipment, index, e.target.value)}
          sx={{ mr: 2, flex: 1 }}
          type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          InputProps={{ sx: { borderRadius: 12 } }}
        />
        <IconButton onClick={() => handleOpenDeleteDialog({ index }, 'equipment-custom-field')} color="error">
          <DeleteIcon />
        </IconButton>
      </Box>
    )) : null}
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2, gridColumn: '1 / -1' }}>
      <TextField
        label="Field Label"
        value={newCustomField.label}
        onChange={(e) => setNewCustomField({ ...newCustomField, label: e.target.value })}
        sx={{ mr: 2, flex: 1 }}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        InputProps={{ sx: { borderRadius: 12 } }}
      />
      <FormControl sx={{ mr: 2, minWidth: 120, maxWidth: 120 }} variant="outlined">
        <InputLabel>Type</InputLabel>
        <Select
          value={newCustomField.type}
          onChange={(e) => setNewCustomField({ ...newCustomField, type: e.target.value })}
          label="Type"
          MenuProps={{ PaperProps: { sx: { borderRadius: 12 } } }}
        >
          <MenuItem value="text">Text</MenuItem>
          <MenuItem value="number">Number</MenuItem>
          <MenuItem value="date">Date</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Value"
        value={newCustomField.value}
        onChange={(e) => setNewCustomField({ ...newCustomField, value: e.target.value })}
        sx={{ mr: 2, flex: 1 }}
        type={newCustomField.type === 'date' ? 'date' : newCustomField.type === 'number' ? 'number' : 'text'}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        InputProps={{ sx: { borderRadius: 12 } }}
      />
      <StyledButton
        variant="outlined"
        onClick={() => handleAddCustomField(setNewEquipment)}
        disabled={!newCustomField.label || !newCustomField.value}
        color="primary"
      >
        Add Field
      </StyledButton>
    </Box>
  </DialogContent>
  <DialogActions sx={{ p: 3, background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)', justifyContent: 'center' }}>
    <Button onClick={handleCloseEquipmentDialog} sx={{ color: '#374151', fontWeight: 500 }}>Cancel</Button>
    <StyledButton variant="contained" color="primary" onClick={handlePreview} disabled={!newEquipment.name || !newEquipment.category_id}>
      Preview
    </StyledButton>
    <StyledButton variant="contained" color="primary" onClick={handleSaveEquipment}>
      Save
    </StyledButton>
  </DialogActions>
</StyledDialog>

      <StyledDialog open={openEquipmentDialog} onClose={handleCloseEquipmentDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(45deg, #10B981 0%, #34D399 100%)', color: '#FFFFFF', p: 3, fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
          {editEquipment ? 'Edit Equipment' : 'Add New Equipment'}
        </DialogTitle>
        <DialogContent sx={{ p: 3, overflowY: 'auto', maxHeight: '70vh', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <TextField
            label="Equipment Name"
            fullWidth
            value={newEquipment.name}
            onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
            sx={{ mb: 2 }}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            InputProps={{ sx: { borderRadius: 12 } }}
          />
          <TextField
            label="Equipment Type"
            fullWidth
            value={newEquipment.type}
            onChange={(e) => setNewEquipment({ ...newEquipment, type: e.target.value })}
            sx={{ mb: 2 }}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            InputProps={{ sx: { borderRadius: 12 } }}
          />
          <TextField
            label="Location"
            fullWidth
            value={newEquipment.location}
            onChange={(e) => setNewEquipment({ ...newEquipment, location: e.target.value })}
            sx={{ mb: 2 }}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            InputProps={{ sx: { borderRadius: 12 } }}
          />
          <FormControl fullWidth sx={{ mb: 2 }} variant="outlined">
            <InputLabel>Category</InputLabel>
            <Select
              value={newEquipment.category_id || 0}
              onChange={(e) => setNewEquipment({ ...newEquipment, category_id: Number(e.target.value) })}
              label="Category"
              MenuProps={{ PaperProps: { sx: { borderRadius: 12 } } }}
            >
              <MenuItem value={0}>Uncategorized</MenuItem>
              {equipmentCategories.length === 0 ? (
                <MenuItem disabled>No categories available. Please add a category first.</MenuItem>
              ) : (
                equipmentCategories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          <TextField
            label="Specifications"
            fullWidth
            value={newEquipment.specifications}
            onChange={(e) => setNewEquipment({ ...newEquipment, specifications: e.target.value })}
            sx={{ mb: 2, gridColumn: '1 / -1' }}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            multiline
            rows={4}
            InputProps={{ sx: { borderRadius: 12 } }}
          />
          <Box sx={{ mb: 2, gridColumn: '1 / -1' }}>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileChange(e, 'images')}
              ref={imageInputRef}
              style={{ display: 'none' }}
            />
            <Button variant="outlined" onClick={() => imageInputRef.current.click()} sx={{ mr: 2 }}>
              Upload Images
            </Button>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {imagePreviews.map((preview, index) => (
                <Box key={index} sx={{ position: 'relative' }}>
                  <img src={preview} alt={`Preview ${index}`} style={{ maxWidth: '100px', maxHeight: '100px' }} />
                  <IconButton
                    size="small"
                    onClick={() => {
                      setNewEquipment((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
                      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
                    }}
                    sx={{ position: 'absolute', top: 0, right: 0, color: 'red' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>
          <Box sx={{ mb: 2, gridColumn: '1 / -1' }}>
            <input
              type="file"
              multiple
              onChange={(e) => handleFileChange(e, 'files')}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <Button variant="outlined" onClick={() => fileInputRef.current.click()} sx={{ mr: 2 }}>
              Upload Files
            </Button>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {filePreviews.map((preview, index) => (
                <Box key={index} sx={{ position: 'relative' }}>
                  <a href={preview} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#1E40AF' }}>
                    File {index + 1}
                  </a>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setNewEquipment((prev) => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }));
                      setFilePreviews((prev) => prev.filter((_, i) => i !== index));
                    }}
                    sx={{ position: 'absolute', top: 0, right: 0, color: 'red' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>
          <FormControlLabel
            control={<Checkbox checked={showRelatedItemsEquipment} onChange={(e) => setShowRelatedItemsEquipment(e.target.checked)} />}
            label="Add Related Items"
            sx={{ mb: 2, gridColumn: '1 / -1' }}
          />
          {showRelatedItemsEquipment && (
            <>
              <FormControl fullWidth sx={{ mb: 2 }} variant="outlined">
                <InputLabel>Category</InputLabel>
                <Select
                  value={newEquipment.category_id || 0}
                  onChange={(e) => setNewEquipment({ ...newEquipment, category_id: Number(e.target.value) })}
                  label="Category"
                  MenuProps={{ PaperProps: { sx: { borderRadius: 12 } } }}
                >
                  <MenuItem value={0}>Uncategorized</MenuItem>
                  {equipmentCategories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }} variant="outlined">
                <InputLabel>Related Items</InputLabel>
                <Select
                  multiple
                  value={newEquipment.related_items}
                  onChange={(e) => setNewEquipment({ ...newEquipment, related_items: e.target.value })}
                  label="Related Items"
                  MenuProps={{ PaperProps: { sx: { borderRadius: 12 } } }}
                >
                  {machines
                    .filter(m => m.category_id === newEquipment.category_id)
                    .map((machine) => (
                      <MenuItem key={machine.id} value={machine.id}>
                        {machine.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </>
          )}
          <Typography variant="h6" sx={{ mt: 3, mb: 2, fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#1F2937', textAlign: 'center', gridColumn: '1 / -1' }}>
            Custom Fields
          </Typography>
          {Array.isArray(newEquipment.customFields) ? newEquipment.customFields.map((field, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2, gridColumn: '1 / -1' }}>
              <TextField
                label={field.label}
                value={field.value}
                onChange={(e) => handleUpdateCustomFieldValue(setNewEquipment, index, e.target.value)}
                sx={{ mr: 2, flex: 1 }}
                type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                InputProps={{ sx: { borderRadius: 12 } }}
              />
              <IconButton onClick={() => handleOpenDeleteDialog({ index }, 'equipment-custom-field')} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
          )) : null}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2, gridColumn: '1 / -1' }}>
            <TextField
              label="Field Label"
              value={newCustomField.label}
              onChange={(e) => setNewCustomField({ ...newCustomField, label: e.target.value })}
              sx={{ mr: 2, flex: 1 }}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              InputProps={{ sx: { borderRadius: 12 } }}
            />
            <FormControl sx={{ mr: 2, minWidth: 120, maxWidth: 120 }} variant="outlined">
              <InputLabel>Type</InputLabel>
              <Select
                value={newCustomField.type}
                onChange={(e) => setNewCustomField({ ...newCustomField, type: e.target.value })}
                label="Type"
                MenuProps={{ PaperProps: { sx: { borderRadius: 12 } } }}
              >
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="number">Number</MenuItem>
                <MenuItem value="date">Date</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Value"
              value={newCustomField.value}
              onChange={(e) => setNewCustomField({ ...newCustomField, value: e.target.value })}
              sx={{ mr: 2, flex: 1 }}
              type={newCustomField.type === 'date' ? 'date' : newCustomField.type === 'number' ? 'number' : 'text'}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              InputProps={{ sx: { borderRadius: 12 } }}
            />
            <StyledButton
              variant="outlined"
              onClick={() => handleAddCustomField(setNewEquipment)}
              disabled={!newCustomField.label || !newCustomField.value}
              color="primary"
            >
              Add Field
            </StyledButton>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)', justifyContent: 'center' }}>
          <Button onClick={handleCloseEquipmentDialog} sx={{ color: '#374151', fontWeight: 500 }}>Cancel</Button>
          <StyledButton variant="contained" color="primary" onClick={handlePreview} disabled={!newEquipment.name || !newEquipment.category_id}>
            Preview
          </StyledButton>
          <StyledButton variant="contained" color="primary" onClick={handleSaveEquipment}>
            Save
          </StyledButton>
        </DialogActions>
      </StyledDialog>

      <StyledDialog open={openCategoryDialog} onClose={handleCloseCategoryDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(45deg, #1E40AF 0%, #3B82F6 100%)', color: '#FFFFFF', p: 3, fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
          {editCategory ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent sx={{ p: 3, overflowY: 'auto', maxHeight: '70vh', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Category Name"
            fullWidth
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            sx={{ mb: 2 }}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            InputProps={{ sx: { borderRadius: 12 } }}
          />
          <FormControl fullWidth sx={{ mb: 2 }} variant="outlined">
            <InputLabel>Parent Category</InputLabel>
            <Select
              value={newCategory.parentId || ''}
              onChange={(e) => setNewCategory({ ...newCategory, parentId: e.target.value || null })}
              label="Parent Category"
              MenuProps={{ PaperProps: { sx: { borderRadius: 12 } } }}
            >
              <MenuItem value="">None</MenuItem>
              {(newCategory.type === 'machine' ? machineCategories : equipmentCategories)
                .filter((cat) => cat.id !== (editCategory?.id || 0))
                .map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3, background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)', justifyContent: 'center' }}>
          <Button onClick={handleCloseCategoryDialog} sx={{ color: '#374151', fontWeight: 500 }}>Cancel</Button>
          <StyledButton variant="contained" color="primary" onClick={handleSaveCategory}>
            Save
          </StyledButton>
        </DialogActions>
      </StyledDialog>

      <StyledDialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} maxWidth="xs">
        <DialogTitle sx={{ background: 'linear-gradient(45deg, #DC2626 0%, #EF4444 100%)', color: '#FFFFFF', p: 3, fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#1F2937', fontFamily: 'Roboto, sans-serif', textAlign: 'center' }}>
            Are you sure you want to delete {deleteType === 'machine' ? 'machine' : deleteType === 'equipment' ? 'equipment' : deleteType === 'machine-custom-field' || deleteType === 'equipment-custom-field' ? 'custom field' : deleteType === 'machine-image' || deleteType === 'equipment-image' ? 'image' : deleteType === 'machine-file' || deleteType === 'equipment-file' ? 'file' : 'category'}?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)', justifyContent: 'center' }}>
          <Button onClick={handleCloseDeleteDialog} sx={{ color: '#374151', fontWeight: 500 }}>Cancel</Button>
          <StyledButton variant="contained" color="error" onClick={handleConfirmDelete}>
            Delete
          </StyledButton>
        </DialogActions>
      </StyledDialog>

      <StyledDialog open={openDetailsDialog} onClose={() => { setOpenDetailsDialog(false); setSelectedItem(null); }} maxWidth="md" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(45deg, #1E40AF 0%, #3B82F6 100%)', color: '#FFFFFF', p: 3, fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
          {selectedSection === 'machines' ? 'Machine Details' : 'Equipment Details'} - {selectedItem?.name}
        </DialogTitle>
        <DialogContent sx={{ p: 3, overflowY: 'auto', maxHeight: '70vh', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {selectedItem && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#1F2937' }}>Details:</Typography>
              <TextField
                label="Name"
                value={selectedItem.name}
                fullWidth
                InputProps={{ readOnly: true }}
                sx={{ mb: 2, maxWidth: 400 }}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                InputProps={{ sx: { borderRadius: 12 } }}
              />
              {selectedSection === 'machines' ? (
                <>
                  <TextField
                    label="Location"
                    value={selectedItem.location || ''}
                    fullWidth
                    InputProps={{ readOnly: true }}
                    sx={{ mb: 2, maxWidth: 400 }}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ sx: { borderRadius: 12 } }}
                  />
                  <TextField
                    label="Serial Number"
                    value={selectedItem.serial_number || ''}
                    fullWidth
                    InputProps={{ readOnly: true }}
                    sx={{ mb: 2, maxWidth: 400 }}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ sx: { borderRadius: 12 } }}
                  />
                  <TextField
                    label="Description"
                    value={selectedItem.description || ''}
                    fullWidth
                    InputProps={{ readOnly: true }}
                    sx={{ mb: 2, maxWidth: 400 }}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    multiline
                    rows={4}
                  />
                </>
              ) : (
                <>
                  <TextField
                    label="Type"
                    value={selectedItem.type}
                    fullWidth
                    InputProps={{ readOnly: true }}
                    sx={{ mb: 2, maxWidth: 400 }}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ sx: { borderRadius: 12 } }}
                  />
                  <TextField
                    label="Location"
                    value={selectedItem.location || ''}
                    fullWidth
                    InputProps={{ readOnly: true }}
                    sx={{ mb: 2, maxWidth: 400 }}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ sx: { borderRadius: 12 } }}
                  />
                  <TextField
                    label="Specifications"
                    value={selectedItem.specifications || ''}
                    fullWidth
                    InputProps={{ readOnly: true }}
                    sx={{ mb: 2, maxWidth: 400 }}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    multiline
                    rows={4}
                  />
                </>
              )}
              <TextField
                label="Category"
                value={categories.find(c => c.id === (selectedItem.category_id || selectedItem.categoryId))?.name || 'Uncategorized'}
                fullWidth
                InputProps={{ readOnly: true }}
                sx={{ mb: 2, maxWidth: 400 }}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                InputProps={{ sx: { borderRadius: 12 } }}
              />
              {selectedItem.images && selectedItem.images.map((img, index) => (
                <img key={index} src={URL.createObjectURL(new Blob([new Uint8Array(img.data)]))} alt={`Image ${index}`} style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '10px' }} />
              ))}
              {selectedItem.files && selectedItem.files.map((file, index) => (
                <a key={index} href={URL.createObjectURL(new Blob([new Uint8Array(file.data)]))} target="_blank" rel="noopener noreferrer" style={{ marginTop: '10px', color: '#1E40AF', textDecoration: 'none' }}>
                  File {index + 1}
                </a>
              ))}
              {selectedItem.related_items.length > 0 && (
                <TextField
                  label="Related Items"
                  value={selectedSection === 'machines'
                    ? equipments.filter(e => selectedItem.related_items.includes(e.id)).map(e => e.name).join(', ')
                    : machines.filter(m => selectedItem.related_items.includes(m.id)).map(m => m.name).join(', ')
                  }
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 2, maxWidth: 400 }}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ sx: { borderRadius: 12 } }}
                />
              )}
              <Typography variant="h6" sx={{ mt: 3, mb: 2, fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#1F2937' }}>Custom Fields:</Typography>
              {Array.isArray(selectedItem.custom_field_groups) ? selectedItem.custom_field_groups.map((field, index) => (
                <TextField
                  key={index}
                  label={field.label}
                  value={field.value}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 2, maxWidth: 400 }}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ sx: { borderRadius: 12 } }}
                />
              )) : Array.isArray(selectedItem.customFields) ? selectedItem.customFields.map((field, index) => (
                <TextField
                  key={index}
                  label={field.label}
                  value={field.value}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 2, maxWidth: 400 }}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ sx: { borderRadius: 12 } }}
                />
              )) : null}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)', justifyContent: 'center' }}>
          <Button onClick={() => { setOpenDetailsDialog(false); setSelectedItem(null); }} sx={{ color: '#374151', fontWeight: 500 }}>Close</Button>
          <StyledButton
            onClick={() => {
              selectedSection === 'machines' ? handleOpenMachineDialog(selectedItem) : handleOpenEquipmentDialog(selectedItem);
              setOpenDetailsDialog(false);
            }}
            variant="contained"
            color="primary"
          >
            Edit
          </StyledButton>
          <StyledButton
            onClick={() => {
              handleOpenDeleteDialog(selectedItem, selectedSection);
              setOpenDetailsDialog(false);
            }}
            variant="contained"
            color="error"
          >
            Delete
          </StyledButton>
        </DialogActions>
      </StyledDialog>

      <StyledDialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(45deg, #1E40AF 0%, #3B82F6 100%)', color: '#FFFFFF', p: 3, fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
          Preview {openMachineDialog ? 'Machine' : 'Equipment'}
        </DialogTitle>
        <DialogContent sx={{ p: 3, overflowY: 'auto', maxHeight: '70vh', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {openMachineDialog && (
              <>
                <TextField
                  label="Machine Name"
                  value={newMachine.name}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 2, maxWidth: 400 }}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ sx: { borderRadius: 12 } }}
                />
                <TextField
                  label="Location"
                  value={newMachine.location}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 2, maxWidth: 400 }}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ sx: { borderRadius: 12 } }}
                />
                <TextField
                  label="Serial Number"
                  value={newMachine.serial_number}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 2, maxWidth: 400 }}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ sx: { borderRadius: 12 } }}
                />
                <TextField
                  label="Description"
                  value={newMachine.description}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 2, maxWidth: 400 }}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  multiline
                  rows={4}
                />
                <TextField
                  label="Category"
                  value={machineCategories.find(c => c.id === newMachine.category_id)?.name || 'Uncategorized'}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 2, maxWidth: 400 }}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ sx: { borderRadius: 12 } }}
                />
                {imagePreviews.map((preview, index) => (
                  <img key={index} src={preview} alt={`Preview ${index}`} style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '10px' }} />
                ))}
                {filePreviews.map((preview, index) => (
                  <a key={index} href={preview} target="_blank" rel="noopener noreferrer" style={{ marginTop: '10px', color: '#1E40AF', textDecoration: 'none' }}>
                    File {index + 1}
                  </a>
                ))}
                {newMachine.related_items.length > 0 && (
                  <TextField
                    label="Related Items"
                    value={equipments.filter(e => newMachine.related_items.includes(e.id)).map(e => e.name).join(', ')}
                    fullWidth
                    InputProps={{ readOnly: true }}
                    sx={{ mb: 2, maxWidth: 400 }}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ sx: { borderRadius: 12 } }}
                  />
                )}
              </>
            )}
            {openEquipmentDialog && (
              <>
                <TextField
                  label="Equipment Name"
                  value={newEquipment.name}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 2, maxWidth: 400 }}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ sx: { borderRadius: 12 } }}
                />
                <TextField
                  label="Type"
                  value={newEquipment.type}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 2, maxWidth: 400 }}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ sx: { borderRadius: 12 } }}
                />
                <TextField
                  label="Location"
                  value={newEquipment.location}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 2, maxWidth: 400 }}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ sx: { borderRadius: 12 } }}
                />
                <TextField
                  label="Specifications"
                  value={newEquipment.specifications}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 2, maxWidth: 400 }}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  multiline
                  rows={4}
                />
                <TextField
                  label="Category"
                  value={equipmentCategories.find(c => c.id === newEquipment.category_id)?.name || 'Uncategorized'}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 2, maxWidth: 400 }}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ sx: { borderRadius: 12 } }}
                />
                {imagePreviews.map((preview, index) => (
                  <img key={index} src={preview} alt={`Preview ${index}`} style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '10px' }} />
                ))}
                {filePreviews.map((preview, index) => (
                  <a key={index} href={preview} target="_blank" rel="noopener noreferrer" style={{ marginTop: '10px', color: '#1E40AF', textDecoration: 'none' }}>
                    File {index + 1}
                  </a>
                ))}
                {newEquipment.related_items.length > 0 && (
                  <TextField
                    label="Related Items"
                    value={machines.filter(m => newEquipment.related_items.includes(m.id)).map(m => m.name).join(', ')}
                    fullWidth
                    InputProps={{ readOnly: true }}
                    sx={{ mb: 2, maxWidth: 400 }}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ sx: { borderRadius: 12 } }}
                  />
                )}
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)', justifyContent: 'center' }}>
          <Button onClick={() => setPreviewOpen(false)} sx={{ color: '#374151', fontWeight: 500 }}>Close</Button>
          <StyledButton variant="contained" color="primary" onClick={openMachineDialog ? handleSaveMachine : handleSaveEquipment}>
            Save
          </StyledButton>
        </DialogActions>
      </StyledDialog>
    </Container>
  );
}

export default MachinesAndEquipments;