// backend/migrations/20250503043733-add-route-to-pages.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. اضافه کردن ستون route با allowNull: true
    await queryInterface.addColumn('pages', 'route', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // 2. آپدیت مقادیر route برای ردیف‌های موجود با یه مقدار پیش‌فرض موقت
    await queryInterface.sequelize.query(
      `UPDATE "pages" SET "route" = '/temp-route-' || id WHERE "route" IS NULL;`
    );

    // 3. اعمال قید NOT NULL و UNIQUE
    await queryInterface.changeColumn('pages', 'route', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // در صورت نیاز به rollback، ستون route رو حذف می‌کنه
    await queryInterface.removeColumn('pages', 'route');
  }
};