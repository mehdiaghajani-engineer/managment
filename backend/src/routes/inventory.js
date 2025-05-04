const express = require('express');
const router = express.Router();

// GET endpoint برای دریافت داده‌های انبار (Inventory)
router.get('/', async (req, res) => {
  try {
    const sampleInventory = [
      { id: 1, item: 'Spare Part A', quantity: 50 },
      { id: 2, item: 'Spare Part B', quantity: 30 }
    ];
    res.json(sampleInventory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching inventory data' });
  }
});

module.exports = router;
