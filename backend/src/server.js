require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const { sequelize, User, Role, Permission, RolePermission, Entity, Section, DynamicData } = require('./models');
const { checkPermission } = require('./middleware/checkPermission');
const autoScanPermissions = require('./autoScanPermissions');

const pageRoutes = require('./routes/pages');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY || '1234';

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.use((req, res, next) => {
  req.models = {
    User,
    Entity,
    Section,
    DynamicData,
  };
  next();
});

app.use('/api/pages', pageRoutes);

// ---------------------
// لاگین (JWT فقط userId)
// ---------------------
app.post('/api/auth/login', async (req, res) => {
  console.log('Request body:', req.body); // لاگ برای دیباگ
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    console.log('User found:', user ? user.toJSON() : null); // لاگ برای دیباگ
    if (!user || user.password_hash !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
    return res.json({ token });
  } catch (err) {
    console.error('Error in /api/auth/login:', err);
    res.status(500).json({ error: 'Internal server error' });
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
      userId: user.id,
      username: user.username,
      role: user.Role ? user.Role.name : 'guest',
      permissions: user.Role && user.Role.Permissions ? user.Role.Permissions.map(p => p.name) : []
    });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return res.status(401).json({ error: 'Invalid token or server error' });
  }
});

// ---------------------
// Mock Data
// ---------------------
let dashboardData = {
  stats: {
    totalUsers: 50,
    totalRevenue: 12000
  }
};

let inventoryItems = [
  { id: 1, item: 'Spare Part A', quantity: 50 },
  { id: 2, item: 'Spare Part B', quantity: 30 }
];

let machines = [
  {
    id: 1,
    name: 'Machine A',
    status: 'Operational',
    image: '',
    repairs: ['Repair X'],
    currentMold: 'Mold A',
    moldStartDate: '2023-01-01',
    customFieldGroups: []
  },
  {
    id: 2,
    name: 'Machine B',
    status: 'Idle',
    image: '',
    repairs: [],
    currentMold: 'Mold B',
    moldStartDate: '2023-02-10',
    customFieldGroups: []
  }
];

let productionHistory = [
  {
    id: 1,
    machineId: 1,
    mold: 'Mold A',
    startDate: '2023-01-01T00:00:00Z',
    endDate: null,
    producedQuantity: 0
  },
  {
    id: 2,
    machineId: 2,
    mold: 'Mold B',
    startDate: '2023-02-10T00:00:00Z',
    endDate: null,
    producedQuantity: 0
  }
];

// ---------------------
// داشبورد
// ---------------------
app.get('/api/dashboard', checkPermission('view_dashboard'), (req, res) => {
  res.json(dashboardData);
});

app.put('/api/dashboard', checkPermission('edit_dashboard'), (req, res) => {
  dashboardData = { ...dashboardData, ...req.body };
  res.json(dashboardData);
});

// ---------------------
// انبار (Inventory)
// ---------------------
app.get('/api/inventory', checkPermission('view_inventory'), (req, res) => {
  res.json(inventoryItems);
});

app.post('/api/inventory', checkPermission('manage_inventory'), (req, res) => {
  const newItem = req.body;
  newItem.id = inventoryItems.length ? inventoryItems[inventoryItems.length - 1].id + 1 : 1;
  inventoryItems.push(newItem);
  res.json(newItem);
});

