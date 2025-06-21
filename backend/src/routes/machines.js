const express = require('express');
const router = express.Router();
const { checkPermission } = require('../middleware/checkPermission');
const { Machine, Category } = require('../models');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // محدودیت 10MB

// Machines - مشاهده لیست ماشین‌ها
router.get('/', checkPermission(['view-machinesandequipments']), async (req, res) => {
  try {
    const machines = await Machine.findAll({
      include: [{ model: Category, as: 'category' }], // اصلاح شده
      attributes: { exclude: ['createdAt', 'updatedAt'] }
    });
    res.status(200).json(machines);
  } catch (err) {
    console.error('Error fetching machines:', {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ error: 'Failed to fetch machines', details: err.message });
  }
});

// Machines - اضافه کردن ماشین جدید
router.post('/', 
  upload.fields([{ name: 'images', maxCount: 10 }, { name: 'files', maxCount: 10 }]),
  checkPermission(['create-machine']), 
  async (req, res) => {
    try {
      const { name, location, serial_number, description, custom_field_groups, category_id, related_category_id, related_items } = req.body;
      console.log('Received request body:', req.body);

      if (!name || !category_id) {
        return res.status(400).json({
          error: 'Validation failed',
          details: 'Both "name" and "category_id" fields are required'
        });
      }

      const machineData = {
        name,
        location: location || null,
        serial_number: serial_number || null,
        description: description || null,
        custom_field_groups: custom_field_groups ? JSON.parse(custom_field_groups) : [],
        category_id,
        related_category_id: related_category_id || null,
        related_items: related_items ? JSON.parse(related_items) : []
      };

      // مدیریت تصاویر
      if (req.files['images']) {
        machineData.images = req.files['images'].map(file => file.buffer);
      }
      // مدیریت فایل‌ها
      if (req.files['files']) {
        machineData.files = req.files['files'].map(file => file.buffer);
      }

      const machine = await Machine.create(machineData);
      res.status(201).json({
        success: true,
        message: 'Machine created successfully',
        data: machine
      });
    } catch (err) {
      console.error('Error adding machine:', {
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
      });
      res.status(500).json({ error: 'Failed to create machine', details: err.message });
    }
  }
);

// Machines - ویرایش ماشین
router.put('/:id', 
  upload.fields([{ name: 'images', maxCount: 10 }, { name: 'files', maxCount: 10 }]),
  checkPermission(['edit-machine']), 
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, location, serial_number, description, custom_field_groups, category_id, related_category_id, related_items } = req.body;
      console.log('Received request body for update:', req.body);

      const machine = await Machine.findByPk(id);
      if (!machine) {
        return res.status(404).json({ error: 'Machine not found', details: `No machine with ID ${id}` });
      }

      const updateData = {
        name: name !== undefined ? name : machine.name,
        location: location !== undefined ? location : machine.location,
        serial_number: serial_number !== undefined ? serial_number : machine.serial_number,
        description: description !== undefined ? description : machine.description,
        custom_field_groups: custom_field_groups !== undefined ? JSON.parse(custom_field_groups) : machine.custom_field_groups,
        category_id: category_id !== undefined ? category_id : machine.category_id,
        related_category_id: related_category_id !== undefined ? related_category_id : machine.related_category_id,
        related_items: related_items !== undefined ? JSON.parse(related_items) : machine.related_items
      };

      // مدیریت تصاویر
      if (req.files['images']) {
        updateData.images = req.files['images'].map(file => file.buffer);
      }
      // مدیریت فایل‌ها
      if (req.files['files']) {
        updateData.files = req.files['files'].map(file => file.buffer);
      }

      await machine.update(updateData);

      res.status(200).json({
        success: true,
        message: `Machine ${id} updated successfully`,
        data: machine
      });
    } catch (err) {
      console.error('Error updating machine:', {
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
      });
      res.status(500).json({ error: 'Failed to update machine', details: err.message });
    }
  }
);

// Machines - حذف ماشین
router.delete('/:id', checkPermission(['delete-machine']), async (req, res) => {
  try {
    const { id } = req.params;
    const machine = await Machine.findByPk(id);
    if (!machine) {
      return res.status(404).json({ error: 'Machine not found', details: `No machine with ID ${id}` });
    }
    await machine.destroy();
    res.status(200).json({
      success: true,
      message: `Machine ${id} deleted successfully`
    });
  } catch (err) {
    console.error('Error deleting machine:', {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ error: 'Failed to delete machine', details: err.message });
  }
});

module.exports = router;