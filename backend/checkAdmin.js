// checkAdmin.js

const { sequelize, User } = require('./src/models'); // مسیر اصلاح شده

async function checkAdminUser() {
  try {
    const admin = await User.findOne({ where: { username: 'admin' } });
    if (admin) {
      console.log('Admin user exists:', admin.toJSON());
    } else {
      console.log('Admin user not found.');
    }
  } catch (error) {
    console.error('Error checking admin user:', error);
  } finally {
    await sequelize.close();
  }
}

checkAdminUser();
