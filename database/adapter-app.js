// Campus Room Manager - Database Adapter App (Node.js/Express)
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL Connection Configuration
const pool = new Pool({
  user: 'your_postgres_user',
  host: 'localhost',
  database: 'campus_room_manager',
  password: 'your_password',
  port: 5432,
});

// --- API Endpoints ---

// 1. Get All Filières
app.get('/api/filieres', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM filieres ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get Modules by Professor
app.get('/api/professors/:id/modules', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM modules WHERE professor_id = $1', [id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Get Today's Sessions
app.get('/api/sessions/today', async (req, res) => {
  try {
    const query = `
      SELECT s.*, m.name as module_name, r.name as room_name 
      FROM sessions s
      JOIN modules m ON s.module_id = m.id
      JOIN rooms r ON s.room_id = r.id
      WHERE s.start_time::date = CURRENT_DATE
      ORDER BY s.start_time ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Update Attendance Status
app.post('/api/attendance/mark', async (req, res) => {
  const { sessionId, studentId, status } = req.body;
  try {
    const query = `
      INSERT INTO attendance (session_id, student_id, status)
      VALUES ($1, $2, $3)
      ON CONFLICT (session_id, student_id) 
      DO UPDATE SET status = EXCLUDED.status, marked_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await pool.query(query, [sessionId, studentId, status]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Database Adapter App running on http://localhost:${PORT}`);
});
