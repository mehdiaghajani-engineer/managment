require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const { sequelize, User, Role, Permission, RolePermission, Entity, Section, DynamicData, Machine, Equipment, Category } = require('./models');
const { checkPermission } = require('./middleware/checkPermission');
const autoScanPermissions = require('./autoScanPermissions');

const pageRoutes = require('./routes/pages');
const machinesRoutes = require('./routes/machines');
const inventoryRoutes = require('./routes/inventory');
const permissionRoutes = require('./routes/permission');
const equipmentsRoutes = require('./routes/equipments');
const categoriesRoutes = require('./routes/categories');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY || '1234'; // توصیه می‌شه یه کلید امن‌تر توی .env بذاری

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Middleware برای اضافه کردن همه مدل‌ها به req
app.use((req, res, next) => {
  req.models = {
    User,
    Role,
    Permission,
    RolePermission,
    Entity,
    Section,
    DynamicData,
    Machine,
    Equipment,
    Category
  };
  next();
});

// استفاده از روترهای جداگانه
app.use('/api/pages', pageRoutes);
app.use('/api/machines', machinesRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/equipments', equipmentsRoutes);
app.use('/api/categories', categoriesRoutes);

// ---------------------
// لاگین (JWT فقط userId)
// ---------------------
app.post('/api/auth/login', async (req, res) => {
  console.log(`[LOGIN] Request body at ${new Date().toISOString()}:`, req.body);
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    console.log(`[LOGIN] User found at ${new Date().toISOString()}:`, user ? user.toJSON() : null);
    if (!user || user.password_hash !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
    return res.json({ success: true, token });
  } catch (err) {
    console.error(`[ERROR] Login error at ${new Date().toISOString()}:`, {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// ---------------------
// دریافت اطلاعات کاربر
// ---------------------
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findByPk(decoded.userId, {
      include: { model: Role, as: 'Role', include: { model: Permission, as: 'Permissions' } }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({
      success: true,
      userId: user.id,
      username: user.username,
      role: user.Role ? user.Role.name : 'guest',
      permissions: user.Role && user.Role.Permissions ? user.Role.Permissions.map(p => p.name) : []
    });
  } catch (error) {
    console.error(`[ERROR] /api/auth/me error at ${new Date().toISOString()}:`, {
      message: error.message,
      stack: error.stack
    });
    return res.status(401).json({ error: 'Invalid token or server error', details: error.message });
  }
});

// ---------------------
// داشبورد
// ---------------------
let dashboardData = {
  stats: {
    totalUsers: 50,
    totalRevenue: 12000
  }
};

app.get('/api/dashboard', checkPermission(['view-dashboard']), (req, res) => {
  res.status(200).json(dashboardData);
});

app.put('/api/dashboard', checkPermission(['edit-dashboard']), (req, res) => {
  dashboardData = { ...dashboardData, ...req.body };
  res.status(200).json(dashboardData);
});

// ---------------------
// مدیریت کاربران (Admin Panel)
// ---------------------
app.get('/api/admin/users', checkPermission(['manage-users']), async (req, res) => {
  try {
    const users = await User.findAll({ include: { model: Role, as: 'Role' } });
    res.status(200).json(users);
  } catch (err) {
    console.error(`[ERROR] Fetching users error at ${new Date().toISOString()}:`, {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
});

app.post('/api/admin/users', checkPermission(['manage-users']), async (req, res) => {
  try {
    const { username, password, roleName } = req.body;
    const role = await Role.findOne({ where: { name: roleName } });
    if (!role) {
      return res.status(400).json({ error: 'Role not found' });
    }
    const newUser = await User.create({
      username,
      password_hash: password,
      role_id: role.id
    });
    res.status(201).json(newUser);
  } catch (err) {
    console.error(`[ERROR] Adding user error at ${new Date().toISOString()}:`, {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: 'Failed to add user', details: err.message });
  }
});

app.put('/api/admin/users/:id', checkPermission(['manage-users']), async (req, res) => {
  try {
    const { username, password, roleName } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found', details: `No user with ID ${req.params.id}` });
    }
    if (roleName) {
      const role = await Role.findOne({ where: { name: roleName } });
      if (!role) {
        return res.status(400).json({ error: 'Role not found' });
      }
      user.role_id = role.id;
    }
    if (username) user.username = username;
    if (password) user.password_hash = password;
    await user.save();
    res.status(200).json(user);
  } catch (err) {
    console.error(`[ERROR] Updating user error at ${new Date().toISOString()}:`, {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: 'Failed to update user', details: err.message });
  }
});

app.delete('/api/admin/users/:id', checkPermission(['manage-users']), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found', details: `No user with ID ${req.params.id}` });
    }
    await user.destroy();
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (err) {
    console.error(`[ERROR] Deleting user error at ${new Date().toISOString()}:`, {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: 'Failed to delete user', details: err.message });
  }
});

// ---------------------
// مدیریت نقش‌ها (manage_roles)
// ---------------------
app.get('/api/roles', checkPermission(['manage-roles']), async (req, res) => {
  try {
    const roles = await Role.findAll({ include: { model: Permission, as: 'Permissions' } });
    res.status(200).json(roles);
  } catch (err) {
    console.error(`[ERROR] Fetching roles error at ${new Date().toISOString()}:`, {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: 'Failed to fetch roles', details: err.message });
  }
});

app.post('/api/roles', checkPermission(['manage-roles']), async (req, res) => {
  try {
    const { name, parent_id } = req.body;
    const newRole = await Role.create({ name, parent_id: parent_id || null });
    res.status(201).json(newRole);
  } catch (err) {
    console.error(`[ERROR] Creating role error at ${new Date().toISOString()}:`, {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: 'Failed to create role', details: err.message });
  }
});

app.put('/api/roles/:id', checkPermission(['manage-roles']), async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ error: 'Role not found', details: `No role with ID ${req.params.id}` });
    const { name, parent_id } = req.body;
    role.name = name || role.name;
    role.parent_id = parent_id !== undefined ? parent_id : role.parent_id;
    await role.save();
    res.status(200).json(role);
  } catch (err) {
    console.error(`[ERROR] Updating role error at ${new Date().toISOString()}:`, {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: 'Failed to update role', details: err.message });
  }
});

app.delete('/api/roles/:id', checkPermission(['manage-roles']), async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ error: 'Role not found', details: `No role with ID ${req.params.id}` });
    await role.destroy();
    res.status(200).json({ success: true, message: 'Role deleted' });
  } catch (err) {
    console.error(`[ERROR] Deleting role error at ${new Date().toISOString()}:`, {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: 'Failed to delete role', details: err.message });
  }
});

