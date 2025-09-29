


import React, { useState, useRef, useEffect } from 'react';
import './App.css';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}
interface ChatHistoryItem {
  id: string;
  title: string;
  messages: Message[];
}

const API_URL = 'http://localhost:5000/api/chat';

function App() {
  const [chats, setChats] = useState<ChatHistoryItem[]>([{
    id: 'default',
    title: 'New Chat',
    messages: []
  }]);
  const [activeChatId, setActiveChatId] = useState('default');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const activeChat = chats.find(c => c.id === activeChatId)!;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat.messages, loading]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg: Message = { sender: 'user', text: input };
    updateChatMessages([...activeChat.messages, userMsg]);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      const botMsg: Message = { sender: 'bot', text: data.reply };
      updateChatMessages([...activeChat.messages, userMsg, botMsg]);
      // Update chat title if it's the first user message
      if (activeChat.title === 'New Chat') {
        updateChatTitle(input.slice(0, 20) + (input.length > 20 ? '...' : ''));
      }
    } catch {
      setError('Failed to get response. Please try again.');
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  function updateChatMessages(newMessages: Message[]) {
    setChats(chats => chats.map(chat =>
      chat.id === activeChatId ? { ...chat, messages: newMessages } : chat
    ));
  }

  function updateChatTitle(newTitle: string) {
    setChats(chats => chats.map(chat =>
      chat.id === activeChatId ? { ...chat, title: newTitle } : chat
    ));
  }

  function startNewChat() {
    const newId = Date.now().toString();
    setChats([{ id: newId, title: 'New Chat', messages: [] }, ...chats]);
    setActiveChatId(newId);
    setInput('');
    setError(null);
  }

  function selectChat(id: string) {
    setActiveChatId(id);
    setError(null);
    setInput('');
  }

  const getAvatar = (sender: 'user' | 'bot') => {
    return sender === 'user' ? (
      <span className="avatar user-avatar" title="You">🧑</span>
    ) : (
      <span className="avatar bot-avatar" title="King">👑</span>
    );
  };

  return (
    <div className="gpt-layout fancy-bg">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-icon">⚡</span>
          ChatGPT
        </div>
        <button className="new-chat-btn" onClick={startNewChat}>+ New Chat</button>
        <div className="chat-history">
          {chats.map(chat => (
            <div
              key={chat.id}
              className={`history-item${chat.id === activeChatId ? ' active' : ''}`}
              onClick={() => selectChat(chat.id)}
            >
              <span className="history-title">{chat.title}</span>
            </div>
          ))}
        </div>
      </aside>
      <main className="chat-main">
        {activeChat.messages.length === 0 && !loading ? (
          <div className="chat-box chat-box-center">
            <div>
              <div className="welcome-message">Where should we begin?</div>
              <form className="chat-input" onSubmit={sendMessage} autoComplete="off">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask anything"
                  disabled={loading}
                  className="input-field"
                />
                <button type="submit" disabled={loading || !input.trim()} className="send-btn">
                  ➤
                </button>
              </form>
            </div>
          </div>
        ) : (
          <>
            <h2 className="chat-title">King AI Chatbot</h2>
            <div className="chat-box">
              {activeChat.messages.map((msg, idx) => (
                <div key={idx} className={`chat-message-bubble ${msg.sender} animate-in`}>
                  {getAvatar(msg.sender)}
                  <div className="bubble-text">
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="chat-message-bubble bot animate-in">
                  {getAvatar('bot')}
                  <div className="bubble-text typing">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            {/* Only show the input at the bottom if there are messages */}
            {activeChat.messages.length > 0 && (
              <form className="chat-input" onSubmit={sendMessage} autoComplete="off">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={loading}
                  className="input-field"
                />
                <button type="submit" disabled={loading || !input.trim()} className="send-btn">
                  ➤
                </button>
              </form>
            )}
          </>
        )}
        <form className="chat-input" onSubmit={sendMessage} autoComplete="off">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            className="input-field"
          />
          <button type="submit" disabled={loading || !input.trim()} className="send-btn">
            ➤
          </button>
        </form>
        {error && <div className="error animate-in">{error}</div>}
        <footer className="footer">Made with <span style={{color:'#eab308'}}>♥</span> by King AI</footer>
      </main>
    </div>
  );
}

export default App;
