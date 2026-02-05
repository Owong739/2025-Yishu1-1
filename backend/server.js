// backend/server.js (MySQL Version)
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// MySQL connection setting
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

// --- API Routes ---

// 1. Login API
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    
    db.query(query, [email, password], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (results.length > 0) {
            const user = results[0];
            res.json({ 
                success: true, 
                message: 'Login successful', 
                user: { id: user.id, name: user.name, role: user.role } 
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    });
});


// Get all users list (For Dropdown)
app.get('/api/users', (req, res) => {
    const query = 'SELECT id, name, role FROM users';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, data: results });
    });
});

// 2. Get project list API
app.get('/api/projects', (req, res) => {
    const query = 'SELECT * FROM projects ORDER BY created_at DESC';
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, data: results });
    });
});

// Create Project API
app.post('/api/projects', (req, res) => {
    // Recevie new row: startDate, endDate, sprintCount, projectManager
    const { name, description, startDate, endDate, sprintCount, projectManager } = req.body;
    
    const query = 'INSERT INTO projects (name, description, status, start_date, end_date, sprint_count, project_manager) VALUES (?, ?, ?, ?, ?, ?, ?)';
    
    // execute insert
    db.query(query, [name, description, 'To Do', startDate, endDate, sprintCount, projectManager], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        res.json({ 
            success: true, 
            message: 'Project created', 
            // redirect project object and update
            project: { 
                id: result.insertId, 
                name, 
                description, 
                status: 'To Do',
                start_date: startDate,
                end_date: endDate,
                sprint_count: sprintCount,
                project_manager: projectManager
            } 
        });
    });
});

// 4. User managerment API

// get all users list
// app.get('/api/users', (req, res) => {
//   const query = 'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC';
  
//   db.query(query, (err, results) => {
//     if (err) {
//       console.error('Error fetching users:', err);
//       return res.status(500).json({ message: 'Failed to fetch users' });
//     }
//     res.json(results);
//   });
// });

// get current user data
app.get('/api/users/me', (req, res) => {
  console.log('收到 /api/users/me 請求');

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }

  // Get userId from dummy token
  if (!token.startsWith('dummy-token-')) {
    console.log('Invalid token format:', token);
    return res.status(403).json({ message: 'Invalid token format' });
  }

  const userId = token.split('-')[2];
  if (!userId || isNaN(userId)) {
    console.log('cannot explain userId 從 token:', token);
    return res.status(403).json({ message: 'Invalid token' });
  }

  const query = 'SELECT id, name, email, role FROM users WHERE id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('query personal info fail:', err);
      return res.status(500).json({ message: 'query fail' });
    }

    if (results.length === 0) {
      console.log('cannot find user Id:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('personal info load successful, ID:', userId, results[0]);
    res.json(results[0]);
  });
});



// Get current user's tasks (Demo用)
app.get('/api/tasks/my', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  // Get userId from token
  if (!token.startsWith('dummy-token-')) return res.status(403).json({ message: 'Invalid token format' });
  const userId = token.split('-')[2];
  if (!userId || isNaN(userId)) return res.status(403).json({ message: 'Invalid token' });

  // Query user name first
  const nameQuery = 'SELECT name FROM users WHERE id = ?';
  db.query(nameQuery, [userId], (err, nameResults) => {
    if (err) return res.status(500).json({ message: 'query user name fail' });
    if (nameResults.length === 0) return res.status(404).json({ message: 'User not found' });

    const userName = nameResults[0].name;

    // User name to query task
    const taskQuery = 'SELECT * FROM task_manager WHERE assignee = ?';
    db.query(taskQuery, [userName], (err, results) => {
      if (err) return res.status(500).json({ message: 'query task fail' });
      res.json(results);
    });
  });
});

