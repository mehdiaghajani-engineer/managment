module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false, // اجباری کردن type با توجه به نیاز فیلتر
      defaultValue: 'unknown', // مقدار پیش‌فرض برای جلوگیری از خطا
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true, // برای دسته‌بندی‌های ریشه‌ای
      references: {
        model: 'Categories',
        key: 'id',
      },
    },
  }, {
    tableName: 'Categories',
    timestamps: true,
  });

  Category.associate = (models) => {
    Category.hasMany(models.Machine, {
      foreignKey: 'category_id',
      as: 'machines',
      onDelete: 'SET NULL',
    });
    Category.hasMany(models.Equipment, {
      foreignKey: 'category_id',
      as: 'equipments',
      onDelete: 'SET NULL',
    });
    Category.belongsTo(models.Category, {
      foreignKey: 'parentId',
      as: 'parent',
    });
  };

  return Category;
};