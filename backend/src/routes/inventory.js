// backend/src/routes/inventory.js
const express = require('express');
const router = express.Router();
const { checkPermission } = require('../middleware/checkPermission');
const pool = require('../../config/db');

router.get('/', checkPermission('view_inventory'), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory');
    console.log('Fetched inventory:', result.rows); // دیباگ
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching inventory:', err.message, err.stack);
    res.status(500).json({ error: 'Error fetching inventory data', details: err.message });
  }
});

router.post('/', checkPermission('manage_inventory'), async (req, res) => {
  try {
    const { item, quantity } = req.body;
    if (!item || !quantity) {
      return res.status(400).json({ error: 'Missing required fields: item and quantity' });
    }
    const result = await pool.query(
      'INSERT INTO inventory (item, quantity) VALUES ($1, $2) RETURNING *',
      [item, quantity]
    );
    console.log('Added inventory item:', result.rows[0]); // دیباگ
    res.json({ success: true, item: result.rows[0] });
  } catch (err) {
    console.error('Error adding inventory item:', err.message, err.stack);
    res.status(500).json({ error: 'Error adding inventory item', details: err.message });
  }
});

router.put('/:id', checkPermission('manage_inventory'), async (req, res) => {
  try {
    const itemId = req.params.id;
    const { item, quantity } = req.body;
    if (!item || !quantity) {
      return res.status(400).json({ error: 'Missing required fields: item and quantity' });
    }
    const result = await pool.query(
      'UPDATE inventory SET item = $1, quantity = $2 WHERE id = $3 RETURNING *',
      [item, quantity, itemId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    console.log('Updated inventory item:', result.rows[0]); // دیباگ
    res.json({
      success: true,
      message: `Item ${itemId} updated successfully`,
      updatedData: result.rows[0]
    });
  } catch (err) {
    console.error('Error updating inventory item:', err.message, err.stack);
    res.status(500).json({ error: 'Error updating inventory item', details: err.message });
  }
});

router.delete('/:id', checkPermission('manage_inventory'), async (req, res) => {
  try {
    const itemId = req.params.id;
    const result = await pool.query('DELETE FROM inventory WHERE id = $1 RETURNING *', [itemId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    console.log('Deleted inventory item:', itemId); // دیباگ
    res.json({
      success: true,
      message: `Item ${itemId} deleted successfully`
    });
  } catch (err) {
    console.error('Error deleting inventory item:', err.message, err.stack);
    res.status(500).json({ error: 'Error deleting inventory item', details: err.message });
  }
});

module.exports = router;