// 20250619095627-add-related-fields-to-machines-and-equipments.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // فقط برای جدول Equipments
    await queryInterface.addColumn('"Equipments"', 'related_category_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Categories',
        key: 'id',
      },
      onDelete: 'SET NULL',
    });
    await queryInterface.addColumn('"Equipments"', 'related_items', {
      type: Sequelize.JSONB,
      defaultValue: [],
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('"Equipments"', 'related_category_id');
    await queryInterface.removeColumn('"Equipments"', 'related_items');
  },
};