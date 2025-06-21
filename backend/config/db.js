require('dotenv').config();
const { Pool } = require('pg');

console.log('DB_PASSWORD:', process.env.DB_PASSWORD, 'Type:', typeof process.env.DB_PASSWORD);

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432
});

async function setupDatabase() {
  const client = await pool.connect();
  try {
    console.log('Connected to PostgreSQL database');

    // ایجاد جدول machines
    await client.query(`
      CREATE TABLE IF NOT EXISTS machines (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        location TEXT,
        serial_number TEXT
      )
    `);

    // ایجاد جدول molds
    await client.query(`
      CREATE TABLE IF NOT EXISTS molds (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT
      )
    `);

    // ایجاد جدول custom_fields
    await client.query(`
      CREATE TABLE IF NOT EXISTS custom_fields (
        id SERIAL PRIMARY KEY,
        entity_type TEXT NOT NULL CHECK (entity_type IN ('machine', 'mold')),
        entity_id INTEGER NOT NULL,
        key TEXT NOT NULL,
        value TEXT
      )
    `);

    // ایجاد جدول machine_mold_history
    await client.query(`
      CREATE TABLE IF NOT EXISTS machine_mold_history (
        id SERIAL PRIMARY KEY,
        machine_id INTEGER NOT NULL,
        mold_id INTEGER NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE,
        status TEXT NOT NULL CHECK (status IN ('Operational', 'Under Maintenance', 'Out of Service')),
        operator_id INTEGER NOT NULL,
        production_quantity INTEGER,
        details JSONB,
        FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE,
        FOREIGN KEY (mold_id) REFERENCES molds(id) ON DELETE CASCADE,
        FOREIGN KEY (operator_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // ایجاد جدول maintenance_checklists
    await client.query(`
      CREATE TABLE IF NOT EXISTS maintenance_checklists (
        id SERIAL PRIMARY KEY,
        machine_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', '6months', 'yearly')),
        priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
        items JSONB NOT NULL,
        FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
      )
    `);

    // ایجاد جدول maintenance_checks
    await client.query(`
      CREATE TABLE IF NOT EXISTS maintenance_checks (
        id SERIAL PRIMARY KEY,
        checklist_id INTEGER NOT NULL,
        checked_by INTEGER NOT NULL,
        checked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        status TEXT NOT NULL CHECK (status IN ('completed', 'pending', 'referred')),
        notes TEXT,
        referred_to INTEGER,
        FOREIGN KEY (checklist_id) REFERENCES maintenance_checklists(id) ON DELETE CASCADE,
        FOREIGN KEY (checked_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (referred_to) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    console.log('Database setup completed successfully');
  } catch (err) {
    console.error('Error setting up database:', err.stack);
  } finally {
    client.release();
  }
}

pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err.stack);
  } else {
    setupDatabase().catch(err => console.error('Setup failed:', err.stack));
  }
});

module.exports = pool;