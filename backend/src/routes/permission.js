const express = require('express');
const router = express.Router();
const { Permission, sequelize } = require('../models');
const { checkPermission } = require('../middleware/checkPermission');
const fs = require('fs').promises;
const path = require('path');
const { Op } = require('sequelize');

// اسکن کامپوننت‌ها توی frontend/src/components
const scanComponents = async (componentsDir) => {
  const permissionsToSync = new Map();
  try {
    console.log('در حال بررسی مسیر کامپوننت‌ها:', componentsDir);
    const stats = await fs.stat(componentsDir).catch(() => null);
    if (!stats || !stats.isDirectory()) {
      console.log('پوشه کامپوننت‌ها پیدا نشد یا مسیر اشتباهه!');
      return permissionsToSync;
    }
    const files = await fs.readdir(componentsDir).catch(() => []);
    console.log('فایل‌های پیدا شده:', files);
    const componentFiles = files.filter(file => file.endsWith('.js'));

    // لیست گروه‌های نادیده گرفته‌شده
    const ignoredGroups = [
      'DynamicCustomFieldGroups',
      'DynamicCustomFields',
      'DynamicPage',
      'AddPage',
      'AdminCombinedPanel',
      'ImageUploader',
      'Login',
      'Pages',
      'PermissionTree',
      'PermissionWrapper',
      'ProtectedRoute',
      'Sidebar',
      'Welcome',
      'RoleSwitcher',
    ];

    // لیست نام‌های مجوزهای مرتبط با ماشین (بر اساس نام‌های واقعی توی دیتابیس)
    const machineRelatedPermissions = [
      'view-machines',
      'view-machinesdashboard',
      'view-machinesandequipments', // فرمت هماهنگ با دیتابیس
      'view-moldassignment',
      'view-maintenancemanagement',
    ];

    for (const file of componentFiles) {
      const componentName = path.basename(file, '.js');
      if (ignoredGroups.includes(componentName)) {
        console.log(`کامپوننت نادیده گرفته شد: ${componentName}`);
        continue;
      }

      let pageName = componentName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      let permissionName = `view-${pageName}`;
      let description = `مشاهده صفحه ${componentName}`;
      let displayName = componentName.replace(/([A-Z])/g, ' $1').trim();

      // تنظیم گروه: اگه مجوز جزو machineRelatedPermissions بود، گروهش "Machine" می‌شه
      let groupName = componentName;
      if (machineRelatedPermissions.includes(permissionName)) {
        groupName = 'Machine';
        console.log(`مجوز ${permissionName} به گروه Machine اختصاص یافت`);
      } else {
        console.log(`مجوز ${permissionName} گروه پیش‌فرض: ${groupName}`);
      }

      // به‌روزرسانی نام و توضیحات برای MachinesAndEquipments
      if (componentName === 'MachinesAndEquipments') {
        description = 'مشاهده صفحه Machines & Equipments';
        displayName = 'Machines & Equipments';
      }

      permissionsToSync.set(permissionName, {
        name: permissionName,
        description: description,
        group: groupName,
        displayName: displayName,
      });
      console.log(`مجوز اضافه شده: ${permissionName}, گروه: ${groupName}, نام نمایشی: ${displayName}`);
    }
    console.log('مجوزهای اسکن‌شده:', Array.from(permissionsToSync.entries()));
    return permissionsToSync;
  } catch (err) {
    console.error('خطا در اسکن کامپوننت‌ها:', err.message);
    return new Map();
  }
};

// اسکن کد برای مجوزهای سیستمی
const scanCodebase = async (rootDir, serverFile) => {
  const foundPermissions = new Set();
  try {
    console.log('در حال بررسی مسیر routes:', rootDir);
    const stats = await fs.stat(rootDir).catch(() => null);
    if (!stats || !stats.isDirectory()) {
      console.log('پوشه routes پیدا نشد یا مسیر اشتباهه!');
      return [];
    }
    if (await fs.access(rootDir).then(() => true).catch(() => false)) {
      const entries = await fs.readdir(rootDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(rootDir, entry.name);
        if (entry.isDirectory()) {
          await scanCodebase(fullPath, foundPermissions);
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
          const content = await fs.readFile(fullPath, 'utf8');
          const regex = /checkPermission\(\s*['"]([^'"]+)['"]\s*\)/g;
          let match;
          while ((match = regex.exec(content)) !== null) {
            foundPermissions.add(match[1]);
            console.log(`مجوز پیدا شده در کد: ${match[1]}`);
          }
        }
      }
    }
    console.log('در حال بررسی فایل server.js:', serverFile);
    if (await fs.access(serverFile).then(() => true).catch(() => false)) {
      const content = await fs.readFile(serverFile, 'utf8');
      const regex = /checkPermission\(\s*['"]([^'"]+)['"]\s*\)/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        foundPermissions.add(match[1]);
        console.log(`مجوز پیدا شده در server.js: ${match[1]}`);
      }
    }

    const essentialSystemPermissions = ['manage_users', 'manage_permissions', 'manage_roles'];
    return Array.from(foundPermissions)
      .filter(name => essentialSystemPermissions.includes(name))
      .map(name => ({
        name,
        description: `مجوز سیستمی برای ${name}`,
        group: 'System',
      }));
  } catch (err) {
    console.error('خطا در اسکن کد:', err.message);
    return [];
  }
};

