import React, { useState } from 'react';
import axios from 'axios';

const SettingsModal = ({ isOpen, onClose, currentApiKey }) => {
  const [apiKey, setApiKey] = useState(currentApiKey || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      const trimmedApiKey = apiKey.trim();
      
      // 验证 API Key 格式
      if (!trimmedApiKey.startsWith('sk-') || trimmedApiKey.length < 20) {
        alert('请输入正确格式的 API Key');
        return;
      }
      
      setSaving(true);
      // 调用后端API保存API Key
      await axios.post('http://localhost:3000/api/settings/apikey', { 
        apiKey: trimmedApiKey
      });
      
      // 保存到localStorage作为缓存
      localStorage.setItem('siliconflow_api_key', trimmedApiKey);
      
      onClose();
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>设置</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label>API Key</label>
            <input
              type="password"
              value={""}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="请输入 API Key"
            />
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>取消</button>
          <button 
            className="save-button" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal; 