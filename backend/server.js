// backend/server.js (MySQL Version)
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const { createServer } = require('http'); 
const { Server } = require('socket.io');  

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const httpServer = createServer(app);

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

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});


io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // 進入 Project 房間
    socket.on('joinProject', (projectId) => {
        socket.join(`project_${projectId}`);
        console.log(`User joined room: project_${projectId}`);
    });

    // 建立個人房，例如 'user_5'
    socket.on('joinSelf', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined their private room`);
    });

    // 處理傳送訊息
    socket.on('sendMessage', (data) => {
        const { project_id, user_id, user_name, message } = data;

        // 1. 存入資料庫
        const sql = "INSERT INTO project_messages (project_id, user_id, user_name, message) VALUES (?, ?, ?, ?)";
        db.query(sql, [project_id, user_id, user_name, message], (err, result) => {
            if (err) return console.error(err);

            // 2. 廣播比同一個 Project 房嘅所有人 (包括自己)
            const newMessage = {
                id: result.insertId,
                ...data,
                created_at: new Date()
            };
            io.to(`project_${project_id}`).emit('receiveMessage', newMessage);
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// 新增 API：獲取歷史訊息
app.get('/api/projects/:id/messages', (req, res) => {
    const sql = "SELECT * FROM project_messages WHERE project_id = ? ORDER BY created_at ASC";
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: results });
    });
});

// 最後將 app.listen 改成 httpServer.listen
httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
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





// 獲取特定專案的所有成員
app.get('/api/projects/:id/members', (req, res) => {
  const sql = `
    SELECT u.id, u.name, u.role, u.email 
    FROM users u
    JOIN project_members pm ON u.id = pm.user_id
    WHERE pm.project_id = ?`;
    
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ data: results });
  });
});

// 加入新成員到專案
app.post('/api/projects/:id/members', (req, res) => {
  const { userId } = req.body;
  const projectId = req.params.id;

  // 檢查是否重複加入
  const checkSql = "SELECT * FROM project_members WHERE project_id = ? AND user_id = ?";
  db.query(checkSql, [projectId, userId], (err, rows) => {
    if (rows && rows.length > 0) {
      return res.status(400).json({ message: "該用戶已經在專案中，不會重複發送通知" });
    }

    // A. 加入成員
    const sqlMember = "INSERT INTO project_members (project_id, user_id) VALUES (?, ?)";
    db.query(sqlMember, [projectId, userId], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      // B. 拿專案名稱
      db.query("SELECT name FROM projects WHERE id = ?", [projectId], (err, proj) => {
        const projectName = proj ? proj[0].name : "Unknown Project";
        const msg = `You have been added to project: ${projectName}`;

        // C. 寫入通知表
        db.query("INSERT INTO notifications (user_id, message) VALUES (?, ?)", [userId, msg], (err, noti) => {
          if (err) console.error("Notification DB Error:", err);

          // D. Socket 發送 (確保 userId 正確)
          console.log(`發送 Socket 通知給 user_${userId}`);
          io.to(`user_${userId}`).emit('newNotification', {
            id: noti ? noti.insertId : Date.now(),
            message: msg,
            created_at: new Date()
          });

          res.json({ success: true, message: "Member added and notified" });
        });
      });
    });
  });
});

app.get('/api/projects/:id', (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM projects WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "Project not found" });
    res.json({ data: results[0] });
  });
});

// Get all users list (For Dropdown)
app.get('/api/users', (req, res) => {
  const { role } = req.query;
  let sql = 'SELECT id, name, role FROM users';
  let params = [];
  
  if (role) {
    sql += ' WHERE role = ?';
    params.push(role);
  }
  
  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, data: results });
  });
});

// 2. Get project list API
// backend/server.js - Update the Project List API
app.get('/api/projects', (req, res) => {
  const { userId, role, userName } = req.query; 

  let sql = "";
  let params = [];

  // 只有 Admin 可以看到資料庫裡「所有」專案
  if (role === 'Admin') {
    sql = "SELECT * FROM projects"; 
  } else {
    sql = `
      SELECT DISTINCT p.* 
      FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.project_manager = ? OR pm.user_id = ?
    `;
    params = [userName, userId]; 
  }

  db.query(sql, params, (err, results) => {
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

app.get('/api/notifications/:userId', (req, res) => {
  const sql = "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20";
  db.query(sql, [req.params.userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ data: results });
  });
});

app.put('/api/projects/:id', (req, res) => {
  const projectId = req.params.id;
  let { name, description, start_date, end_date, sprint_count, project_manager, userRole } = req.body;

  // 格式化日期，避免 MySQL 報錯
  if (start_date) start_date = start_date.split('T')[0];
  if (end_date) end_date = end_date.split('T')[0];

  const checkSql = "SELECT project_manager FROM projects WHERE id = ?";
  db.query(checkSql, [projectId], (err, rows) => {
    if (err || rows.length === 0) return res.status(404).json({ message: "Project not found" });

    const oldPm = (rows[0].project_manager || "").trim();
    const newPm = (project_manager || "").trim();

    // 只有 Admin 可以改 PM
    if (oldPm !== newPm && userRole !== 'Admin') {
      return res.status(403).json({ message: "Only Admin can change Project Manager" });
    }

    const updateSql = "UPDATE projects SET name=?, description=?, start_date=?, end_date=?, sprint_count=?, project_manager=? WHERE id=?";
    db.query(updateSql, [name, description, start_date, end_date, sprint_count, newPm, projectId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: "Project updated" });
    });
  });
});

// 4. User managerment API

//get all users list
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
  console.log('收到更改密碼請求:', req.body);

  const token = req.headers.authorization?.split(' ')[1];
  if (!token || !token.startsWith('dummy-token-')) {
    return res.status(401).json({ message: 'Invalid or missing token' });
  }

  const userId = token.split('-')[2];
  if (!userId || isNaN(userId)) {
    return res.status(403).json({ message: 'Invalid token' });
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Missing password fields' });
  }

  // 查詢舊密碼
  const selectQuery = 'SELECT password FROM users WHERE id = ?';
  db.query(selectQuery, [userId], (err, results) => {
    if (err) {
      console.error('查詢密碼錯誤:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const storedPassword = results[0].password;

    if (storedPassword !== currentPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // 更新新密碼（這裡用 newPassword 或 trimmedNew）
    const updateQuery = 'UPDATE users SET password = ? WHERE id = ?';
    db.query(updateQuery, [newPassword, userId], (updateErr) => {
      if (updateErr) {
        console.error('更新密碼錯誤:', updateErr);
        return res.status(500).json({ message: 'Failed to update password' });
      }

      console.log('密碼更新成功 for user ID:', userId);
      res.json({ message: 'Password updated successfully' });
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

   if (assignee) {
      db.query("SELECT id FROM users WHERE name = ?", [assignee], (uErr, uRows) => {
        if (!uErr && uRows.length > 0) {
          const targetUserId = uRows[0].id;
          const msg = `New task assigned: ${title} (Project: ${project})`;

          db.query("INSERT INTO notifications (user_id, message) VALUES (?, ?)", [targetUserId, msg], (nErr, nResult) => {
            if (!nErr) {
              console.log(`Send task notification to user_${targetUserId}`);
              io.to(`user_${targetUserId}`).emit('newNotification', {
                id: nResult.insertId,
                message: msg,
                created_at: new Date(),
                is_read: 0
              });
            }
          });
        }
      });
    }

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

//  Update Task API
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
    sprint,    
    noDates,
    codeUrl,   
    testCase   
  } = req.body;

  const query = `
    UPDATE task_manager
    SET project = ?, title = ?, status = ?, priority = ?, userStory = ?, 
        assignee = ?, role = ?, sprint = ?, noDates = ?, codeUrl = ?, testCase = ?
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
    sprint ? parseInt(sprint) : null,
    noDates ? parseInt(noDates) : 0,
    codeUrl || null,
    testCase || null,
    taskId
  ], (err, result) => {
    if (err) {
      console.error('update task fail:', err);
      return res.status(500).json({ success: false, error: err.message });
    }

    res.json({
      success: true,
      message: 'Task updated successfully'
    });
  });
});

