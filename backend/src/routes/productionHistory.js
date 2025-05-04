// backend/src/routes/productionHistory.js

const express = require('express');
const router = express.Router();

// GET endpoint برای دریافت داده‌های تاریخچه تولید
router.get('/', async (req, res) => {
  try {
    const sampleHistory = [
      {
        id: 1,
        machineId: 1,
        mold: 'Mold A',
        startDate: '2023-01-01',
        endDate: '2023-01-10',
        producedQuantity: 100
      },
      {
        id: 2,
        machineId: 2,
        mold: 'Mold B',
        startDate: '2023-02-01',
        endDate: null,
        producedQuantity: 50
      }
    ];
    res.json(sampleHistory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching production history' });
  }
});

module.exports = router;
