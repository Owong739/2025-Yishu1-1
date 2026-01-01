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
    host: process.env.DB_HOST,      // 讀取 .env 中的 DB_HOST
    user: process.env.DB_USER,      // 讀取 .env 中的 DB_USER
    password: process.env.DB_PASSWORD, // <--- 讀取 .env 中的密碼！
    database: process.env.DB_NAME   // 讀取 .env 中的 DB_NAME
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

// --- API Routes (Real DB) ---

// 1. 登入 API
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    // 注意：實際專案密碼應該要 hash 過 (如使用 bcrypt)，這裡 FYP 簡單起見先明文比對
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
    // 這裡示範獲取所有專案，之後可根據 user id 篩選
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
        
        // 返回新創建的專案資訊
        res.json({ 
            success: true, 
            message: 'Project created', 
            project: { id: result.insertId, name, description, status: 'To Do' } 
        });
    });
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});


// 4. 註冊新用戶 API 
app.post('/api/register', (req, res) => {
    const { name, email, password, role } = req.body;

    // 簡單檢查欄位是否填寫
    if (!name || !email || !password || !role) {
        return res.status(400).json({ success: false, message: 'Please fill in all fields' });
    }

    // 檢查 Email 是否已被註冊
    const checkQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkQuery, [email], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            return res.status(409).json({ success: false, message: 'Email already exists' });
        }

        // 如果 Email 沒重複，就寫入資料庫
        const insertQuery = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
        db.query(insertQuery, [name, email, password, role], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            
            res.json({ 
                success: true, 
                message: 'User registered successfully' 
            });
        });
    });
});
