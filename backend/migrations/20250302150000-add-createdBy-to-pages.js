// backend/migrations/20250302150000-add-createdBy-to-pages.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // چک کن که ستون createdBy وجود داره
    const tableInfo = await queryInterface.describeTable('pages');
    if (tableInfo.createdBy) {
      // 2. تنظیم یه مقدار پیش‌فرض برای ردیف‌های موجود
      await queryInterface.sequelize.query(
        `UPDATE "pages" SET "createdBy" = 1 WHERE "createdBy" IS NULL;`
      );

      // 3. اعمال رفرنس به users
      await queryInterface.changeColumn('pages', 'createdBy', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // در صورت rollback، رفرنس رو حذف و ستون رو به حالت اولیه برگردون
    await queryInterface.changeColumn('pages', 'createdBy', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.sequelize.query(
      `UPDATE "pages" SET "createdBy" = NULL WHERE "createdBy" = 1;`
    );
  },
};