// همگام‌سازی مجوزها
const syncPermissions = async (permissions) => {
  try {
    for (const perm of permissions) {
      if (!perm || typeof perm !== 'object' || !perm.name) {
        console.log('آیتم نامعتبر رد شد:', perm);
        continue;
      }

      const { name, description, group, displayName } = perm;
      const [existingPerm, created] = await Permission.findOrCreate({
        where: { name },
        defaults: {
          description: description || '',
          group: group || 'General',
          displayName: displayName || name,
        },
      });

      if (!created) {
        await existingPerm.update({ description, group, displayName });
        console.log(`مجوز ${name} به‌روزرسانی شد با گروه: ${group}`);
      } else {
        console.log(`مجوز ${name} ایجاد شد با گروه: ${group}`);
      }
    }
  } catch (err) {
    console.error('خطا در همگام‌سازی مجوزها:', err.message);
    throw err;
  }
};

// به‌روزرسانی مجوزها
const updatePermissions = async () => {
  console.log('شروع به‌روزرسانی مجوزها...');
  try {
    const componentsDir = path.resolve(__dirname, '../../../frontend/src/components');
    const rootDir = path.join(__dirname, '../routes');
    const serverFile = path.join(__dirname, '../server.js');

    console.log('مسیر کامپوننت‌ها:', componentsDir);
    console.log('مسیر routes:', rootDir);
    console.log('مسیر server.js:', serverFile);

    const componentPermissions = await scanComponents(componentsDir);
    console.log('تعداد مجوزهای کامپوننت‌ها:', componentPermissions.size);

    const systemPermissions = await scanCodebase(rootDir, serverFile);
    console.log('تعداد مجوزهای سیستمی:', systemPermissions.length);

    // ترکیب درست داده‌ها
    const allPermissions = new Map([...componentPermissions]);
    for (const perm of systemPermissions) {
      if (perm && perm.name) {
        allPermissions.set(perm.name, perm);
      }
    }
    console.log('محتوای allPermissions:', Array.from(allPermissions.entries()));
    console.log('تعداد کل مجوزها قبل از همگام‌سازی:', allPermissions.size);

    await syncPermissions(Array.from(allPermissions.values()));

    const permissionNames = Array.from(allPermissions.keys());
    console.log('لیست مجوزهای جدید برای نگه‌داری:', permissionNames);

    // حذف مجوزهای غیرضروری، از جمله view-machinesandmolds
    const permissionsToRemove = [
      'view-addpage',
      'view-admincombinedpanel',
      'view-imageuploader',
      'view-login',
      'view-pages',
      'view-permissiontree',
      'view-permissionwrapper',
      'view-protectedroute',
      'view-sidebar',
      'view-welcome',
      'view-roleswitcher',
      'view-machinesandmolds', // اضافه کردن صریح برای حذف
    ];
    await Permission.destroy({
      where: {
        name: { [Op.in]: permissionsToRemove },
      },
    });
    console.log('حذف مجوزهای غیرضروری انجام شد:', permissionsToRemove);

    // به‌روزرسانی اجباری گروه‌ها برای همه‌ی مجوزهای مرتبط با ماشین
    const machinePermissions = [
      'view-machines',
      'view-machinesdashboard',
      'view-machinesandequipments', // فرمت هماهنگ با دیتابیس
      'view-moldassignment',
      'view-maintenancemanagement',
    ];
    await Permission.update(
      { group: 'Machine' },
      {
        where: {
          name: { [Op.in]: machinePermissions },
        },
      }
    );
    console.log('گروه‌های مرتبط با ماشین به‌روزرسانی شد به Machine');

    const remainingPermissions = await Permission.findAll();
    console.log(`تعداد کل مجوزها بعد از به‌روزرسانی: ${remainingPermissions.length}`);
    remainingPermissions.forEach(perm => {
      console.log(
        `مجوز باقی‌مونده: ${perm.name}, گروه: ${perm.group}, نام نمایشی: ${perm.displayName}`
      );
    });
  } catch (err) {
    console.error('خطا در به‌روزرسانی مجوزها:', err.message);
    throw err;
  }
};