// Create New User (For Admin)
app.post('/api/users', (req, res) => {
  console.log('received /api/users POST:', req.body);

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'please fill in all fields' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const checkQuery = 'SELECT * FROM users WHERE LOWER(TRIM(email)) = ?';
  db.query(checkQuery, [normalizedEmail], (err, results) => {
    if (err) {
      console.error('query fail:', err);
      return res.status(500).json({ message: 'query fail' });
    }

    console.log('query result - duplicate:', results.length, 'Email:', normalizedEmail);

    if (results.length > 0) {
      console.log('Duplicate Email:', results[0].email);
      return res.status(409).json({ message: 'Email already exists' });
    }

    const insertQuery = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(insertQuery, [name, normalizedEmail, password, role], (err, result) => {
      if (err) {
        console.error('Insert error:', err);
        return res.status(500).json({ message: 'create fail' });
      }

      console.log('create successful，ID:', result.insertId);
      res.status(201).json({ message: 'User created successfully' });
    });
  });
});

// Modify current user password
app.post('/api/users/change-password', (req, res) => {
  console.log('Change Password request received');

  const token = 
  req.headers.authorization?.split(' ')[1];
  console.log('Token:', token);

  if (!token) return res.status(401).json({ message: 'No token provided' });

  const { currentPassword, newPassword } = req.body;
  console.log('Received currentPassword:', currentPassword);
  console.log('Received newPassword:', newPassword);

  if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Please fill in all the field' });

  // Get userId from token
  if (!token.startsWith('dummy-token-')) return res.status(403).json({ message: 'Invalid token format' });
  const userId = token.split('-')[2];
  if (!userId || isNaN(userId)) return res.status(403).json({ message: 'Invalid token' });

  const checkQuery = 'SELECT password FROM users WHERE id = ?';
  db.query(checkQuery, [userId], (err, results) => {
    if (err) {
      console.error('query old password fail:', err);
      return res.status(500).json({ message: 'query fail' });
    }
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });

    // Use trim to reduce space issue
    const dbPassword = (results[0].password || '').trim();
    const inputCurrent = (currentPassword || '').trim();

    console.log('DB password (trimmed):', dbPassword);
    console.log('Input current (trimmed):', inputCurrent);

    if (dbPassword !== inputCurrent) {
      console.log('old password unmatch');
      return res.status(401).json({ message: 'current password invalid' });
    }

    const trimmedNew = (newPassword || '').trim();

    const updateQuery = 'UPDATE users SET password = ? WHERE id = ?';
    db.query(updateQuery, [trimmedNew, userId], (err) => {
      if (err) {
        console.error('update password fail:', err);
        return res.status(500).json({ message: 'update fail' });
      }
      console.log('update password successful，userId:', userId);
      res.json({ message: 'update password successful' });
    });
  });
});

// Update user
app.patch('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  if (email) {
    const checkQuery = 'SELECT id FROM users WHERE email = ? AND id != ?';
    db.query(checkQuery, [email, id], (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      if (results.length > 0) {
        return res.status(409).json({ message: 'Email already used by another user' });
      }

      updateUser();
    });
  } else {
    updateUser();
  }

  function updateUser() {
    const fields = [];
    const values = [];

    if (name) { fields.push('name = ?'); values.push(name); }
    if (email) { fields.push('email = ?'); values.push(email); }
    if (role) { fields.push('role = ?'); values.push(role); }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    db.query(query, values, (err) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: 'User updated successfully' });
    });
  }
});

// Modify current user data (only name, email)
app.patch('/api/users/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  if (!token.startsWith('dummy-token-')) return res.status(403).json({ message: 'Invalid token format' });
  const userId = token.split('-')[2];
  if (!userId || isNaN(userId)) return res.status(403).json({ message: 'Invalid token' });

  const { name, email } = req.body;

  const fields = [];
  const values = [];

  if (name) { fields.push('name = ?'); values.push(name); }
  if (email) { fields.push('email = ?'); values.push(email.trim().toLowerCase()); }

  if (fields.length === 0) return res.status(400).json({ message: 'No fields to update' });

  const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
  values.push(userId);

  db.query(query, values, (err) => {
    if (err) {
      console.error('Update personal profile error:', err);
      return res.status(500).json({ message: 'Update failed: ' + err.message });
    }
    res.json({ message: 'Profile updated successfully' });
  });
});

