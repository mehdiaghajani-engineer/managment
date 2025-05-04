// backend/autoScanPermissions.js

const fs = require('fs');
const path = require('path');
const { sequelize, Permission } = require('./models');

const PERMISSION_REGEX = /checkPermission\(\s*['"]([^'"]+)['"]\s*\)/g;

/**
 * یک تابع بازگشتی برای جستجوی فایل‌های .js داخل یک فولدر (مثلاً routes یا کل پروژه)
 * تا تمام موارد checkPermission("...") را پیدا کند.
 */
function scanDirectory(dirPath, foundPermissions = new Set()) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      scanDirectory(fullPath, foundPermissions);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      let match;
      while ((match = PERMISSION_REGEX.exec(content)) !== null) {
        foundPermissions.add(match[1]);
      }
    }
  }
  return foundPermissions;
}

/**
 * اسکریپتی برای یافتن تمام Permissionها از کد پروژه و ایجاد آن‌ها در DB (اگر قبلاً وجود نداشته باشد).
 */
async function autoScanPermissions() {
  try {
    // می‌توانید مسیر را بسته به ساختار پروژه‌تان تغییر دهید
    const rootDir = path.join(__dirname, 'routes');
    // اگر روترها در فایل server.js هم هستند:
    const serverFile = path.join(__dirname, 'server.js');

    const foundPermissions = new Set();

    // اسکن پوشه routes
    if (fs.existsSync(rootDir)) {
      scanDirectory(rootDir, foundPermissions);
    }
    // اسکن فایل server.js (در صورتی که آنجا هم route تعریف شده)
    if (fs.existsSync(serverFile)) {
      const srvContent = fs.readFileSync(serverFile, 'utf8');
      let match;
      while ((match = PERMISSION_REGEX.exec(srvContent)) !== null) {
        foundPermissions.add(match[1]);
      }
    }

    // اکنون foundPermissions مجموعه‌ای از همه stringهای داخل checkPermission("...") را دارد
    console.log('Found Permissions from code:', foundPermissions);

    // آنها را در DB ثبت می‌کنیم (در جدول Permissions)
    for (const permName of foundPermissions) {
      await Permission.findOrCreate({
        where: { name: permName },
        defaults: { name: permName }  // می‌توانید فیلدهای دیگر مثل description هم داشته باشید
      });
    }

    console.log('Auto-scan completed. Permissions updated in DB.');
  } catch (err) {
    console.error('Error in autoScanPermissions:', err);
  } finally {
    // اگر نیازی به بستن connection هست، sequelize.close() کنید
    // await sequelize.close();
  }
}

// اجرای مستقیم
if (require.main === module) {
  sequelize.sync().then(() => {
    autoScanPermissions().then(() => {
      console.log('Done scanning & creating permissions.');
      sequelize.close();
    });
  });
}

module.exports = autoScanPermissions;
