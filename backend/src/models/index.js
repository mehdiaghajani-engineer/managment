require('dotenv').config();

const { Sequelize, DataTypes } = require('sequelize');
const connectionString = process.env.DB_CONNECTION || "postgres://postgres:1292660023@localhost:5432/my-management-app";

const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  logging: console.log, // برای دیباگ، می‌تونی false بذاری اگه نمی‌خوای لاگ ببینی
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// تست اتصال به دیتابیس
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

// تعریف مدل‌ها
const modelDefiners = [
  require('./Role'),
  require('./Permission'),
  require('./RolePermission'),
  require('./User'),
  require('./Page'),
  require('./Section'),
  require('./DynamicData'),
  require('./Entity'),
  require('./Machine'),
  require('./Equipment'),
  require('./Category')
];

// ثبت مدل‌ها
const models = {};
for (const modelDefiner of modelDefiners) {
  try {
    const model = modelDefiner(sequelize, DataTypes);
    models[model.name] = model;
  } catch (error) {
    console.error(`Error loading model from ${modelDefiner}:`, error);
  }
}

// تعریف همه روابط با استفاده از تابع associate
const defineAssociations = () => {
  Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
      try {
        models[modelName].associate(models);
      } catch (error) {
        console.error(`Error associating model ${modelName}:`, error);
      }
    }
  });
};

// اجرای تعریف روابط
defineAssociations();

// ثبت مدل‌ها در sequelize
Object.keys(models).forEach(modelName => {
  sequelize.models[modelName] = models[modelName];
});

module.exports = {
  sequelize,
  ...models
};