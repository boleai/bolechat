import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SettingsModal from './SettingsModal';

const ChatList = ({ onSelectChat, currentChatId }) => {
  const [chats, setChats] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  
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

  return (
    <div className="chat-list">
      <button onClick={createNewChat}>新建会话</button>
      <div className="sessions">
        {chats.map(chat => (
          <div 
            key={chat.id} 
            className={`chat-session ${chat.id === currentChatId ? 'active' : ''}`}
            onClick={() => onSelectChat(chat.id)}
          >
            {chat.title}
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
    </div>
  );
};

export default ChatList; 