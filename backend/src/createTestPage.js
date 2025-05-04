// backend/src/createTestPage.js
const { Page } = require('./models');

Page.create({ name: 'Test Page', config: { title: 'Test', sections: [] } })
  .then(page => console.log('Page created:', page))
  .catch(err => console.error('Error:', err));