module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDefinition = await queryInterface.describeTable('Equipments');
    if (!tableDefinition.associated_machine_id) {
      await queryInterface.addColumn('Equipments', 'associated_machine_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Machines',
          key: 'id',
        },
        onDelete: 'SET NULL',
      });
    }
  },
  down: async (queryInterface, Sequelize) => {
    const tableDefinition = await queryInterface.describeTable('Equipments');
    if (tableDefinition.associated_machine_id) {
      await queryInterface.removeColumn('Equipments', 'associated_machine_id');
    }
  },
};