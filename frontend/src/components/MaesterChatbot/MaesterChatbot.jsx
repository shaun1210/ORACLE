import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import api from '../../api';
import './MaesterChatbot.scss';

/* SVG Raven icon — replaces emoji */
const RavenIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M21,11.5C21,9 18.5,6 16,5C15,3 13,2 11,2C8,2 6,4 5,6C3,7 2,9 2,11C2,14 4,16 6,17L6,20C6,21 7,22 8,22L10,22C11,22 12,21 12,20L12,18C12,18 14,18 16,17C18,16 21,14 21,11.5ZM12,16C10,16 8,15 7,13C6,11 7,8 9,7C10,6 12,6 13,7C15,8 16,10 15,12C14,14 12,16 12,16Z"/>
  </svg>
);

/* SVG Crown icon — replaces emoji */
const CrownIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M2,17L4,7L8,10L12,4L16,10L20,7L22,17H2ZM4,19H20V20C20,21 19,22 18,22H6C5,22 4,21 4,20V19Z"/>
  </svg>
);

const QUICK_SUGGESTIONS = [
  "How is my schedule looking this week?",
  "Give me advice on my habits",
  "Analyze my treasury spending",
  "Suggest improvements for my campaigns",
  "What should I focus on today?",
  "Help me plan tomorrow"
];

const MaesterChatbot = ({ isOpen, setIsOpen }) => {
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: "Your Grace, I am the Royal Maester. I have studied the scrolls of your realm and stand ready to counsel you on matters of scheduling, campaigns, habits, and treasury. How may I serve the Crown?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || loadingChat) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setShowSuggestions(false);
    
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
    inputRef.current?.focus();
  };

  const handleQuickSuggestion = (suggestion) => {
    setChatInput(suggestion);
    setShowSuggestions(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <aside className={`advisor-column ${isOpen ? 'open' : 'closed'}`}>
      <div className="advisor-header">
        <div className="raven-icon"><RavenIcon size={28} color="#8a7040" /></div>
        <h2>The Maester's Advice</h2>
        <button type="button" className="close-panel-btn" onClick={() => setIsOpen(false)} title="Close Panel">×</button>
      </div>
      
      <div className="chat-messages">
        {chatMessages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble ${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="bubble-sigil"><RavenIcon size={18} color="#c9a84c" /></div>
            )}
            <div className="bubble-content">
              <p>{msg.content}</p>
            </div>
            {msg.role === 'user' && (
              <div className="bubble-sigil user-sigil"><CrownIcon size={18} color="#c9a84c" /></div>
            )}
          </div>
        ))}
        {loadingChat && (
          <div className="chat-bubble assistant">
            <div className="bubble-sigil"><RavenIcon size={18} color="#c9a84c" /></div>
            <div className="bubble-content">
              <p className="typing-indicator">
                <span></span><span></span><span></span>
              </p>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {showSuggestions && chatMessages.length <= 2 && (
        <div className="quick-suggestions">
          <div className="qs-label">
            <Sparkles size={14} />
            <span>Quick Counsel</span>
          </div>
          <div className="qs-grid">
            {QUICK_SUGGESTIONS.map((s, idx) => (
              <button key={idx} className="qs-btn" onClick={() => handleQuickSuggestion(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <form className="chat-input-form" onSubmit={handleSendChat}>
        <input 
          ref={inputRef}
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
