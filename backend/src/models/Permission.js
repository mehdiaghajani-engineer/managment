// backend/src/models/Permission.js
module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define(
    'Permission',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      group: {
        type: DataTypes.STRING,
        allowNull: true
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    },
    {
      tableName: 'permissions'
    }
  );

  Permission.associate = (models) => {
    Permission.belongsToMany(models.Role, {
      through: 'role_permissions',
      foreignKey: 'permission_id',
      otherKey: 'role_id',
      as: 'Roles'
    });
  };

  return Permission;
};