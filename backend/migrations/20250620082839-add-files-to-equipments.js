module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Equipments', 'files', {
      type: Sequelize.JSONB,
      allowNull: true,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Equipments', 'files');
  },
};