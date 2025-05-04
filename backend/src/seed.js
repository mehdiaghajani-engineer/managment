const { sequelize, Role, User } = require('./models');

async function seedData() {
  try {
    await sequelize.sync({ alter: true });

    // ایجاد نقش ادمین (admin)
    const [adminRole] = await Role.findOrCreate({
      where: { name: 'admin' },
      defaults: { name: 'admin', parent_id: null }
    });

    // ایجاد کاربر admin برای ورود به پنل مدیریت
    const [adminUser] = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        username: 'admin',
        password_hash: '1292660023', // در محیط تولیدی از هش کردن پسورد استفاده کنید
        role_id: adminRole.id
      }
    });

    console.log('Initial admin data inserted successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  seedData();
}

module.exports = seedData;
