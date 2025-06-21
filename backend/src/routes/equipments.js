const express = require('express');
const router = express.Router();
const { checkPermission } = require('../middleware/checkPermission');
const { Equipment, Category, Machine } = require('../models');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // محدودیت 10MB

// Equipments - مشاهده لیست تجهیزات
router.get('/', checkPermission(['view-machinesandequipments']), async (req, res) => {
  try {
    const equipments = await Equipment.findAll({
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      include: [
        { model: Category, as: 'category' },
        { model: Machine, as: 'associatedMachine' }, // حالا که ستون اضافه شده، کار می‌کنه
      ],
    });
    res.status(200).json(equipments);
  } catch (err) {
    console.error('Error fetching equipments:', {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({ error: 'Failed to fetch equipments', details: err.message });
  }
});

// Equipments - اضافه کردن تجهیزات جدید
router.post(
  '/',
  upload.fields([{ name: 'images', maxCount: 10 }, { name: 'files', maxCount: 10 }]),
  checkPermission(['create-equipment']),
  async (req, res) => {
    try {
      const { name, type, description, customFields, category_id, location, specifications, related_category_id, related_items, associated_machine_id } = req.body;
      console.log('Received request body:', req.body);

      if (!name || !category_id) {
        return res.status(400).json({
          error: 'Validation failed',
          details: 'Both "name" and "category_id" fields are required',
        });
      }

      const equipmentData = {
        name,
        type: type || null,
        description: description || null,
        location: location || null,
        specifications: specifications || null,
        customFields: customFields ? JSON.parse(customFields) : [],
        category_id,
        related_category_id: related_category_id || null,
        related_items: related_items ? JSON.parse(related_items) : [],
        associated_machine_id: associated_machine_id || null, // اضافه کردن این فیلد
      };

      // مدیریت تصاویر
      if (req.files['images']) {
        equipmentData.images = req.files['images'].map((file) => file.buffer);
      }
      // مدیریت فایل‌ها
      if (req.files['files']) {
        equipmentData.files = req.files['files'].map((file) => file.buffer);
      }

      const equipment = await Equipment.create(equipmentData);
      res.status(201).json({
        success: true,
        message: 'Equipment created successfully',
        data: equipment,
      });
    } catch (err) {
      console.error('Error adding equipment:', {
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
      });
      res.status(500).json({ error: 'Failed to create equipment', details: err.message });
    }
  }
);

// Equipments - ویرایش تجهیزات
router.put(
  '/:id',
  upload.fields([{ name: 'images', maxCount: 10 }, { name: 'files', maxCount: 10 }]),
  checkPermission(['edit-equipment']),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, type, description, customFields, category_id, location, specifications, related_category_id, related_items, associated_machine_id } = req.body;
      console.log('Received request body for update:', req.body);

      const equipment = await Equipment.findByPk(id);
      if (!equipment) {
        return res.status(404).json({ error: 'Equipment not found', details: `No equipment with ID ${id}` });
      }

      const updateData = {
        name: name !== undefined ? name : equipment.name,
        type: type !== undefined ? type : equipment.type,
        description: description !== undefined ? description : equipment.description,
        location: location !== undefined ? location : equipment.location,
        specifications: specifications !== undefined ? specifications : equipment.specifications,
        customFields: customFields !== undefined ? JSON.parse(customFields) : equipment.customFields,
        category_id: category_id !== undefined ? category_id : equipment.category_id,
        related_category_id: related_category_id !== undefined ? related_category_id : equipment.related_category_id,
        related_items: related_items !== undefined ? JSON.parse(related_items) : equipment.related_items,
        associated_machine_id: associated_machine_id !== undefined ? associated_machine_id : equipment.associated_machine_id, // اضافه کردن این فیلد
      };

      // مدیریت تصاویر
      if (req.files['images']) {
        updateData.images = req.files['images'].map((file) => file.buffer);
      }
      // مدیریت فایل‌ها
      if (req.files['files']) {
        updateData.files = req.files['files'].map((file) => file.buffer);
      }

      await equipment.update(updateData);

      res.status(200).json({
        success: true,
        message: `Equipment ${id} updated successfully`,
        data: equipment,
      });
    } catch (err) {
      console.error('Error updating equipment:', {
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
      });
      res.status(500).json({ error: 'Failed to update equipment', details: err.message });
    }
  }
);

// Equipments - حذف تجهیزات
router.delete('/:id', checkPermission(['delete-equipment']), async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found', details: `No equipment with ID ${id}` });
    }
    await equipment.destroy();
    res.status(200).json({
      success: true,
      message: `Equipment ${id} deleted successfully`,
    });
  } catch (err) {
    console.error('Error deleting equipment:', {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({ error: 'Failed to delete equipment', details: err.message });
  }
});

module.exports = router;