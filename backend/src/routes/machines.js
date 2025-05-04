const express = require('express');
const router = express.Router();
const { checkPermission } = require('../middleware/checkPermission');

// GET endpoint برای دریافت لیست ماشین‌ها (داده‌های نمونه)
router.get('/', async (req, res) => {
  try {
    const sampleMachines = [
      {
        id: 1,
        name: 'Machine A',
        status: 'Operational',
        image: 'http://example.com/image.png',
        repairs: ['Repair 1', 'Repair 2'],
        currentMold: 'Mold A',
        moldStartDate: '2023-01-01',
        customFieldGroups: []
      },
      {
        id: 2,
        name: 'Machine B',
        status: 'Maintenance Required',
        image: 'http://example.com/image2.png',
        repairs: ['Repair X'],
        currentMold: 'Mold B',
        moldStartDate: '2023-02-01',
        customFieldGroups: []
      }
    ];
    res.json(sampleMachines);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching machines' });
  }
});

// POST endpoint برای ایجاد ماشین (فقط با مجوز create_machine)
router.post('/', checkPermission('create_machine'), (req, res) => {
  res.json({ success: true, machine: req.body });
});

// PUT endpoint برای به‌روزرسانی ماشین (فقط با مجوز update_machine)
router.put('/:id', checkPermission('update_machine'), (req, res) => {
  const machineId = req.params.id;
  res.json({
    success: true,
    message: `Machine ${machineId} updated successfully`,
    updatedData: req.body
  });
});

// DELETE endpoint برای حذف ماشین (فقط با مجوز delete_machine)
router.delete('/:id', checkPermission('delete_machine'), (req, res) => {
  const machineId = req.params.id;
  res.json({
    success: true,
    message: `Machine ${machineId} deleted successfully`
  });
});

module.exports = router;
