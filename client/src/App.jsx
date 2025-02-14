import React, { useState } from 'react';
import Chat from './components/Chat';
import ChatList from './components/ChatList';
import './styles/Chat.css';

function App() {
  const [currentChatId, setCurrentChatId] = useState(null);

  return (
    <div className="app">
      <ChatList 
        onSelectChat={setCurrentChatId} 
        currentChatId={currentChatId}
      />
      <Chat 
        currentChatId={currentChatId}
      />
    </div>
  );
}

export default App; 