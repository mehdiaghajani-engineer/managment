module.exports = (sequelize, DataTypes) => {
  const Machine = sequelize.define('Machine', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    serial_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    images: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    files: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    custom_field_groups: {
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
      type: DataTypes.JSONB,
      defaultValue: [],
      allowNull: false,
    },
  }, {
    tableName: 'machines', // تغییر به Machines برای یکنواختی
    timestamps: true,
  });

  Machine.associate = (models) => {
    Machine.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category',
    });
  };

  return Machine;
};