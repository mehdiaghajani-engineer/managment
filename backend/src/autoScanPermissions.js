const fs = require('fs').promises;
const path = require('path');
const { Permission } = require('./models');

const PERMISSION_REGEX = /checkPermission\(\s*['"]([^'"]+)['"]\s*\)/g;

/**
 * اسکن بازگشتی دایرکتوری‌ها برای یافتن مجوزها
 * @param {string} dirPath - مسیر دایرکتوری
 * @param {Set} foundPermissions - مجموعه مجوزهای پیدا شده
 */
async function scanDirectory(dirPath, foundPermissions = new Set()) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        await scanDirectory(fullPath, foundPermissions);
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        const content = await fs.readFile(fullPath, 'utf8');
        let match;
        while ((match = PERMISSION_REGEX.exec(content)) !== null) {
          foundPermissions.add(match[1]);
        }
      }
    }
  } catch (err) {
    console.error(`Error scanning directory ${dirPath}:`, err.message);
  }
  return foundPermissions;
}

/**
 * اسکن خودکار مجوزها از کد و همگام‌سازی با دیتابیس
 */
async function autoScanPermissions() {
  try {
    const rootDir = path.join(__dirname, 'routes');
    const serverFile = path.join(__dirname, 'server.js');
    const foundPermissions = new Set();

    // اسکن دایرکتوری routes
    if (await fs.access(rootDir).then(() => true).catch(() => false)) {
      await scanDirectory(rootDir, foundPermissions);
    }

    // اسکن فایل server.js
    if (await fs.access(serverFile).then(() => true).catch(() => false)) {
      const content = await fs.readFile(serverFile, 'utf8');
      let match;
      while ((match = PERMISSION_REGEX.exec(content)) !== null) {
        foundPermissions.add(match[1]);
      }
    }

    console.log('Found Permissions from code:', Array.from(foundPermissions));

    // همگام‌سازی با دیتابیس
    for (const permName of foundPermissions) {
      await Permission.findOrCreate({
        where: { name: permName },
        defaults: { name: permName, description: `System permission for ${permName}`, group: 'System' },
      });
    }

    console.log('Auto-scan completed. Permissions updated in DB.');
  } catch (err) {
    console.error('Error in autoScanPermissions:', err.message);
  }
}

module.exports = autoScanPermissions;