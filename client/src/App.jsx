import React, { useState, useEffect } from 'react';
import ChatList from './components/ChatList';
import Chat from './components/Chat';
import Settings from './components/Settings';
import './styles/Chat.css';

const App = () => {
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chats, setChats] = useState([]);
  const [showSettings, setShowSettings] = useState(false);

  // 加载所有会话
  useEffect(() => {
    const savedChats = JSON.parse(localStorage.getItem('chat_sessions') || '[]');
    // 如果没有会话，创建一个新会话
    if (savedChats.length === 0) {
      const newChat = {
        id: Date.now().toString(),
        title: '新会话',
        messages: []
      };
      savedChats.push(newChat);
      localStorage.setItem('chat_sessions', JSON.stringify(savedChats));
      setCurrentChatId(newChat.id);
    }
    setChats(savedChats);
  }, []);

  // 创建新会话
  const createNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: '新会话',
      messages: []
    };
    const updatedChats = [newChat, ...chats];
    setChats(updatedChats);
    localStorage.setItem('chat_sessions', JSON.stringify(updatedChats));
    setCurrentChatId(newChat.id);
  };

  // 更新会话标题
  const updateChatTitle = (chatId, firstMessage) => {
    const updatedChats = chats.map(chat => {
      if (chat.id === chatId) {
        // 取消息前20个字符作为标题
        const title = firstMessage.slice(0, 20) + (firstMessage.length > 20 ? '...' : '');
        return { ...chat, title, firstMessage };
      }
      return chat;
    });
    setChats(updatedChats);
    localStorage.setItem('chat_sessions', JSON.stringify(updatedChats));
  };

  // 删除会话
  const handleDeleteChat = (chatId, e) => {
    e.stopPropagation(); // 阻止事件冒泡
    if (window.confirm('确定要删除这个会话吗？')) {
      const updatedChats = chats.filter(chat => chat.id !== chatId);
      setChats(updatedChats);
      localStorage.setItem('chat_sessions', JSON.stringify(updatedChats));
      
      // 如果删除的是当前会话，清空当前会话
      if (chatId === currentChatId) {
        setCurrentChatId(null);
      }
    }
  };

  return (
    <div className="app">
      <div className="chat-list">
        <div className="list-header">
          <button onClick={createNewChat}>
            新建会话
          </button>
        </div>
        <div className="sessions">
          {chats.map(chat => (
            <div
              key={chat.id}
              className={`chat-session ${chat.id === currentChatId ? 'active' : ''}`}
              onClick={() => setCurrentChatId(chat.id)}
              title={chat.firstMessage || '新会话'}
            >
              <span className="session-title">{chat.title}</span>
              <div className="session-actions">
                <button
                  className="delete-button"
                  onClick={(e) => handleDeleteChat(chat.id, e)}
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
        <div className="list-footer">
          <button 
            className="settings-button"
            onClick={() => setShowSettings(!showSettings)}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.63-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
            </svg>
            设置
          </button>
        </div>
      </div>
      <Chat 
        currentChatId={currentChatId} 
        onUpdateChatTitle={updateChatTitle}
      />
      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};

export default App; 