app.put('/api/inventory/:id', checkPermission('manage_inventory'), (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = inventoryItems.findIndex(i => i.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  inventoryItems[index] = { ...inventoryItems[index], ...req.body };
  res.json(inventoryItems[index]);
});

app.delete('/api/inventory/:id', checkPermission('manage_inventory'), (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = inventoryItems.findIndex(i => i.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  const deleted = inventoryItems.splice(index, 1);
  res.json(deleted[0]);
});

// ---------------------
// ماشین‌ها (Machines)
// ---------------------
app.get('/api/machines', checkPermission('view_machines'), (req, res) => {
  res.json(machines);
});

app.post('/api/machines', checkPermission('create_machine'), (req, res) => {
  const newMachine = req.body;
  newMachine.id = machines.length ? machines[machines.length - 1].id + 1 : 1;
  machines.push(newMachine);
  res.json(newMachine);
});

app.put('/api/machines/:id', checkPermission('edit_machine'), (req, res) => {
  const machineId = parseInt(req.params.id, 10);
  const index = machines.findIndex(m => m.id === machineId);
  if (index === -1) {
    return res.status(404).json({ error: 'Machine not found' });
  }
  machines[index] = { ...machines[index], ...req.body };
  res.json(machines[index]);
});

app.delete('/api/machines/:id', checkPermission('delete_machine'), (req, res) => {
  const machineId = parseInt(req.params.id, 10);
  const index = machines.findIndex(m => m.id === machineId);
  if (index === -1) {
    return res.status(404).json({ error: 'Machine not found' });
  }
  const deleted = machines.splice(index, 1);
  res.json(deleted[0]);
});

// ---------------------
// تاریخچه تولید
// ---------------------
app.get('/api/production-history', checkPermission('view_production_history'), (req, res) => {
  res.json(productionHistory);
});

app.post('/api/production-history', checkPermission('create_production_history'), (req, res) => {
  const newRecord = req.body;
  newRecord.id = productionHistory.length ? productionHistory[productionHistory.length - 1].id + 1 : 1;
  productionHistory.push(newRecord);
  res.json(newRecord);
});

app.put('/api/production-history/:id', checkPermission('update_production_history'), (req, res) => {
  const recordId = parseInt(req.params.id, 10);
  const index = productionHistory.findIndex(r => r.id === recordId);
  if (index === -1) {
    return res.status(404).json({ error: 'Production record not found' });
  }
  productionHistory[index] = { ...productionHistory[index], ...req.body };
  res.json(productionHistory[index]);
});

app.delete('/api/production-history/:id', checkPermission('update_production_history'), (req, res) => {
  const recordId = parseInt(req.params.id, 10);
  const index = productionHistory.findIndex(r => r.id === recordId);
  if (index === -1) {
    return res.status(404).json({ error: 'Production record not found' });
  }
  const deleted = productionHistory.splice(index, 1);
  res.json(deleted[0]);
});

// ---------------------
// تغییر قالب (Mold Change)
// ---------------------
app.post('/api/mold-change', checkPermission('change_mold'), (req, res) => {
  try {
    const { machineId, newMold, productionQuantity, timestamp } = req.body;
    const eventTime = timestamp ? new Date(timestamp) : new Date();

    const activeRecord = productionHistory.find(
      rec => rec.machineId === machineId && rec.endDate === null
    );
    if (activeRecord) {
      activeRecord.endDate = eventTime.toISOString();
      if (productionQuantity !== undefined) {
        activeRecord.producedQuantity = productionQuantity;
      }
    }

    const newId = productionHistory.length ? productionHistory[productionHistory.length - 1].id + 1 : 1;
    const newRecord = {
      id: newId,
      machineId,
      mold: newMold,
      startDate: eventTime.toISOString(),
      endDate: null,
      producedQuantity: 0
    };
    productionHistory.push(newRecord);

    const index = machines.findIndex(m => m.id === machineId);
    if (index !== -1) {
      machines[index].currentMold = newMold;
      machines[index].moldStartDate = eventTime.toISOString().split('T')[0];
    }

    return res.json({ success: true, newRecord });
  } catch (error) {
    console.error('Error in /api/mold-change:', error);
    return res.status(500).json({ error: error.message });
  }
});

// ---------------------
// مدیریت کاربران (Admin Panel)
// ---------------------
app.get('/api/admin/users', checkPermission('manage_users'), async (req, res) => {
  try {
    const users = await User.findAll({ include: { model: Role, as: 'Role' } });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

app.post('/api/admin/users', checkPermission('manage_users'), async (req, res) => {
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
    res.json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error adding user' });
  }
});

app.put('/api/admin/users/:id', checkPermission('manage_users'), async (req, res) => {
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
    if (username) user.username = username;
    if (password) user.password_hash = password;
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating user' });
  }
});

app.delete('/api/admin/users/:id', checkPermission('manage_users'), async (req, res) => {
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

// ---------------------
// مدیریت نقش‌ها (manage_roles)
// ---------------------
app.get('/api/roles', checkPermission('manage_roles'), async (req, res) => {
  try {
    const roles = await Role.findAll({ include: { model: Permission, as: 'Permissions' } });
    res.json(roles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching roles' });
  }
});

app.post('/api/roles', checkPermission('manage_roles'), async (req, res) => {
  try {
    const { name, parent_id } = req.body;
    const newRole = await Role.create({ name, parent_id: parent_id || null });
    res.status(201).json(newRole);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating role' });
  }
});

app.put('/api/roles/:id', checkPermission('manage_roles'), async (req, res) => {
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

app.delete('/api/roles/:id', checkPermission('manage_roles'), async (req, res) => {
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

app.put('/api/roles/:id/permissions', checkPermission('manage_roles'), async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ error: 'Role not found' });
    const { permissions: permissionNames } = req.body;
    if (!Array.isArray(permissionNames)) {
      return res.status(400).json({ error: 'Permissions must be an array of names' });
    }
    const perms = await Permission.findAll({ where: { name: permissionNames } });
    await role.setPermissions(perms);
    const updated = await Role.findByPk(role.id, { include: { model: Permission, as: 'Permissions' } });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating role permissions' });
  }
});

// ---------------------
// مدیریت مجوزها (manage_permissions)
// ---------------------
app.get('/api/permissions', checkPermission('manage_permissions'), async (req, res) => {
  try {
    const perms = await Permission.findAll();
    res.json(perms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching permissions' });
  }
});

app.post('/api/permissions', checkPermission('manage_permissions'), async (req, res) => {
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
    console.error(err);
    res.status(500).json({ error: 'Error creating permission' });
  }
});

app.put('/api/permissions/:id', checkPermission('manage_permissions'), async (req, res) => {
  try {
    const perm = await Permission.findByPk(req.params.id);
    if (!perm) return res.status(404).json({ error: 'Permission not found' });
    const { name, description, group, parent_id } = req.body;
    perm.name = name || perm.name;
    perm.description = description || perm.description;
    perm.parent_id = parent_id !== undefined ? parent_id : perm.parent_id;
    perm.group = group !== undefined ? group : perm.group;
    await perm.save();
    res.json(perm);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating permission' });
  }
});

app.delete('/api/permissions/:id', checkPermission('manage_permissions'), async (req, res) => {
  try {
    const perm = await Permission.findByPk(req.params.id);
    if (!perm) return res.status(404).json({ error: 'Permission not found' });
    await perm.destroy();
    res.json({ message: 'Permission deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting permission' });
  }
});

// ---------------------
// تست مجوز
// ---------------------
app.get('/api/test-update', checkPermission('update_machine'), (req, res) => {
  res.json({ message: 'Access granted to update machine.' });
});

// ---------------------
// Middleware برای مدیریت خطاها
// ---------------------
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ---------------------
// Start server after auto-scan
// ---------------------
sequelize.sync({ alter: true })
  .then(async () => {
    console.log('Database synced successfully!');
    await autoScanPermissions();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error syncing database:', err);
  });