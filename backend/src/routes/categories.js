const express = require('express');
const router = express.Router();
const { checkPermission } = require('../middleware/checkPermission');
const { Category, Machine, Equipment } = require('../models');

// Categories - مشاهده لیست دسته‌بندی‌ها با فیلتر بر اساس type
router.get('/', checkPermission(['view-categories']), async (req, res) => {
  try {
    const { type } = req.query;
    const whereClause = type ? { type } : {};
    const categories = await Category.findAll({
      where: whereClause,
      include: [
        { model: Machine, as: 'machines' },
        { model: Equipment, as: 'equipments' },
        { model: Category, as: 'parent' }, // برای گرفتن والد، اگه نیاز داری
      ],
    });
    res.status(200).json(categories);
  } catch (err) {
    console.error('Error fetching categories:', {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({ error: 'Failed to fetch categories', details: err.message });
  }
});

// Categories - اضافه کردن دسته‌بندی جدید
router.post('/', checkPermission(['create-category']), async (req, res) => {
  try {
    const { name, type, parentId } = req.body;
    console.log('Received request body:', req.body);

    if (!name || !type) {
      return res.status(400).json({
        error: 'Validation failed',
        details: 'Both "name" and "type" fields are required',
      });
    }

    // اعتبارسنجی parentId
    if (parentId) {
      const parent = await Category.findByPk(parentId);
      if (!parent) {
        return res.status(400).json({ error: 'Invalid parentId', details: 'Parent category does not exist' });
      }
    }

    const category = await Category.create({
      name,
      type,
      parentId: parentId || null,
    });
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (err) {
    console.error('Error adding category:', {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({ error: 'Failed to create category', details: err.message });
  }
});

// Categories - ویرایش دسته‌بندی
router.put('/:id', checkPermission(['edit-category']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, parentId } = req.body;
    console.log('Received request body for update:', req.body);

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found', details: `No category with ID ${id}` });
    }

    // اعتبارسنجی parentId اگه تغییر کرده
    if (parentId !== undefined && parentId !== category.parentId) {
      const parent = await Category.findByPk(parentId);
      if (!parent) {
        return res.status(400).json({ error: 'Invalid parentId', details: 'Parent category does not exist' });
      }
    }

    await category.update({
      name: name !== undefined ? name : category.name,
      type: type !== undefined ? type : category.type,
      parentId: parentId !== undefined ? parentId : category.parentId,
    });

    res.status(200).json({
      success: true,
      message: `Category ${id} updated successfully`,
      data: category,
    });
  } catch (err) {
    console.error('Error updating category:', {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({ error: 'Failed to update category', details: err.message });
  }
});

// Categories - حذف دسته‌بندی
router.delete('/:id', checkPermission(['delete-category']), async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found', details: `No category with ID ${id}` });
    }
    await category.destroy();
    res.status(200).json({
      success: true,
      message: `Category ${id} deleted successfully`,
    });
  } catch (err) {
    console.error('Error deleting category:', {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({ error: 'Failed to delete category', details: err.message });
  }
});

module.exports = router;