// Delete single user
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM users WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  });
});

// register new user API（for normal register use）
app.post('/api/register', (req, res) => {
  console.log('received register request:', req.body);

  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'please fill in all fields' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const checkQuery = 'SELECT * FROM users WHERE LOWER(TRIM(email)) = ?';
  db.query(checkQuery, [normalizedEmail], (err, results) => {
    if (err) {
      console.error('query error:', err);
      return res.status(500).json({ success: false, message: 'query fail' });
    }

    if (results.length > 0) {
      console.log('Duplicate Email:', results[0].email);
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }

    const insertQuery = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(insertQuery, [name, normalizedEmail, password, role], (err, result) => {
      if (err) {
        console.error('Insert error:', err);
        return res.status(500).json({ success: false, message: 'create fail' });
      }

      console.log('register successful，ID:', result.insertId);
      res.json({ success: true, message: 'User registered successfully' });
    });
  });
});

// Samson task's part

// 4. Get All Users API (給 Assignee 下拉選單用)
app.get('/api/users', (req, res) => {
  const query = 'SELECT id, name, email, role, created_at FROM users ORDER BY name ASC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('query user fail:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({
      success: true,
      data: results
    });
  });
});

// Get All Tasks API (給任務列表用，可加 project 篩選)
app.get('/api/tasks', (req, res) => {
  const { project } = req.query;  // 支持 ?project=Hello World 篩選
  let query = 'SELECT * FROM task_manager';
  let params = [];

  if (project) {
    query += ' WHERE project = ?';
    params.push(project);
  }

  query += ' ORDER BY id DESC';  // 最新優先

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('query task fail:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({
      success: true,
      data: results
    });
  });
});

// Create New Task API
app.post('/api/tasks', (req, res) => {
  // Extract all fields based on the DB design in your image
  const { 
    project, 
    title, 
    status, 
    priority, 
    assignee, 
    role, 
    sprint, 
    noDates, 
    userStory 
  } = req.body;

  // The query must match the column names in your task_manager table
  const query = `
    INSERT INTO task_manager (project, title, status, priority, assignee, role, sprint, noDates, userStory)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // Ensure integers are parsed correctly for DB safety
  db.query(query, [
    project,
    title,
    status,
    priority,
    assignee || null,
    role || 'Default Role',
    sprint ? parseInt(sprint) : null,     // Column 'sprint' is INT
    noDates ? parseInt(noDates) : 0,      // Column 'noDates' is INT and NN (Not Null)
    userStory || null
  ], (err, result) => {
    if (err) {
      console.error('Database Error:', err);
      return res.status(500).json({ success: false, error: 'Database failed: ' + err.message });
    }

    res.json({
      success: true,
      message: 'Task created successfully',
      taskId: result.insertId
    });
  });
});

// Update Task API
app.put('/api/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const { 
    project, 
    title, 
    status, 
    priority, 
    userStory, 
    assignee, 
    role, 
    sprint,    // Get from body
    noDates    // Get from body
  } = req.body;

  // Updated SQL: Added sprint = ? and noDates = ?
  const query = `
    UPDATE task_manager
    SET project = ?, title = ?, status = ?, priority = ?, userStory = ?, assignee = ?, role = ?, sprint = ?, noDates = ?
    WHERE id = ?
  `;

  db.query(query, [
    project,
    title,
    status,
    priority,
    userStory || null,
    assignee || null,
    role || null,
    sprint ? parseInt(sprint) : null, // Handle INT
    noDates ? parseInt(noDates) : 0,  // Handle INT
    taskId
  ], (err, result) => {
    if (err) {
      console.error('update task fail:', err);
      return res.status(500).json({ success: false, error: 'update task fail: ' + err.message });
    }

    res.json({
      success: true,
      message: 'Task updated successfully'
    });
  });
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
