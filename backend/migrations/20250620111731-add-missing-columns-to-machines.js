module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Machines', 'location', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Machines', 'serial_number', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Machines', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    // اگه ستون‌های دیگه‌ای هم گمشده بود (مثل images، files)، اینجا اضافه کن
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Machines', 'location');
    await queryInterface.removeColumn('Machines', 'serial_number');
    await queryInterface.removeColumn('Machines', 'description');
  },
};