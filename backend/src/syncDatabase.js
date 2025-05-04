// backend/src/syncDatabase.js
const { sequelize } = require('./models');

async function syncDatabase() {
  try {
    await sequelize.sync({ alter: true }); // فقط جدول‌ها رو آپدیت می‌کنه، داده‌ها رو نگه می‌داره
    console.log('Database synced successfully.');
  } catch (error) {
    console.error('Error syncing database:', error);
  } finally {
    await sequelize.close(); // بستن اتصال به دیتابیس
  }
}

syncDatabase();