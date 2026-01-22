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

// --- MySQL 連接設定 ---
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

// 1. 登入 API
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

// 2. 獲取專案列表 API
app.get('/api/projects', (req, res) => {
    const query = 'SELECT * FROM projects ORDER BY created_at DESC';
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, data: results });
    });
});

// 3. 創建新專案 API
app.post('/api/projects', (req, res) => {
    const { name, description } = req.body;
    
    const query = 'INSERT INTO projects (name, description, status) VALUES (?, ?, ?)';
    
    db.query(query, [name, description, 'To Do'], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        res.json({ 
            success: true, 
            message: 'Project created', 
            project: { id: result.insertId, name, description, status: 'To Do' } 
        });
    });
});

// 4. 使用者管理 API

// 獲取所有使用者列表
app.get('/api/users', (req, res) => {
  const query = 'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ message: 'Failed to fetch users' });
    }
    res.json(results);
  });
});

// get current user data
app.get('/api/users/me', (req, res) => {
  console.log('收到 /api/users/me 請求');

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }

  // 從臨時 token 取出 userId（格式：dummy-token-5 → 5）
  if (!token.startsWith('dummy-token-')) {
    console.log('Invalid token format:', token);
    return res.status(403).json({ message: 'Invalid token format' });
  }

  const userId = token.split('-')[2];
  if (!userId || isNaN(userId)) {
    console.log('無法解析 userId 從 token:', token);
    return res.status(403).json({ message: 'Invalid token' });
  }

  const query = 'SELECT id, name, email, role FROM users WHERE id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('查詢個人資料錯誤:', err);
      return res.status(500).json({ message: '查詢失敗' });
    }

    if (results.length === 0) {
      console.log('找不到使用者 ID:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('個人資料載入成功 ID:', userId, results[0]);
    res.json(results[0]);
  });
});

// Get current user's tasks (之後用番呢個)
// app.get('/api/tasks/my', (req, res) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) return res.status(401).json({ message: 'No token provided' });

//   // 從 token 取出 userId
//   if (!token.startsWith('dummy-token-')) return res.status(403).json({ message: 'Invalid token format' });
//   const userId = token.split('-')[2];
//   if (!userId || isNaN(userId)) return res.status(403).json({ message: 'Invalid token' });

//   const query = 'SELECT * FROM task_manager WHERE assignee = ?';
//   db.query(query, [userId], (err, results) => {
//     if (err) return res.status(500).json({ message: '查詢失敗' });
//     res.json(results);
//   });
// });

// Get current user's tasks (Demo用)
app.get('/api/tasks/my', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  // 從 token 取出 userId
  if (!token.startsWith('dummy-token-')) return res.status(403).json({ message: 'Invalid token format' });
  const userId = token.split('-')[2];
  if (!userId || isNaN(userId)) return res.status(403).json({ message: 'Invalid token' });

  // 先查出該使用者的 name
  const nameQuery = 'SELECT name FROM users WHERE id = ?';
  db.query(nameQuery, [userId], (err, nameResults) => {
    if (err) return res.status(500).json({ message: '查詢使用者名稱失敗' });
    if (nameResults.length === 0) return res.status(404).json({ message: 'User not found' });

    const userName = nameResults[0].name;

    // 用 name 查詢任務
    const taskQuery = 'SELECT * FROM task_manager WHERE assignee = ?';
    db.query(taskQuery, [userName], (err, results) => {
      if (err) return res.status(500).json({ message: '查詢任務失敗' });
      res.json(results);
    });
  });
});

// 建立新使用者 (Admin 用)
app.post('/api/users', (req, res) => {
  console.log('收到 /api/users POST:', req.body);

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: '請填寫所有欄位' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const checkQuery = 'SELECT * FROM users WHERE LOWER(TRIM(email)) = ?';
  db.query(checkQuery, [normalizedEmail], (err, results) => {
    if (err) {
      console.error('查詢錯誤:', err);
      return res.status(500).json({ message: '查詢失敗' });
    }

    console.log('查詢結果 - 重複數:', results.length, 'Email:', normalizedEmail);

    if (results.length > 0) {
      console.log('發現重複 Email:', results[0].email);
      return res.status(409).json({ message: 'Email already exists' });
    }

    const insertQuery = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(insertQuery, [name, normalizedEmail, password, role], (err, result) => {
      if (err) {
        console.error('插入錯誤:', err);
        return res.status(500).json({ message: '建立失敗' });
      }

      console.log('建立成功，ID:', result.insertId);
      res.status(201).json({ message: 'User created successfully' });
    });
  });
});

// Modify current user password
app.post('/api/users/change-password', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ message: '請填寫所有欄位' });

  // 從 token 取出 userId
  if (!token.startsWith('dummy-token-')) return res.status(403).json({ message: 'Invalid token format' });
  const userId = token.split('-')[2];
  if (!userId || isNaN(userId)) return res.status(403).json({ message: 'Invalid token' });

  const checkQuery = 'SELECT password FROM users WHERE id = ?';
  db.query(checkQuery, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: '查詢失敗' });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });

    if (results[0].password !== currentPassword) {
      return res.status(401).json({ message: '當前密碼錯誤' });
    }

    const updateQuery = 'UPDATE users SET password = ? WHERE id = ?';
    db.query(updateQuery, [newPassword, userId], (err) => {
      if (err) return res.status(500).json({ message: '更新失敗' });
      res.json({ message: '密碼更新成功' });
    });
  });
});

// 更新使用者
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

// 刪除單個使用者
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

// 註冊新用戶 API（保留給一般註冊用）
app.post('/api/register', (req, res) => {
  console.log('收到註冊請求:', req.body);

  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: '請填寫所有欄位' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const checkQuery = 'SELECT * FROM users WHERE LOWER(TRIM(email)) = ?';
  db.query(checkQuery, [normalizedEmail], (err, results) => {
    if (err) {
      console.error('查詢錯誤:', err);
      return res.status(500).json({ success: false, message: '查詢失敗' });
    }

    if (results.length > 0) {
      console.log('發現重複 Email:', results[0].email);
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }

    const insertQuery = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(insertQuery, [name, normalizedEmail, password, role], (err, result) => {
      if (err) {
        console.error('插入錯誤:', err);
        return res.status(500).json({ success: false, message: '建立失敗' });
      }

      console.log('註冊成功，ID:', result.insertId);
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
      console.error('查詢使用者錯誤:', err);
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
      console.error('查詢任務錯誤:', err);
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
  const { project, title, status, priority, assignee, dueDate, userStory } = req.body;

  const query = `
    INSERT INTO task_manager (project, title, status, priority, assignee, dueDate, userStory)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [
    project,
    title,
    status,
    priority,
    assignee || null,
    dueDate || null,
    userStory || null
  ], (err, result) => {
    if (err) {
      console.error('建立任務錯誤:', err);
      return res.status(500).json({ success: false, error: '建立任務失敗: ' + err.message });
    }

    res.json({
      success: true,
      message: 'Task created',
      task: {
        id: result.insertId,
        project,
        title,
        status,
        priority,
        assignee,
        dueDate,
        userStory
      }
    });
  });
});

// Update Task API
app.put('/api/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const { project, title, status, priority, userStory, assignee, role, dueDate } = req.body;

  const query = `
    UPDATE task_manager
    SET project = ?, title = ?, status = ?, priority = ?, userStory = ?, assignee = ?, role = ?, dueDate = ?
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
    dueDate || null,
    taskId
  ], (err, result) => {
    if (err) {
      console.error('更新任務錯誤:', err);
      return res.status(500).json({ success: false, error: '更新任務失敗: ' + err.message });
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