app.post('/api/projects/:id/members', (req, res) => {
  const { userId } = req.body;
  const projectId = req.params.id;
  
  // 1. 先加人入 project_members (你原本有的代碼)
  const sqlMember = "INSERT INTO project_members (project_id, user_id) VALUES (?, ?)";
  db.query(sqlMember, [projectId, userId], (err, result) => {
    if (err) {
      console.error("Add Member Error:", err);
      return res.status(500).json({ error: err.message });
    }

    // 2. 搵返個 Project 名 (用嚟寫入通知內容)
    db.query("SELECT name FROM projects WHERE id = ?", [projectId], (err, proj) => {
      if (err || proj.length === 0) return res.json({ message: "Member added but project not found for notification" });
      const projectName = proj[0].name;
      const msg = `You have been added to project: ${projectName}`;

      // 3. 寫入通知表
      db.query("INSERT INTO notifications (user_id, message) VALUES (?, ?)", [userId, msg], (err, noti) => {
        if (err) {
          console.error("Notification DB Error:", err);
          return res.json({ message: "Member added, but failed to save notification to DB" });
        }
        
        // 4. 【重點】用 Socket 即時射出去比嗰個 User
        console.log(`Sending socket notification to user_${userId}`);
        io.to(`user_${userId}`).emit('newNotification', {
          id: noti.insertId,
          message: msg,
          created_at: new Date()
        });

        res.json({ success: true, message: "Member added and notified" });
      });
    });
  });
});

