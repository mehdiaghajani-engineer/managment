const fs = require('fs');
const path = require('path');
const { sequelize, Permission } = require('./models');

async function seedDynamicPermissions() {
  try {
    // خواندن فایل پیکربندی مجوزها
    const dataPath = path.join(__dirname, 'permissions.json');
    const permissionsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // برای هر مجوز موجود در فایل JSON، اگر موجود نباشد ایجاد شود
    for (const perm of permissionsData) {
      await Permission.findOrCreate({
        where: { name: perm.name },
        defaults: {
          name: perm.name,
          description: perm.description,
          // اگر بخواهید ساختار درختی داشته باشید، مثلاً بر اساس گروه می‌توانید parent_id را تنظیم کنید:
          parent_id: null // یا در صورت وجود گروه‌ها، منطق تبدیل گروه به parent_id را اعمال کنید.
        }
      });
    }
    console.log('Dynamic permissions seeded successfully!');
  } catch (err) {
    console.error('Error seeding dynamic permissions:', err);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  seedDynamicPermissions();
}

module.exports = seedDynamicPermissions;
