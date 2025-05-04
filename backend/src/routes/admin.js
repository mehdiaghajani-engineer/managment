const express = require('express');
const router = express.Router();
const { User, Role } = require('../models');
const { checkPermission } = require('../middleware/checkPermission');

// دریافت لیست کاربران (با اطلاعات نقش) - نیاز به مجوز مدیریت کاربران
router.get('/users', checkPermission('manage_users'), async (req, res) => {
  try {
    const users = await User.findAll({ include: Role });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// افزودن کاربر جدید
router.post('/users', checkPermission('manage_users'), async (req, res) => {
  try {
    const { username, password, roleName } = req.body;
    const role = await Role.findOne({ where: { name: roleName } });
    if (!role) {
      return res.status(400).json({ error: 'Role not found' });
    }
    // در محیط تولیدی پسوردها باید هش شوند
    const newUser = await User.create({
      username,
      password_hash: password,
      role_id: role.id
    });
    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error adding user' });
  }
});

// ویرایش کاربر
router.put('/users/:id', checkPermission('manage_users'), async (req, res) => {
  try {
    const { username, password, roleName } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (roleName) {
      const role = await Role.findOne({ where: { name: roleName } });
      if (!role) {
        return res.status(400).json({ error: 'Role not found' });
      }
      user.role_id = role.id;
    }
    if (username) {
      user.username = username;
    }
    if (password) {
      user.password_hash = password;
    }
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating user' });
  }
});

// حذف کاربر
router.delete('/users/:id', checkPermission('manage_users'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting user' });
  }
});

module.exports = router;
