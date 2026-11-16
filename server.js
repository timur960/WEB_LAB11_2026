const express = require('express');
const pool = require('./db');

const app = express();
const port = 3000;
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, req.body || '');
  next();
});

// Отримати всіх студентів
app.get('/api/students', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Помилка бази даних' });
  }
});

// Отримати студента за id
app.get('/api/students/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Студента не знайдено' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Помилка бази даних' });
  }
});

// Додати студента
app.post('/api/students', async (req, res) => {
  const { name, age, major } = req.body;
  if (!name || !age || !major) return res.status(400).json({ error: 'Потрібні поля name, age, major' });

  try {
    const result = await pool.query(
      'INSERT INTO students (name, age, major) VALUES ($1, $2, $3) RETURNING *',
      [name, age, major]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Помилка бази даних' });
  }
});

// Оновити студента
app.put('/api/students/:id', async (req, res) => {
  const { name, age, major } = req.body;
  if (!name || !age || !major) return res.status(400).json({ error: 'Потрібні поля name, age, major' });

  try {
    const result = await pool.query(
      'UPDATE students SET name = $1, age = $2, major = $3 WHERE id = $4 RETURNING *',
      [name, age, major, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Студента не знайдено' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Помилка бази даних' });
  }
});

// Видалити студента
app.delete('/api/students/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM students WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Студента не знайдено' });
    res.json({ message: 'Студента видалено', student: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Помилка бази даних' });
  }
});

app.listen(port, () => {
  console.log(`Сервер запущено на http://localhost:${port}`);
});