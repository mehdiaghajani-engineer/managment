module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('machines', 'location', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('machines', 'serial_number', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('machines', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('machines', 'image', {
      type: Sequelize.BLOB('long'),
      allowNull: true,
    });
    await queryInterface.addColumn('machines', 'file', {
      type: Sequelize.BLOB('long'),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('machines', 'location');
    await queryInterface.removeColumn('machines', 'serial_number');
    await queryInterface.removeColumn('machines', 'description');
    await queryInterface.removeColumn('machines', 'image');
    await queryInterface.removeColumn('machines', 'file');
  },
};