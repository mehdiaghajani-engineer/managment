const { sequelize, Role, User, Machine, Equipment, Category, Permission } = require('./models');

async function seedData() {
  const transaction = await sequelize.transaction();

  try {
    // ایجاد نقش admin
    const [adminRole] = await Role.findOrCreate({
      where: { name: 'admin' },
      defaults: { createdAt: new Date(), updatedAt: new Date() },
      transaction
    });

    // ایجاد کاربر admin
    const [adminUser] = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        username: 'admin',
        password_hash: '1292660023',
        role_id: adminRole.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      transaction
    });

    // ایجاد دسته‌بندی‌ها
    const [heavyMachinery] = await Category.findOrCreate({
      where: { name: 'Heavy Machinery', type: 'machine' },
      defaults: { name: 'Heavy Machinery', type: 'machine', parentId: null, createdAt: new Date(), updatedAt: new Date() },
      transaction
    });
    const [lightMachinery] = await Category.findOrCreate({
      where: { name: 'Light Machinery', type: 'machine' },
      defaults: { name: 'Light Machinery', type: 'machine', parentId: null, createdAt: new Date(), updatedAt: new Date() },
      transaction
    });
    const [productionTools] = await Category.findOrCreate({
      where: { name: 'Production Tools', type: 'equipment' },
      defaults: { name: 'Production Tools', type: 'equipment', parentId: null, createdAt: new Date(), updatedAt: new Date() },
      transaction
    });
    const [testingEquipment] = await Category.findOrCreate({
      where: { name: 'Testing Equipment', type: 'equipment' },
      defaults: { name: 'Testing Equipment', type: 'equipment', parentId: null, createdAt: new Date(), updatedAt: new Date() },
      transaction
    });

    // ایجاد ماشین‌ها
    await Machine.findOrCreate({
      where: { name: 'Machine 1' },
      defaults: {
        name: 'Machine 1',
        location: 'Factory A', // فیلد جدید
        serial_number: 'SN001', // فیلد جدید
        description: 'Heavy machinery unit', // فیلد جدید
        image: null, // برای BLOB، مقدار null تنظیم می‌شه
        file: null, // برای BLOB، مقدار null تنظیم می‌شه
        custom_field_groups: [], // به‌جای status و mold
        category_id: heavyMachinery.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      transaction
    });
    await Machine.findOrCreate({
      where: { name: 'Machine 2' },
      defaults: {
        name: 'Machine 2',
        location: 'Factory B', // فیلد جدید
        serial_number: 'SN002', // فیلد جدید
        description: 'Light machinery unit', // فیلد جدید
        image: null, // برای BLOB
        file: null, // برای BLOB
        custom_field_groups: [], // به‌جای status و mold
        category_id: lightMachinery.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      transaction
    });

    // ایجاد تجهیزات
    await Equipment.findOrCreate({
      where: { name: 'Equipment A' },
      defaults: {
        name: 'Equipment A',
        type: 'Type 1',
        description: 'Production tool',
        location: 'Workshop 1', // فیلد جدید
        specifications: 'High precision', // فیلد جدید
        image: null, // برای BLOB
        video: null, // برای BLOB
        file: null, // برای BLOB
        associated_machine_id: null, // فیلد جدید
        customFields: [],
        category_id: productionTools.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      transaction
    });
    await Equipment.findOrCreate({
      where: { name: 'Equipment B' },
      defaults: {
        name: 'Equipment B',
        type: 'Type 2',
        description: 'Testing device',
        location: 'Lab 1', // فیلد جدید
        specifications: 'Standard testing', // فیلد جدید
        image: null, // برای BLOB
        video: null, // برای BLOB
        file: null, // برای BLOB
        associated_machine_id: null, // فیلد جدید
        customFields: [],
        category_id: testingEquipment.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      transaction
    });

    // ایجاد permissionها
    const permissions = [
      { name: 'view-categories', description: 'View categories' },
      { name: 'create-category', description: 'Create categories' },
      { name: 'edit-category', description: 'Edit categories' },
      { name: 'delete-category', description: 'Delete categories' },
      { name: 'view-machinesandequipments', description: 'View machines and equipments' },
      { name: 'create-equipment', description: 'Create equipments' },
      { name: 'edit-equipment', description: 'Edit equipments' },
      { name: 'delete-equipment', description: 'Delete equipments' }
    ];

    const createdPermissions = await Promise.all(permissions.map(p => 
      Permission.findOrCreate({
        where: { name: p.name },
        defaults: { ...p, createdAt: new Date(), updatedAt: new Date() },
        transaction
      })
    ));

    // تخصیص همه permissionها به نقش admin
    await adminRole.setPermissions(createdPermissions.map(p => p[0]), { transaction });

    await transaction.commit();
    console.log('Initial data and permissions inserted successfully!');
  } catch (error) {
    await transaction.rollback();
    console.error('Error seeding data:', error);
  }
}

if (require.main === module) {
  seedData();
}

module.exports = seedData;