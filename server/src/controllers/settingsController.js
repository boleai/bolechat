const pool = require('../config/database');

const settingsController = {
  // 获取 API Key
  getApiKey: async (req, res) => {
    try {
      const [rows] = await pool.query(
        'SELECT key_value as apiKey FROM settings WHERE key_name = ?',
        ['api_key']
      );
      
      res.json({ apiKey: rows[0]?.apiKey || '' });
    } catch (error) {
      console.error('获取API Key失败:', error);
      res.status(500).json({ error: '获取失败' });
    }
  },

  // 保存 API Key
  saveApiKey: async (req, res) => {
    const { apiKey } = req.body;
    
    try {
      await pool.query(
        'INSERT INTO settings (key_name, key_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE key_value = ?',
        ['api_key', apiKey, apiKey]
      );
      
      res.json({ success: true });
    } catch (error) {
      console.error('保存API Key失败:', error);
      res.status(500).json({ error: '保存失败' });
    }
  }
};

module.exports = settingsController; 