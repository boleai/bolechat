import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Chat = ({ currentChatId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  
  // 加载当前会话消息
  useEffect(() => {
    if (currentChatId) {
      const savedChats = JSON.parse(localStorage.getItem('chat_sessions') || '[]');
      const currentChat = savedChats.find(chat => chat.id === currentChatId);
      if (currentChat) {
        setMessages(currentChat.messages || []);
      }
    }
  }, [currentChatId]);

  // 发送消息
  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const apiKey = localStorage.getItem('siliconflow_api_key');
    if (!apiKey) {
      alert('请先在设置中配置 API Key');
      return;
    }

    const newMessage = {
      role: 'user',
      content: input
    };

    setMessages([...messages, newMessage]);
    setInput('');

    try {
      const response = await axios.post('https://api.siliconflow.cn/v1/chat/completions', {
        messages: [...messages, newMessage],
        model: "gpt-3.5-turbo"
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.choices[0].message.content
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // 保存对话历史
      const savedChats = JSON.parse(localStorage.getItem('chat_sessions') || '[]');
      const chatIndex = savedChats.findIndex(chat => chat.id === currentChatId);
      
      if (chatIndex !== -1) {
        savedChats[chatIndex].messages = [...messages, newMessage, assistantMessage];
        localStorage.setItem('chat_sessions', JSON.stringify(savedChats));
      }
      
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-content">
        {messages.length === 0 ? (
          <div className="welcome-screen">
            <div className="welcome-icon">🤖</div>
            <h1>我是 BoleChat, 很高兴见到你!</h1>
            <p>我可以帮你写代码、读文件、写作各种创意内容，请把你的任务交给我吧~</p>
          </div>
        ) : (
          <div className="messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                {message.content}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="chat-footer">
        <div className="input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="输入消息..."
          />
          <button onClick={sendMessage}>发送</button>
        </div>
      </div>
    </div>
  );
};

export default Chat; 