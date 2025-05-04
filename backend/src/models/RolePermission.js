module.exports = (sequelize, DataTypes) => {
  const RolePermission = sequelize.define(
    'RolePermission',
    {
      // Sequelize به‌صورت خودکار ستون‌های role_id و permission_id را ایجاد می‌کند
    },
    {
      tableName: 'role_permissions',
      timestamps: false
    }
  );

  return RolePermission;
};