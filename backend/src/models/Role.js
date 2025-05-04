// backend/src/models/Role.js
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define(
    'Role',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    },
    {
      tableName: 'roles'
    }
  );

  Role.associate = (models) => {
    Role.hasMany(models.User, {
      foreignKey: 'role_id',
      as: 'Users'
    });
    Role.belongsToMany(models.Permission, {
      through: 'role_permissions',
      foreignKey: 'role_id',
      otherKey: 'permission_id',
      as: 'Permissions'
    });
  };

  return Role;
};