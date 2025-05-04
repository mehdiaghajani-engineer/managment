const express = require('express');
const router = express.Router();
const { Role, Permission } = require('../models');
const { checkPermission } = require('../middleware/checkPermission');

// دریافت همه نقش‌ها (با مجوزها) - نیاز به مجوز مدیریت نقش‌ها
router.get('/', checkPermission('manage_roles'), async (req, res) => {
  try {
    const roles = await Role.findAll({ include: Permission });
    res.json(roles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching roles' });
  }
});

// ایجاد نقش جدید (با قابلیت درختی)
router.post('/', checkPermission('manage_roles'), async (req, res) => {
  try {
    const { name, parent_id } = req.body;
    const newRole = await Role.create({ name, parent_id: parent_id || null });
    res.status(201).json(newRole);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating role' });
  }
});

// بروزرسانی نقش
router.put('/:id', checkPermission('manage_roles'), async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ error: 'Role not found' });
    const { name, parent_id } = req.body;
    role.name = name || role.name;
    role.parent_id = parent_id !== undefined ? parent_id : role.parent_id;
    await role.save();
    res.json(role);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating role' });
  }
});

// حذف نقش
router.delete('/:id', checkPermission('manage_roles'), async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ error: 'Role not found' });
    await role.destroy();
    res.json({ message: 'Role deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting role' });
  }
});

// به‌روزرسانی مجوزهای یک نقش
router.put('/:id/permissions', checkPermission('manage_roles'), async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ error: 'Role not found' });
    
    // انتظار داریم req.body.permissions یک آرایه از نام‌های مجوز باشد
    const { permissions: permissionNames } = req.body;
    if (!Array.isArray(permissionNames)) {
      return res.status(400).json({ error: 'Permissions must be an array of names' });
    }
    
    const permissions = await Permission.findAll({ where: { name: permissionNames } });
    await role.setPermissions(permissions);
    
    const updatedRole = await Role.findByPk(req.params.id, { include: Permission });
    res.json(updatedRole);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating role permissions' });
  }
});

module.exports = router;
