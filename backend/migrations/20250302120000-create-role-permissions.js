module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('role_permissions', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        role_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'roles',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        permission_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'permissions',
            key: 'id'
          },
          onDelete: 'CASCADE'
        }
      });
    },
  
    down: async (queryInterface) => {
      await queryInterface.dropTable('role_permissions');
    }
  };