app.put('/api/roles/:id/permissions', checkPermission(['manage-roles']), async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ error: 'Role not found', details: `No role with ID ${req.params.id}` });
    const { permissions: permissionNames } = req.body;
    if (!Array.isArray(permissionNames)) {
      return res.status(400).json({ error: 'Permissions must be an array of names' });
    }
    const perms = await Permission.findAll({ where: { name: permissionNames } });
    await role.setPermissions(perms);
    const updated = await Role.findByPk(role.id, { include: { model: Permission, as: 'Permissions' } });
    res.status(200).json(updated);
  } catch (err) {
    console.error(`[ERROR] Updating role permissions error at ${new Date().toISOString()}:`, {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: 'Failed to update role permissions', details: err.message });
  }
});

// ---------------------
// مدیریت مجوزها (manage_permissions)
// ---------------------
app.get('/api/permissions', checkPermission(['manage-permissions']), async (req, res) => {
  try {
    const perms = await Permission.findAll();
    res.status(200).json(perms);
  } catch (err) {
    console.error(`[ERROR] Fetching permissions error at ${new Date().toISOString()}:`, {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: 'Failed to fetch permissions', details: err.message });
  }
});

app.post('/api/permissions', checkPermission(['manage-permissions']), async (req, res) => {
  try {
    const { name, description, group, parent_id } = req.body;
    const newPerm = await Permission.create({
      name,
      description,
      parent_id: parent_id || null,
      group: group || null
    });
    res.status(201).json(newPerm);
  } catch (err) {
    console.error(`[ERROR] Creating permission error at ${new Date().toISOString()}:`, {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: 'Failed to create permission', details: err.message });
  }
});

app.put('/api/permissions/:id', checkPermission(['manage-permissions']), async (req, res) => {
  try {
    const perm = await Permission.findByPk(req.params.id);
    if (!perm) return res.status(404).json({ error: 'Permission not found', details: `No permission with ID ${req.params.id}` });
    const { name, description, group, parent_id } = req.body;
    perm.name = name || perm.name;
    perm.description = description || perm.description;
    perm.parent_id = parent_id !== undefined ? parent_id : perm.parent_id;
    perm.group = group !== undefined ? group : perm.group;
    await perm.save();
    res.status(200).json(perm);
  } catch (err) {
    console.error(`[ERROR] Updating permission error at ${new Date().toISOString()}:`, {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: 'Failed to update permission', details: err.message });
  }
});

app.delete('/api/permissions/:id', checkPermission(['manage-permissions']), async (req, res) => {
  try {
    const perm = await Permission.findByPk(req.params.id);
    if (!perm) return res.status(404).json({ error: 'Permission not found', details: `No permission with ID ${req.params.id}` });
    await perm.destroy();
    res.status(200).json({ success: true, message: 'Permission deleted' });
  } catch (err) {
    console.error(`[ERROR] Deleting permission error at ${new Date().toISOString()}:`, {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: 'Failed to delete permission', details: err.message });
  }
});

// ---------------------
// تست مجوز
// ---------------------
app.get('/api/test-update', checkPermission(['update-machine']), (req, res) => {
  res.status(200).json({ message: 'Access granted to update machine.' });
});

// ---------------------
// Middleware برای مدیریت خطاها
// ---------------------
app.use((err, req, res, next) => {
  console.error(`[ERROR] Server error at ${new Date().toISOString()}:`, {
    message: err.message,
    stack: err.stack
  });
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// ---------------------
// Start server
// ---------------------
async function startServer() {
  try {
    // فقط در محیط توسعه یا برای تست اولیه Seed رو اجرا کن
    if (process.env.NODE_ENV !== 'production') {
      const seedData = require('./seed.js');
      await seedData();
      console.log('Seed data executed successfully!');
    }

    // اجرای autoScanPermissions
    await autoScanPermissions();
    console.log('Permissions scanned successfully!');

    // شروع سرور
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} at ${new Date().toISOString()}`);
    });
  } catch (err) {
    console.error(`[ERROR] Server startup error at ${new Date().toISOString()}:`, {
      message: err.message,
      stack: err.stack
    });
  }
}

startServer();