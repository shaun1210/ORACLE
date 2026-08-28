import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import api from '../../api';
import './MaesterChatbot.scss';

const MaesterChatbot = ({ isOpen, setIsOpen }) => {
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: "Your Grace, I am the Royal Maester. I have studied the scrolls of your realm and stand ready to counsel you on matters of scheduling, campaigns, habits, and treasury. How may I serve the Crown?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || loadingChat) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    
    const newMessages = [...chatMessages, { role: 'user', content: userMessage }];
    setChatMessages(newMessages);
    setLoadingChat(true);

    try {
      const response = await api.post('/chat', {
        message: userMessage,
        history: newMessages.slice(-10)
      });
      setChatMessages([...newMessages, { role: 'assistant', content: response.data.reply }]);
    } catch (error) {
      console.error('Error chatting with Maester:', error);
      setChatMessages([...newMessages, { role: 'assistant', content: "A raven was lost in the storm. The Citadel cannot be reached. Ensure the backend is running, Your Grace." }]);
    }
    setLoadingChat(false);
  };

  return (
    <aside className={`advisor-column ${isOpen ? 'open' : 'closed'}`}>
      <div className="advisor-header">
        <div className="raven-icon">🦅</div>
        <h2>The Maester's Advice</h2>
        <button type="button" className="close-panel-btn" onClick={() => setIsOpen(false)} title="Close Panel">×</button>
      </div>
      
      <div className="chat-messages">
        {chatMessages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble ${msg.role}`}>
            {msg.role === 'assistant' && <div className="bubble-sigil">🦅</div>}
            <div className="bubble-content">
              <p>{msg.content}</p>
            </div>
            {msg.role === 'user' && <div className="bubble-sigil user-sigil">👑</div>}
          </div>
        ))}
        {loadingChat && (
          <div className="chat-bubble assistant">
            <div className="bubble-sigil">🦅</div>
            <div className="bubble-content">
              <p className="typing-indicator">
                <span></span><span></span><span></span>
              </p>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      
      <form className="chat-input-form" onSubmit={handleSendChat}>
        <input 
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Speak to the Maester..."
          disabled={loadingChat}
          className="chat-input"
        />
        <button type="submit" className="chat-send-btn" disabled={loadingChat || !chatInput.trim()}>
          <Send size={18} />
        </button>
      </form>
    </aside>
  );
};

export default MaesterChatbot;
