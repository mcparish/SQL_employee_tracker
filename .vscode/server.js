const express = require('express');
const { Pool } = require('pg');

const PORT = process.env.PORT || 3001;
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Connect to the PostgreSQL database
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'employee_db',
  password: '',

});

pool.connect();


// Get all employees
app.get('/employees', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employees');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving employees' });
  }
});

// Get employee by ID
app.get('/employees/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const result = await pool.query('SELECT * FROM employees WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving employee' });
  }
});

// Create a new employee
app.post('/employees', async (req, res) => {
  const { name, position, salary } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO employees (name, position, salary) VALUES ($1, $2, $3) RETURNING *',
      [name, position, salary]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating employee' });
  }
});

// Update an employee by ID
app.put('/employees/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, position, salary } = req.body;

  try {
    const result = await pool.query(
      'UPDATE employees SET name=$1, position=$2, salary=$3 WHERE id=$4 RETURNING *',
      [name, position, salary, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating employee' });
  }
});

// Add a department
app.post('/departments', async (req, res) => {
  const { name } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO departments (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating department' });
  }
});

// Add a role
app.post('/roles', async (req, res) => {
  const { name, department_id } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO roles (name, department_id) VALUES ($1, $2) RETURNING *',
      [name, department_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating role' });
  }
});

// Assign a role to an employee
app.post('/employees/:id/roles', async (req, res) => {
  const id = parseInt(req.params.id);
  const { role_id } = req.body;

  try {
    const result = await pool.query(
      'UPDATE employees SET role_id=$1 WHERE id=$2 RETURNING *',
      [role_id, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while assigning role' });
  }
});

// Update an employee role
app.put('/employees/:id/roles', async (req, res) => {
  const id = parseInt(req.params.id);
  const { role_id } = req.body;

  try {
    const result = await pool.query(
      'UPDATE employees SET role_id=$1 WHERE id=$2 RETURNING *',
      [role_id, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating employee role' });
  }
});