// backend/src/testPage.js
const { sequelize, Page, Section, DynamicData } = require('./models');

async function testPage() {
  try {
    // تولید name و slug منحصربه‌فرد
    const uniqueName = `Test Form Page ${Date.now()}`;
    const uniqueSlug = `test-form-${Date.now()}`;

    // تست ایجاد یک صفحه
    const page = await Page.create({
      name: uniqueName,
      config: { sections: [], fields: {}, metadata: { status: 'draft' } },
      slug: uniqueSlug,
      status: 'draft',
      categories: []
    });
    console.log('Page created:', page.toJSON());

    // تست ایجاد یک بخش برای صفحه
    const section = await Section.create({
      type: 'text',
      content: { value: 'Sample Text', conditions: [] },
      order: 0,
      pageId: page.id
    });
    console.log('Section created:', section.toJSON());

    // تست ایجاد داده داینامیک برای صفحه
    const dynamicData = await DynamicData.create({
      pageId: page.id,
      fieldName: 'Sample Field',
      fieldType: 'text',
      fieldValue: { value: 'Test Value', conditions: [] }
    });
    console.log('DynamicData created:', dynamicData.toJSON());

    // تست خواندن صفحه با رابطه‌ها
    const pageWithRelations = await Page.findOne({
      where: { slug: uniqueSlug },
      include: [
        { model: Section, as: 'sections' },
        { model: DynamicData, as: 'dynamicData' }
      ]
    });
    console.log('Page with relations:', JSON.stringify(pageWithRelations.toJSON(), null, 2));

    console.log('All tests passed successfully!');
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await sequelize.close();
  }
}

testPage();