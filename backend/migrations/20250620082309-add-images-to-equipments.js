module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Equipments', 'images', {
      type: Sequelize.JSONB,
      allowNull: true,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Equipments', 'images');
  },
};