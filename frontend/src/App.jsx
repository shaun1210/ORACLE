import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Calendar from './components/Calendar/Calendar';
import TodoList from './components/TodoList/TodoList';
import HabitTracker from './components/HabitTracker/HabitTracker';
import Archive from './components/Archive/Archive';
import Treasury from './components/Treasury/Treasury';
import WarRoom from './components/WarRoom/WarRoom';
import RavenNetwork from './components/RavenNetwork/RavenNetwork';
import MaesterChatbot from './components/MaesterChatbot/MaesterChatbot';
import RealmBackground from './components/RealmBackground/RealmBackground';
import { CalendarDays, CheckSquare, Target, BookOpen, Coins, Map, Bird } from 'lucide-react';
import api from './api';
import './App.scss';

function AppContent() {
  const [ravens, setRavens] = useState([]);
  const [activeToast, setActiveToast] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  // Close sidebar on nav link click (mobile feel)
  const handleNavClick = () => {
    if (window.innerWidth < 1100) setIsSidebarOpen(false);
  };

  // Fetch ravens for global notifications
  useEffect(() => {
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
  useEffect(() => {
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
    <div className={`app-frame ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>

      {/* Atmospheric Realm Background */}
      <RealmBackground />

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

      {/* SIDEBAR OVERLAY (mobile) */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* COLUMN 1: SIDEBAR */}
      <aside className={`sidebar-column ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="logo-section">
          <img src="/assets/oracle_emblem.png" alt="ORACLE Emblem" className="oracle-emblem" />
          <div className="logo-text">
            <h1 className="logo-title">ORACLE</h1>
            <span className="logo-subtitle">REALM CHRONICLE</span>
          </div>
        </div>
        <nav className="nav-menu">
          <Link to="/" className={`nav-slab-link ${location.pathname === '/' ? 'active' : ''}`} onClick={handleNavClick}>
            <img src="/assets/sidebar_nav/calendar_btn.png?v=2" alt="Calendar" className="nav-slab-img" />
          </Link>
          <Link to="/todos" className={`nav-slab-link ${location.pathname === '/todos' ? 'active' : ''}`} onClick={handleNavClick}>
            <img src="/assets/sidebar_nav/campaigns_btn.png?v=2" alt="Current Campaigns" className="nav-slab-img" />
          </Link>
          <Link to="/habits" className={`nav-slab-link ${location.pathname === '/habits' ? 'active' : ''}`} onClick={handleNavClick}>
            <img src="/assets/sidebar_nav/alliances_btn.png?v=2" alt="Alliances" className="nav-slab-img" />
          </Link>
          <Link to="/archive" className={`nav-slab-link ${location.pathname === '/archive' ? 'active' : ''}`} onClick={handleNavClick}>
            <img src="/assets/sidebar_nav/archive_btn.png?v=2" alt="The Archive" className="nav-slab-img" />
          </Link>
          <div className="nav-divider"></div>
          <Link to="/treasury" className={`nav-slab-link ${location.pathname === '/treasury' ? 'active' : ''}`} onClick={handleNavClick}>
            <img src="/assets/sidebar_nav/treasury_btn.png?v=2" alt="Royal Treasury" className="nav-slab-img" />
          </Link>
          <Link to="/war-room" className={`nav-slab-link ${location.pathname === '/war-room' ? 'active' : ''}`} onClick={handleNavClick}>
            <img src="/assets/sidebar_nav/war_room_btn.png?v=2" alt="The War Room" className="nav-slab-img" />
          </Link>
          <Link to="/ravens" className={`nav-slab-link ${location.pathname === '/ravens' ? 'active' : ''}`} onClick={handleNavClick}>
            <img src="/assets/sidebar_nav/ravens_btn.png?v=2" alt="Raven Network" className="nav-slab-img" />
          </Link>
        </nav>
        <div className="sidebar-decorations">
          <div className="sigil sigil-1"></div>
          <div className="sigil sigil-2"></div>
        </div>
      </aside>

      {/* COLUMN 2: MAIN CONTENT */}
      <main className="main-column">
        <header className="main-header">
          <div className="hamburger-btn-wrapper">
            <button
              className={`hamburger-btn ${isSidebarOpen ? 'is-open' : ''}`}
              onClick={() => setIsSidebarOpen(prev => !prev)}
              title="Toggle Navigation"
              aria-label="Toggle Navigation"
            >
              <span className="ham-line line-1"></span>
              <span className="ham-line line-2"></span>
              <span className="ham-line line-3"></span>
            </button>
          </div>
          <div className="header-center">
            <div className="header-ornament">
              <div className="ornament-line"></div>
              <div className="ornament-diamond"></div>
              <h2 className="parchment-header">ORACLE</h2>
              <div className="ornament-diamond"></div>
              <div className="ornament-line right"></div>
            </div>
            <p className="header-subtitle">The Royal Chronicle of the Realm</p>
          </div>
          <div className="header-spacer"></div>
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
        {!isChatOpen && (
          <button className="maester-toggle-btn" onClick={() => setIsChatOpen(true)} title="Consult the Maester">
            <div className="maester-avatar-indicator"></div>
          </button>
        )}
      </main>

      {/* COLUMN 3: AI CHATBOT */}
      <MaesterChatbot isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
