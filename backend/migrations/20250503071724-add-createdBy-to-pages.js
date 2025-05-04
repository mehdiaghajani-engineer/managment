// backend/migrations/20250503120000-add-createdBy-to-pages.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. اضافه کردن ستون createdBy با allowNull: true
    await queryInterface.addColumn('pages', 'createdBy', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    // 2. تنظیم یه مقدار پیش‌فرض برای ردیف‌های موجود
    // فرض می‌کنیم یه کاربر ادمین با id=1 وجود داره
    await queryInterface.sequelize.query(
      `UPDATE "pages" SET "createdBy" = 1 WHERE "createdBy" IS NULL;`
    );

    // 3. اعمال قید NOT NULL
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
  },

  down: async (queryInterface, Sequelize) => {
    // در صورت rollback، ستون createdBy رو حذف می‌کنه
    await queryInterface.removeColumn('pages', 'createdBy');
  }
};