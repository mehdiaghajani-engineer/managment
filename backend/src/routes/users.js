const express = require('express');
const router = express.Router();
const { User, Role } = require('../models'); // مدل‌های کاربر و نقش
const { checkPermission } = require('../middleware/checkPermission'); // بررسی مجوزها

// دریافت لیست کاربران (نیاز به مجوز `manage_users`)
router.get('/', checkPermission('manage_users'), async (req, res) => {
  try {
    const users = await User.findAll({
      include: Role,
      attributes: { exclude: ['password_hash'] } // حذف `password_hash` از خروجی
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// دریافت یک کاربر بر اساس `id`
router.get('/:id', checkPermission('manage_users'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { include: Role });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching user' });
  }
});

module.exports = router;
