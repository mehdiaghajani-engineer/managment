module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Equipments', 'location', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Equipments', 'specifications', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('Equipments', 'image', {
      type: Sequelize.BLOB('long'),
      allowNull: true,
    });
    await queryInterface.addColumn('Equipments', 'video', {
      type: Sequelize.BLOB('long'),
      allowNull: true,
    });
    await queryInterface.addColumn('Equipments', 'file', {
      type: Sequelize.BLOB('long'),
      allowNull: true,
    });
    await queryInterface.addColumn('Equipments', 'associated_machine_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'machines',
        key: 'id',
      },
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Equipments', 'location');
    await queryInterface.removeColumn('Equipments', 'specifications');
    await queryInterface.removeColumn('Equipments', 'image');
    await queryInterface.removeColumn('Equipments', 'video');
    await queryInterface.removeColumn('Equipments', 'file');
    await queryInterface.removeColumn('Equipments', 'associated_machine_id');
  },
};