// server.js 刪除專案成員 + 發送通知
app.delete('/api/projects/:projectId/members/:userId', (req, res) => {
  const { projectId, userId } = req.params;

  // 1. 先搵返個 Project 名（用嚟話比 User 聽佢喺邊個 Project 比人 Remove 咗）
  db.query("SELECT name FROM projects WHERE id = ?", [projectId], (err, proj) => {
    if (err || proj.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }
    const projectName = proj[0].name;

    // 2. 執行刪除成員
    const sqlDelete = "DELETE FROM project_members WHERE project_id = ? AND user_id = ?";
    db.query(sqlDelete, [projectId, userId], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found in this project" });
      }

      // 3. 準備通知訊息
      const msg = `You have been removed from project: ${projectName}`;

      // 4. 寫入 notifications 資料庫
      db.query("INSERT INTO notifications (user_id, message) VALUES (?, ?)", [userId, msg], (err, noti) => {
        if (err) {
          console.error("Remove Notification DB Error:", err);
        } else {
          // 5. 【重點】即時用 Socket 射比嗰個被刪除嘅 User
          console.log(`發送被刪除通知給 user_${userId}`);
          io.to(`user_${userId}`).emit('newNotification', {
            id: noti.insertId,
            message: msg,
            created_at: new Date()
          });
        }

        // 最後先回傳結果比發起刪除請求的人（PM/Admin）
        res.json({ success: true, message: "Member removed and notified" });
      });
    });
  });
});


// ==========================================
// 👇👇👇 Lucas的 Dashboard 专用接口 (已改名) 👇👇👇
// ==========================================

// 1. 获取任务列表 (改名为 /api/fyp/tasks)
app.get('/api/fyp/tasks', (req, res) => {
  db.query('SELECT * FROM tasks', (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results); // 我们直接返回数组，不包在 data 里
  });
});

// 2. 获取 Sprint 列表 (改名为 /api/fyp/sprints)
app.get('/api/fyp/sprints', (req, res) => {
  db.query('SELECT * FROM sprints', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 3. 更新任务状态 (拖拽)
app.put('/api/fyp/tasks/:id/status', (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Status updated' });
  });
});

// 升级版：更新 Sprint (支持改名、改状态、改日期)
app.put('/api/fyp/sprints/:id', (req, res) => {
  const { name, status, start_date, deadline } = req.body;
  const { id } = req.params;
  const sql = 'UPDATE sprints SET name=?, status=?, start_date=?, deadline=? WHERE id=?';
  db.query(sql,[name, status, start_date, deadline, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Sprint updated successfully' });
  });
});

// 5. 新增任务 (加入 progress 和 stage)
app.post('/api/fyp/tasks', (req, res) => {
  const { name, description, assignee, status, stage, priority, start_date, deadline, sprint_id, progress } = req.body;
  const sql = 'INSERT INTO tasks (name, description, assignee, status, stage, priority, start_date, deadline, sprint_id, progress) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  
  db.query(sql,[name, description, assignee, status || 'todo', stage || 'Analysis', priority || 'Medium', start_date, deadline, sprint_id, progress || 0], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, message: 'Task created successfully' });
  });
});

// 6. 删除任务
app.delete('/api/fyp/tasks/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM tasks WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Task deleted' });
  });
});

// 7. 更新任务详情 (加入 progress 和 stage)
app.put('/api/fyp/tasks/:id', (req, res) => {
  const { name, description, assignee, status, stage, priority, start_date, deadline, sprint_id, progress } = req.body;
  const { id } = req.params;
  const sql = 'UPDATE tasks SET name=?, description=?, assignee=?, status=?, stage=?, priority=?, start_date=?, deadline=?, sprint_id=?, progress=? WHERE id=?';
  db.query(sql,[name, description, assignee, status, stage, priority, start_date, deadline, sprint_id, progress, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Task detailed updated' });
  });
});

// 拖拽更新状态时，同步更新 stage
app.put('/api/fyp/tasks/:id/status', (req, res) => {
  const { status, stage } = req.body;
  const { id } = req.params;
  db.query('UPDATE tasks SET status = ?, stage = ? WHERE id = ?', [status, stage, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Status updated' });
  });
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});