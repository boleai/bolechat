import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SettingsModal from './SettingsModal';
import DeleteConfirmModal from './DeleteConfirmModal';

const ChatList = ({ onSelectChat, currentChatId, onDeleteChat }) => {
  const [chats, setChats] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  
  useEffect(() => {
    // 从localStorage加载所有会话
    const savedChats = localStorage.getItem('chat_sessions');
    if (savedChats) {
      setChats(JSON.parse(savedChats));
    }
  }, []);

  // 获取API Key
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/settings/apikey');
        const { apiKey } = response.data;
        if (apiKey) {
          setApiKey(apiKey);
          localStorage.setItem('siliconflow_api_key', apiKey);
        }
      } catch (error) {
        console.error('获取API Key失败:', error);
      }
    };

    fetchApiKey();
  }, []);

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: `新会话 ${chats.length + 1}`,
      messages: []
    };
    
    const updatedChats = [...chats, newChat];
    setChats(updatedChats);
    localStorage.setItem('chat_sessions', JSON.stringify(updatedChats));
    onSelectChat(newChat.id);
  };

  const handleApiKeyChange = (e) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    localStorage.setItem('siliconflow_api_key', newApiKey);
  };

  const handleDeleteClick = (chatId, e) => {
    e.stopPropagation();
    setChatToDelete(chatId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (chatToDelete) {
      onDeleteChat(chatToDelete);
      setDeleteModalOpen(false);
      setChatToDelete(null);
    }
  };

  return (
    <div className="chat-list">
      <button onClick={createNewChat}>新建会话</button>
      <div className="sessions">
        {chats.map(chat => (
          <div 
            key={chat.id} 
            className={`chat-session ${chat.id === currentChatId ? 'active' : ''}`}
            onClick={() => onSelectChat(chat.id)}
            title={chat.firstMessage || '新会话'}
          >
            <span className="session-title">{chat.title}</span>
            <div className="session-actions">
              <button
                className="delete-button"
                onClick={(e) => handleDeleteClick(chat.id, e)}
                title="删除会话"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="settings-section">
        <button 
          className="settings-button"
          onClick={() => setShowSettings(true)}
        >
          ⚙️ 设置
        </button>
      </div>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentApiKey={apiKey}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default ChatList; 