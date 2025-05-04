const express = require('express');
const router = express.Router();
const { Permission } = require('../models');
const { checkPermission } = require('../middleware/checkPermission');

// دریافت همه مجوزها (به صورت تخت) - نیاز به مجوز مدیریت مجوزها
router.get('/', checkPermission('manage_permissions'), async (req, res) => {
  try {
    const permissions = await Permission.findAll();
    res.json(permissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching permissions' });
  }
});

// دریافت مجوزها به صورت درختی بر اساس فیلد group
router.get('/tree', checkPermission('manage_permissions'), async (req, res) => {
  try {
    const permissions = await Permission.findAll();
    const tree = {};
    permissions.forEach(p => {
      const group = p.group || 'Ungrouped';
      if (!tree[group]) tree[group] = [];
      tree[group].push(p);
    });
    res.json(tree);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching permission tree' });
  }
});

// ایجاد مجوز جدید
router.post('/', checkPermission('manage_permissions'), async (req, res) => {
  try {
    const { name, description, parent_id, group } = req.body;
    const newPermission = await Permission.create({
      name,
      description,
      parent_id: parent_id || null,
      group: group || null
    });
    res.status(201).json(newPermission);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating permission' });
  }
});

// ویرایش مجوز
router.put('/:id', checkPermission('manage_permissions'), async (req, res) => {
  try {
    const permission = await Permission.findByPk(req.params.id);
    if (!permission) {
      return res.status(404).json({ error: 'Permission not found' });
    }
    const { name, description, parent_id, group } = req.body;
    permission.name = name || permission.name;
    permission.description = description || permission.description;
    permission.parent_id = parent_id !== undefined ? parent_id : permission.parent_id;
    permission.group = group !== undefined ? group : permission.group;
    await permission.save();
    res.json(permission);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating permission' });
  }
});

// حذف مجوز
router.delete('/:id', checkPermission('manage_permissions'), async (req, res) => {
  try {
    const permission = await Permission.findByPk(req.params.id);
    if (!permission) {
      return res.status(404).json({ error: 'Permission not found' });
    }
    await permission.destroy();
    res.json({ message: 'Permission deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting permission' });
  }
});

module.exports = router;
