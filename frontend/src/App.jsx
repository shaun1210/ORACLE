import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Calendar from './components/Calendar/Calendar';
import TodoList from './components/TodoList/TodoList';
import HabitTracker from './components/HabitTracker/HabitTracker';
import Archive from './components/Archive/Archive';
import Treasury from './components/Treasury/Treasury';
import WarRoom from './components/WarRoom/WarRoom';
import RavenNetwork from './components/RavenNetwork/RavenNetwork';
import MaesterChatbot from './components/MaesterChatbot/MaesterChatbot';
import { CalendarDays, CheckSquare, Target, Sword, BookOpen, Coins, Map, Bird, Send } from 'lucide-react';
import api from './api';
import './App.scss';

function AppContent() {
  const [ravens, setRavens] = useState([]);
  const [activeToast, setActiveToast] = useState(null);
  const location = useLocation();

  // Fetch ravens for global notifications
  React.useEffect(() => {
    const fetchRavens = async () => {
      try {
        const response = await api.get('/ravens');
        setRavens(response.data);
      } catch (error) {
        console.error('Error fetching ravens:', error);
      }
    };
    
    fetchRavens();
    const interval = setInterval(fetchRavens, 60000);
    return () => clearInterval(interval);
  }, []);

  // Check for dispatch times
  React.useEffect(() => {
    const checkRavens = () => {
      const now = new Date();
      ravens.forEach(raven => {
        const dispatchTime = new Date(raven.dispatch_time);
        if (
          dispatchTime.getHours() === now.getHours() && 
          dispatchTime.getMinutes() === now.getMinutes() &&
          dispatchTime.getDate() === now.getDate()
        ) {
          if (!activeToast || activeToast.id !== raven.id) {
            setActiveToast(raven);
            setTimeout(() => setActiveToast(null), 8000);
          }
        }
      });
    };
    const interval = setInterval(checkRavens, 10000);
    return () => clearInterval(interval);
  }, [ravens, activeToast]);

  return (
    <div className="app-frame glass-panel">
      
      {/* Global Raven Toast */}
      {activeToast && (
        <div className="global-raven-toast">
          <Bird size={32} className="toast-icon" />
          <div className="toast-content">
            <strong>A Raven Has Arrived:</strong>
            <span>"{activeToast.message}"</span>
          </div>
        </div>
      )}

      {/* COLUMN 1: SIDEBAR */}
      <aside className="sidebar-column">
        <div className="logo-section">
          <img src="/assets/targaryen_logo.png" alt="Targaryen Logo" className="house-logo" />
        </div>
        <nav className="nav-menu">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <CalendarDays size={20} />
            <div className="nav-text">
              <span className="nav-main">The Calendar</span>
              <span className="nav-sub">Schedule</span>
            </div>
          </Link>
          <Link to="/todos" className={`nav-link ${location.pathname === '/todos' ? 'active' : ''}`}>
            <CheckSquare size={20} />
            <div className="nav-text">
              <span className="nav-main">Current Campaigns</span>
              <span className="nav-sub">Tasks</span>
            </div>
          </Link>
          <Link to="/habits" className={`nav-link ${location.pathname === '/habits' ? 'active' : ''}`}>
            <Target size={20} />
            <div className="nav-text">
              <span className="nav-main">Alliances</span>
              <span className="nav-sub">Habits</span>
            </div>
          </Link>
          <Link to="/archive" className={`nav-link ${location.pathname === '/archive' ? 'active' : ''}`}>
            <BookOpen size={20} />
            <div className="nav-text">
              <span className="nav-main">The Archive</span>
              <span className="nav-sub">History</span>
            </div>
          </Link>
          <div className="nav-divider"></div>
          <Link to="/treasury" className={`nav-link ${location.pathname === '/treasury' ? 'active' : ''}`}>
            <Coins size={20} />
            <div className="nav-text">
              <span className="nav-main">Royal Treasury</span>
              <span className="nav-sub">Finances</span>
            </div>
          </Link>
          <Link to="/war-room" className={`nav-link ${location.pathname === '/war-room' ? 'active' : ''}`}>
            <Map size={20} />
            <div className="nav-text">
              <span className="nav-main">The War Room</span>
              <span className="nav-sub">Projects</span>
            </div>
          </Link>
          <Link to="/ravens" className={`nav-link ${location.pathname === '/ravens' ? 'active' : ''}`}>
            <Bird size={20} />
            <div className="nav-text">
              <span className="nav-main">Raven Network</span>
              <span className="nav-sub">Reminders</span>
            </div>
          </Link>
        </nav>
        <div className="sidebar-decorations">
          <div className="sigil sigil-1"></div>
          <div className="sigil sigil-2"></div>
        </div>
      </aside>

      {/* COLUMN 2: MAIN CONTENT */}
      <main className="main-column">
        <div className="banners-decoration">
          <img src="/assets/banners.png" alt="House Banners" />
        </div>
        <header className="main-header">
          <h2 className="parchment-header">The Reigning Chronicle</h2>
        </header>
        <div className="content-area">
          <Routes>
            <Route path="/" element={<Calendar />} />
            <Route path="/todos" element={<TodoList />} />
            <Route path="/habits" element={<HabitTracker />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/treasury" element={<Treasury />} />
            <Route path="/war-room" element={<WarRoom />} />
            <Route path="/ravens" element={<RavenNetwork />} />
          </Routes>
        </div>
      </main>

      {/* COLUMN 3: AI CHATBOT */}
      <MaesterChatbot />
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="body-background">
        <AppContent />
      </div>
    </Router>
  );
}

export default App;
