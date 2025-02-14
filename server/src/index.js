const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const settingsRoutes = require('./routes/settingsRoutes');

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/settings', settingsRoutes);

// 创建数据库表
const initDatabase = async () => {
  const pool = require('./config/database');
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS settings (
      id INT PRIMARY KEY AUTO_INCREMENT,
      key_name VARCHAR(50) NOT NULL UNIQUE,
      key_value TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  try {
    const connection = await pool.getConnection();
    await connection.query(createTableSQL);
    connection.release();
    console.log('数据库表初始化成功');
  } catch (error) {
    console.error('初始化数据库失败:', error);
    throw error; // 抛出错误以便知道具体原因
  }
};

// 启动服务器
const PORT = process.env.PORT || 3000;

// 先初始化数据库，然后再启动服务器
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }); 