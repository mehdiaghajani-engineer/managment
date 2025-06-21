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
    console.error('Error fetching pages:', err.stack);
    res.status(500).json({ error: 'Error fetching pages', details: err.message });
  }
});

// دریافت یه صفحه خاص بر اساس id
router.get('/:id', checkPermission('view_pages'), async (req, res) => {
  try {
    const page = await Page.findByPk(req.params.id, {
      include: [
        { model: req.models.User, as: 'creator' },
        { model: req.models.Entity, as: 'entity' },
        { model: req.models.Section, as: 'sections' },
        { model: req.models.DynamicData, as: 'dynamicData' },
      ],
    });
    if (!page) return res.status(404).json({ error: 'Page not found' });
    res.json(page);
  } catch (err) {
    console.error('Error fetching page by ID:', err.stack);
    res.status(500).json({ error: 'Error fetching page', details: err.message });
  }
});

// دریافت صفحه بر اساس route
router.get('/route/:route', checkPermission('view_pages'), async (req, res) => {
  try {
    const page = await Page.findOne({
      where: { route: `/${req.params.route}` },
      include: [
        { model: req.models.User, as: 'creator' },
        { model: req.models.Entity, as: 'entity' },
        { model: req.models.Section, as: 'sections' },
        { model: req.models.DynamicData, as: 'dynamicData' },
      ],
    });
    if (!page) return res.status(404).json({ error: 'Page not found' });
    res.json(page);
  } catch (err) {
    console.error('Error fetching page by route:', err.stack);
    res.status(500).json({ error: 'Error fetching page', details: err.message });
  }
});

// ایجاد صفحه جدید
router.post('/', checkPermission('manage_pages'), async (req, res) => {
  try {
    const { name, route, config, slug, status, categories, createdBy, dataSource } = req.body;

    if (!name || !route || !createdBy) {
      return res.status(400).json({ error: 'Name, route, and createdBy are required' });
    }

    if (!route.startsWith('/')) {
      return res.status(400).json({ error: 'Route must start with "/"' });
    }

    const existingPage = await Page.findOne({ where: { route } });
    if (existingPage) return res.status(400).json({ error: 'Route must be unique' });

    const newPage = await Page.create({
      name,
      route,
      config: config || {
        sections: [],
        fields: {},
        metadata: { status: 'draft', permissions: {}, conditions: [], filters: [], calculations: [], layout: 'single-column' },
        interactions: { triggers: [], actions: [] },
        aiSuggestions: { suggestions: [], applied: [] },
      },
      slug,
      status: status || 'draft',
      categories: categories || [],
      createdBy,
      dataSource,
    });

    const dynamicPermissions = [`view_page_${newPage.name}`, `edit_page_${newPage.name}`, `manage_page_${newPage.name}`];
    await Promise.all(dynamicPermissions.map(permName =>
      Permission.findOrCreate({
        where: { name: permName },
        defaults: { name: permName, description: `Auto generated permission for page ${newPage.name}` },
      })
    ));

    res.status(201).json(newPage);
  } catch (err) {
    console.error('Error creating page:', err.stack);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Name or route must be unique' });
    }
    res.status(500).json({ error: 'Error creating page', details: err.message });
  }
});

// ویرایش صفحه
router.put('/:id', checkPermission('manage_pages'), async (req, res) => {
  try {
    const page = await Page.findByPk(req.params.id);
    if (!page) return res.status(404).json({ error: 'Page not found' });

    const { name, route, config, slug, status, categories, dataSource } = req.body;

    if (route) {
      if (!route.startsWith('/')) return res.status(400).json({ error: 'Route must start with "/"' });
      const existingPage = await Page.findOne({ where: { route } });
      if (existingPage && existingPage.id !== page.id) return res.status(400).json({ error: 'Route must be unique' });
    }

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
    console.error('Error updating page:', err.stack);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Name or route must be unique' });
    }
    res.status(500).json({ error: 'Error updating page', details: err.message });
  }
});

// حذف صفحه
router.delete('/:id', checkPermission('manage_pages'), async (req, res) => {
  try {
    const page = await Page.findByPk(req.params.id);
    if (!page) return res.status(404).json({ error: 'Page not found' });

    const dynamicPermissions = [`view_page_${page.name}`, `edit_page_${page.name}`, `manage_page_${page.name}`];
    await Permission.destroy({ where: { name: dynamicPermissions } });

    await page.destroy();
    res.json({ message: 'Page deleted' });
  } catch (err) {
    console.error('Error deleting page:', err.stack);
    res.status(500).json({ error: 'Error deleting page', details: err.message });
  }
});

module.exports = router;