// روت‌ها
router.get('/', checkPermission('manage_permissions'), async (req, res) => {
  try {
    await updatePermissions();
    const permissions = await Permission.findAll();
    res.json(permissions);
  } catch (err) {
    console.error('خطا در دریافت مجوزها:', err.message);
    res.status(500).json({ error: 'خطا در دریافت مجوزها', details: err.message });
  }
});

router.get('/tree', checkPermission('manage_permissions'), async (req, res) => {
  try {
    const permissions = await Permission.findAll();
    const tree = {};
    for (const p of permissions) {
      const group = p.group || 'بدون دسترسی';
      if (!tree[group]) {
        tree[group] = [];
      }
      tree[group].push(p);
    }
    console.log('ساختار درخت مجوزها:', tree);
    res.json(tree);
  } catch (err) {
    console.error('خطا در دریافت:', err.message);
    res.status(400).json({ error: 'خطا در دریافت داده‌ها', details: err.message });
  }
});

router.post('/', checkPermission('manage_permissions'), async (req, res) => {
  try {
    const { name, description, parent_id, group, displayName } = req.body;
    if (!name) return res.status(400).json({ error: 'نام الزامی است' });

    const existingPerm = await Permission.findOne({ where: { name } });
    if (existingPerm) return res.status(400).json({ error: `مجوز "${name}" از قبل وجود دارد` });

    const newPermission = await Permission.create({
      name,
      description: description || '',
      parent_id: parent_id || null,
      group: group || null,
      displayName: displayName || name,
    });
    res.status(201).json(newPermission);
  } catch (err) {
    console.error('خطا در ایجاد مجوز:', err.message);
    res.status(500).json({ error: 'خطا در ایجاد مجوز', details: err.message });
  }
});

router.put('/:id', checkPermission('manage_permissions'), async (req, res) => {
  try {
    const permission = await Permission.findByPk(req.params.id);
    if (!permission) return res.status(404).json({ error: 'مجوز یافت نشد' });

    const { name, description, parent_id, group, displayName } = req.body;
    if (name && name !== permission.name) {
      const existingPerm = await Permission.findOne({ where: { name } });
      if (existingPerm) return res.status(400).json({ error: `مجوز "${name}" از قبل وجود دارد` });
    }

    permission.name = name || permission.name;
    permission.description = description || permission.description;
    permission.parent_id = parent_id !== undefined ? parent_id : permission.parent_id;
    permission.group = group !== undefined ? group : permission.group;
    permission.displayName = displayName || permission.displayName;
    await permission.save();
    res.status(200).json(permission);
  } catch (err) {
    console.error('خطا در به‌روزرسانی:', err.message);
    res.status(500).json({ error: 'خطا در به‌روزرسانی', details: err.message });
  }
});

router.delete('/:id', checkPermission('manage_permissions'), async (req, res) => {
  try {
    const permission = await Permission.findByPk(req.params.id);
    if (!permission) return res.status(404).json({ error: 'مجوز یافت نشد' });
    await permission.destroy();
    res.json({ message: 'مجوز با موفقیت حذف شد' });
  } catch (err) {
    console.error('خطا در حذف مجوز:', err.message);
    res.status(500).json({ error: 'خطا در حذف مجوز', details: err.message });
  }
});

router.post('/sync', checkPermission('manage_permissions'), async (req, res) => {
  try {
    const { permissions } = req.body;
    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({ error: 'داده‌های مجوز نامعتبر است' });
    }

    await syncPermissions(permissions);
    res.json({ success: true, message: 'مجوزها با موفقیت همگام‌سازی شدند' });
  } catch (err) {
    console.error('خطا در همگام‌سازی مجوزها:', err.message);
    res.status(500).json({ error: 'خطا در همگام‌سازی مجوزها', details: err.message });
  }
});

module.exports = router;