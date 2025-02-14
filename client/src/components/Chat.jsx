import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

// 复制文本的辅助函数
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('复制失败:', err);
    return false;
  }
};

const Chat = ({ currentChatId, onUpdateChatTitle }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copyTip, setCopyTip] = useState('');
  const [showControls, setShowControls] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const useStream = true; // 默认使用流式响应
  
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

  // 保存消息到本地存储
  const saveMessagesToLocal = (newMessages) => {
    const savedChats = JSON.parse(localStorage.getItem('chat_sessions') || '[]');
    const chatIndex = savedChats.findIndex(chat => chat.id === currentChatId);
    
    if (chatIndex !== -1) {
      savedChats[chatIndex].messages = newMessages;
      localStorage.setItem('chat_sessions', JSON.stringify(savedChats));
    }
  };

  // 处理复制功能
  const handleCopy = async (content, messageId) => {
    const success = await copyToClipboard(content);
    if (success) {
      setCopyTip(messageId);
      setTimeout(() => setCopyTip(''), 2000); // 2秒后隐藏提示
    }
  };

  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;
    
    const apiKey = localStorage.getItem('siliconflow_api_key');
   
    if (!apiKey) {
      alert('请先在设置中配置 API Key');
      return;
    }

    // 验证 API Key 格式
    if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
      alert('API Key 格式不正确，请检查');
      return;
    }

    const newMessage = {
      role: 'user',
      content: trimmedInput
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    saveMessagesToLocal(updatedMessages);
    
    if (messages.length === 0) {
      onUpdateChatTitle(currentChatId, trimmedInput);
    }
    
    setInput('');
    setLoading(true);
    setErrorMessage('');

    try {
      if (useStream) {
        // 流式响应处理
        const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: updatedMessages,
            model: "deepseek-ai/DeepSeek-R1",
            stream: true,
            temperature: 0.7,
            max_tokens: 8000
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = {
          role: 'assistant',
          content: ''
        };

        // 添加一个空的助手消息到UI，但只添加一次
        setMessages(prevMessages => [...prevMessages, assistantMessage]);

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                break;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content || '';
                assistantMessage.content += content;

                // 更新UI显示流式响应
                setMessages(messages => {
                  const newMessages = [...messages];
                  newMessages[newMessages.length - 1] = { ...assistantMessage };
                  return newMessages;
                });
              } catch (e) {
                console.error('Error parsing SSE message:', e);
              }
            }
          }
        }

        // 保存完整对话到本地存储
        saveMessagesToLocal([...updatedMessages, assistantMessage]);
      } else {
        // 非流式响应处理
        const response = await axios.post('https://api.siliconflow.cn/v1/chat/completions', {
          messages: updatedMessages,
          model: "deepseek-ai/DeepSeek-V3",
          stream: false,
          temperature: 0.7,
          max_tokens: 8000
        }, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000,
        });

        const assistantMessage = {
          role: 'assistant',
          content: response.data.choices[0].message.content
        };

        const finalMessages = [...updatedMessages, assistantMessage];
        setMessages(finalMessages);
        saveMessagesToLocal(finalMessages);
      }
      
    } catch (error) {
      console.error('Error:', error);
      let message = '发送消息失败，请重试';
      if (error.name === 'AbortError' || error.code === 'ECONNABORTED' || 
          error.message?.includes('status: 504') || error.response?.status === 504) {
        message = '服务器响应超时，请稍后重试';
      } else if (error.message?.includes('status: 401') || error.response?.status === 401) {
        message = 'API Key 无效或已过期，请检查设置';
      } else if (error.message?.includes('status: 5') || error.response?.status >= 500) {
        message = '服务器暂时不可用，请稍后重试';
      } else if (!navigator.onLine) {
        message = '网络连接已断开，请检查网络设置';
      }
      setErrorMessage(message);
      
      if (error.name === 'AbortError' || error.code === 'ECONNABORTED' || 
          error.message?.includes('status: 504') || error.response?.status === 504) {
        setMessages(updatedMessages);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-content">
        {messages.length === 0 ? (
          <div className="welcome-screen">
            <div className="welcome-icon">🤖</div>
            <h1>我是 BOLE Chat, 很高兴见到你!</h1>
            <p>我可以帮你写代码、读文件、写作各种创意内容，请把你的任务交给我吧~</p>
          </div>
        ) : (
          <div className="messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.role}`}
                onMouseEnter={() => setShowControls(index)}
                onMouseLeave={() => setShowControls(null)}
              >
                {message.role === 'assistant' ? (
                  <ReactMarkdown
                    rehypePlugins={[rehypeRaw]}
                    className="markdown-content"
                    components={{
                      p: ({node, ...props}) => (
                        <p style={{
                          whiteSpace: 'pre-wrap',
                          marginBottom: '0.2em',
                          lineHeight: '1.3'
                        }} {...props} />
                      ),
                      ul: ({node, ...props}) => (
                        <ul style={{
                          marginTop: '0.2em',
                          marginBottom: '0.2em',
                          paddingLeft: '1.5em'
                        }} {...props} />
                      ),
                      ol: ({node, ...props}) => (
                        <ol style={{
                          marginTop: '0.2em',
                          marginBottom: '0.2em',
                          paddingLeft: '1.5em'
                        }} {...props} />
                      ),
                      pre: ({ node, ...props }) => (
                        <div className="code-block-wrapper">
                          <div className="code-block-header">
                            <button
                              className="copy-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(props.children[0].props.children[0], `code-${index}`);
                              }}
                            >
                              {copyTip === `code-${index}` ? '已复制 ✓' : '复制代码'}
                            </button>
                          </div>
                          <pre 
                            className="code-block" 
                            style={{whiteSpace: 'pre-wrap'}}
                            {...props} 
                          />
                        </div>
                      ),
                      li: ({node, ...props}) => (
                        <li style={{
                          marginBottom: '0.1em',
                          lineHeight: '1.3',
                          display: 'list-item'
                        }} {...props} />
                      ),
                      blockquote: ({node, ...props}) => (
                        <blockquote style={{
                          marginTop: '0.5em',
                          marginBottom: '0.5em',
                          paddingLeft: '1em',
                          borderLeft: '4px solid #4e7dff',
                          color: '#666'
                        }} {...props} />
                      ),
                      code: ({ node, inline, ...props }) => (
                        inline ? 
                          <code className="inline-code" {...props} /> :
                          <code className="block-code" {...props} />
                      )
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  <div className="user-message" style={{whiteSpace: 'pre-wrap'}}>
                    {message.content}
                  </div>
                )}
                {showControls === index && (
                  <div className="message-actions">
                    <button
                      className="action-button"
                      onClick={() => handleCopy(message.content, index)}
                      title={copyTip === index ? '已复制' : '复制'}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        {copyTip === index ? (
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                        ) : (
                          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                        )}
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="message assistant loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            {errorMessage && (
              <div className="error-message">
                <div className="error-icon">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z"/>
                  </svg>
                </div>
                {errorMessage}
              </div>
            )}
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