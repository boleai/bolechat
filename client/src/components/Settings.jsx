import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const Settings = ({ isOpen, onClose }) => {
  const [newApiKey, setNewApiKey] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    if (newApiKey.trim()) {
      localStorage.setItem('siliconflow_api_key', newApiKey.trim());
      setNewApiKey(''); // 清空输入
      setSaveSuccess(true);
      // 1.5秒后关闭提示和弹窗
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1500);
    } else {
      alert('请输入 API Key');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <h3>设置</h3>
        <button className="close-button" onClick={onClose}>&times;</button>
      </div>
      <div className="modal-body">
        <div className="settings-item">
          <label>API Key</label>
          <div className="api-key-input">
            <input
              type="password"
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              placeholder="请输入 API Key"
            />
          </div>
          {saveSuccess && (
            <div className="success-message">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
              API Key 保存成功
            </div>
          )}
        </div>
      </div>
      <div className="modal-footer">
        <button className="save-button" onClick={handleSave}>保存</button>
      </div>
    </Modal>
  );
};

export default Settings; 