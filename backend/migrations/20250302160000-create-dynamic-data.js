// backend/migrations/XXXXXXXXXXXXXX-create-dynamic-data.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('dynamic_data', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      pageId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'pages',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      fieldName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fieldType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fieldValue: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('dynamic_data');
  }
};