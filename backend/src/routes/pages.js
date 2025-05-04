const express = require('express');
const router = express.Router();
const { Page, Permission } = require('../models');
const { checkPermission } = require('../middleware/checkPermission');

// دریافت همه صفحات
router.get('/', checkPermission('view_pages'), async (req, res) => {
  try {
    const pages = await Page.findAll({
      include: [
        { model: req.models.User, as: 'creator' },
        { model: req.models.Entity, as: 'entity' },
        { model: req.models.Section, as: 'sections' },
        { model: req.models.DynamicData, as: 'dynamicData' },
      ],
    });
    res.json(pages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching pages' });
  }
});

// دریافت یه صفحه خاص
router.get('/:id', checkPermission('view_pages'), async (req, res) => {
  try {
    const page = await Page.findByPk(req.params.id); // حذف include برای تست ساده
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json(page);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching page' });
  }
});

// ایجاد صفحه جدید
router.post('/', checkPermission('manage_pages'), async (req, res) => {
  try {
    const { name, route, config, slug, status, categories, createdBy, dataSource } = req.body;

    // اعتبارسنجی فیلدهای اجباری
    if (!name || !route || !createdBy) {
      return res.status(400).json({ error: 'Name, route, and createdBy are required' });
    }

    // اعتبارسنجی route (باید با / شروع بشه)
    if (!route.startsWith('/')) {
      return res.status(400).json({ error: 'Route must start with "/"' });
    }

    // بررسی یکتایی route
    const existingPage = await Page.findOne({ where: { route } });
    if (existingPage) {
      return res.status(400).json({ error: 'Route must be unique' });
    }

    // ایجاد صفحه جدید
    const newPage = await Page.create({
      name,
      route,
      config: config || {
        sections: [],
        fields: {},
        metadata: {
          status: 'draft',
          permissions: {},
          conditions: [],
          filters: [],
          calculations: [],
          layout: 'single-column',
        },
        interactions: { triggers: [], actions: [] },
        aiSuggestions: { suggestions: [], applied: [] },
      },
      slug,
      status: status || 'draft',
      categories: categories || [],
      createdBy,
      dataSource,
    });

    // ایجاد Permissionهای داینامیک
    const dynamicPermissions = [
      `view_page_${newPage.name}`,
      `edit_page_${newPage.name}`,
      `manage_page_${newPage.name}`,
    ];
    for (const permName of dynamicPermissions) {
      await Permission.findOrCreate({
        where: { name: permName },
        defaults: { name: permName, description: `Auto generated permission for page ${newPage.name}` },
      });
    }

    res.status(201).json(newPage);
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Name or route must be unique' });
    }
    res.status(500).json({ error: 'Error creating page' });
  }
});

// ویرایش صفحه
router.put('/:id', checkPermission('manage_pages'), async (req, res) => {
  try {
    const page = await Page.findByPk(req.params.id);
    if (!page) return res.status(404).json({ error: 'Page not found' });

    const { name, route, config, slug, status, categories, dataSource } = req.body;

    // اعتبارسنجی route (اگه تغییر کرده)
    if (route) {
      if (!route.startsWith('/')) {
        return res.status(400).json({ error: 'Route must start with "/"' });
      }
      const existingPage = await Page.findOne({ where: { route } });
      if (existingPage && existingPage.id !== page.id) {
        return res.status(400).json({ error: 'Route must be unique' });
      }
    }

    // به‌روزرسانی صفحه
    page.name = name || page.name;
    page.route = route || page.route;
    page.config = config || page.config;
    page.slug = slug !== undefined ? slug : page.slug;
    page.status = status || page.status;
    page.categories = categories || page.categories;
    page.dataSource = dataSource !== undefined ? dataSource : page.dataSource;

    await page.save();
    res.json(page);
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Name or route must be unique' });
    }
    res.status(500).json({ error: 'Error updating page' });
  }
});

// حذف صفحه
router.delete('/:id', checkPermission('manage_pages'), async (req, res) => {
  try {
    const page = await Page.findByPk(req.params.id);
    if (!page) return res.status(404).json({ error: 'Page not found' });

    // حذف Permissionهای داینامیک مرتبط (اختیاری)
    const dynamicPermissions = [
      `view_page_${page.name}`,
      `edit_page_${page.name}`,
      `manage_page_${page.name}`,
    ];
    await Permission.destroy({ where: { name: dynamicPermissions } });

    await page.destroy();
    res.json({ message: 'Page deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting page' });
  }
});

module.exports = router;