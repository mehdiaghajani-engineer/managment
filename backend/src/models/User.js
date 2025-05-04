// backend/src/models/User.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password_hash: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      tableName: 'users'
    }
  );

  User.associate = (models) => {
    User.belongsTo(models.Role, {
      foreignKey: 'role_id',
      as: 'Role'
    });
  };

  return User;
};