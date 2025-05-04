require('dotenv').config();

const { Sequelize, DataTypes } = require('sequelize');
const connectionString = process.env.DB_CONNECTION || "postgres://postgres:1292660023@localhost:5432/my-management-app";

const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres'
});

// تعریف مدل‌ها
const modelDefiners = [
  require('./Role'),
  require('./Permission'),
  require('./RolePermission'),
  require('./User'),
  require('./Page'),
  require('./Section'),
  require('./DynamicData'),
  require('./Entity'), // اضافه کردن مدل Entity
];

// ثبت مدل‌ها
const models = {};
for (const modelDefiner of modelDefiners) {
  const model = modelDefiner(sequelize, DataTypes);
  models[model.name] = model;
}

// تعریف همه روابط با استفاده از تابع associate
const defineAssociations = () => {
  Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
      models[modelName].associate(models);
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