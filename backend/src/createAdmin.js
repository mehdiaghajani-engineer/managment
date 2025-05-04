// backend/src/createAdmin.js
const { User, Role } = require('./models');

async function createAdminUser() {
  try {
    // ابتدا چک کن که نقش ادمین وجود داشته باشه
    let adminRole = await Role.findOne({ where: { name: 'admin' } });

    if (!adminRole) {
      // اگر نقش ادمین وجود نداره، بساز
      adminRole = await Role.create({ name: 'admin' });
      console.log('Admin role created:', adminRole);
    }

    // حالا یه کاربر ادمین با یوزرنیم و رمزعبور ساده بساز
    const username = 'admin';
    const password = '1292660023'; // رمزعبور ساده و سخت‌کدی‌شده

    // ساخت کاربر جدید بدون هش کردن رمزعبور
    const adminUser = await User.create({
      username,
      password_hash: password, // مستقیماً رمزعبور رو ذخیره می‌کنم (بدون هش)
      role_id: adminRole.id
    });

    console.log('Admin user created:', adminUser);
  } catch (err) {
    console.error('Error creating admin user:', err);
  }
}

createAdminUser();