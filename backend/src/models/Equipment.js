module.exports = (sequelize, DataTypes) => {
  const Equipment = sequelize.define('Equipment', {
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
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    specifications: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    images: {
      type: DataTypes.JSONB, // آرایه باینری تصاویر به‌صورت JSON
      allowNull: true,
    },
    files: {
      type: DataTypes.JSONB, // آرایه باینری فایل‌ها به‌صورت JSON
      allowNull: true,
    },
    customFields: {
      type: DataTypes.JSONB,
      defaultValue: [],
      allowNull: false,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Categories',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    related_category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Categories',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    related_items: {
      type: DataTypes.JSONB, // آرایه IDهای ماشین‌های مرتبط
      defaultValue: [],
      allowNull: false,
    },
    associated_machine_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Machines',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
  }, {
    tableName: 'Equipments',
    timestamps: true,
  });

  Equipment.associate = (models) => {
    Equipment.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category',
    });
    Equipment.belongsTo(models.Machine, {
      foreignKey: 'associated_machine_id',
      as: 'associatedMachine',
    });
  };

  return Equipment;
};