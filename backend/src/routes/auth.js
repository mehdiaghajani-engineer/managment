// backend/src/routes/auth.js

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models'); // توجه کنید اگر از Role هم استفاده می‌کنید باید آن را ایمپورت کنید

const SECRET_KEY = process.env.SECRET_KEY || '1234';

/**
 * 1) لاگین کاربر
 * - فقط با userId توکن را امضا می‌کنیم
 * - هیچ اطلاعاتی از نقش در خود توکن قرار نمی‌دهیم
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // یافتن کاربر در دیتابیس
    const user = await User.findOne({ where: { username } });
    if (!user || user.password_hash !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // ساخت توکن فقط با userId
    const token = jwt.sign(
      { userId: user.id },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    console.error('Error in POST /login:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 2) دریافت اطلاعات کاربر (GET /api/auth/me)
 * در فرانت‌اند می‌توانید با داشتن توکن معتبر به این مسیر GET بزنید
 * تا نقش (role) و مجوزها (permissions) یا هر اطلاعات دیگری را بگیرید
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY); // اینجا userId را می‌گیریم

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // اگر می‌خواهید نقش و مجوزهای کاربر را هم برگردانید:
    // Role را هم ایمپورت کنید و دیتابیس مدلش را داشته باشید
    const role = await Role.findByPk(user.role_id);
    // اگر بخواهید لیست permissions این نقش را هم بدهید:
    // حتماً در مدل Role رابطه belongsToMany با Permission تعریف شده باشد
    // اگر از role.getPermissions() استفاده می‌کنید
    let permissionNames = [];
    if (role) {
      const perms = await role.getPermissions();
      permissionNames = perms.map(p => p.name);
    }

    res.json({
      userId: user.id,
      username: user.username,
      role: role ? role.name : 'guest',
      permissions: permissionNames
    });
  } catch (err) {
    console.error('Error in GET /me:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;
