import React, { useState, useEffect } from 'react';
import { Scroll, Flag } from 'lucide-react';
import api from '../../api';
import './Archive.scss';

const Archive = () => {
  const [activeTab, setActiveTab] = useState('banners'); // 'banners' or 'ledger'
  const [habits, setHabits] = useState([]);
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [scrollOpen, setScrollOpen] = useState(false);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await api.get('/habits');
      setHabits(response.data);
    } catch (error) {
      console.error('Error fetching habits:', error);
    }
  };

  const fetchReport = async () => {
    setLoadingReport(true);
    setScrollOpen(true);
    try {
      const response = await api.get('/archive-report');
      setReport(response.data.report);
    } catch (error) {
      console.error('Error fetching archive report:', error);
      setReport("The ravens failed to return with the report. The Maester is unavailable.");
    }
    setLoadingReport(false);
  };

  // Helper to determine banner style based on streak
  const getBannerStyle = (completedDays) => {
    const streak = completedDays ? completedDays.length : 0;
    if (streak >= 7) return 'banner-gold';
    if (streak >= 3) return 'banner-silver';
    return 'banner-cloth';
  };

  return (
    <div className="archive-container">
      <div className="archive-tabs">
        <button 
          className={`tab-btn ${activeTab === 'banners' ? 'active' : ''}`}
          onClick={() => setActiveTab('banners')}
        >
          <Flag size={20} />
          The Hall of Banners
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ledger' ? 'active' : ''}`}
          onClick={() => setActiveTab('ledger')}
        >
          <Scroll size={20} />
          The Maester's Ledger
        </button>
      </div>

      {activeTab === 'banners' && (
        <div className="hall-of-banners">
          <div className="hall-intro">
            <h3>Milestones of the Realm</h3>
            <p>Every sustained habit weaves a new tapestry in the great hall.</p>
          </div>
          
          <div className="banner-gallery">
            {habits.length === 0 ? (
              <div className="empty-hall">The hall is empty. Forge habits to hang your banners.</div>
            ) : (
              habits.map(habit => (
                <div key={habit.id} className={`hanging-banner ${getBannerStyle(habit.completed_days)}`}>
                  <div className="banner-rod"></div>
                  <div className="banner-fabric">
                    <div className="banner-sigil"></div>
                    <h4>{habit.title}</h4>
                    <div className="streak-count">
                      Streak: {habit.completed_days ? habit.completed_days.length : 0}
                    </div>
                  </div>
                  <div className="banner-tails"></div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'ledger' && (
        <div className="maesters-ledger">
          <div className="shelf">
            <div className="scroll-item" onClick={!scrollOpen ? fetchReport : null}>
              <div className={`scroll-wax-seal ${scrollOpen ? 'broken' : ''}`}></div>
              <span className="scroll-label">Chronicle of the Current Era</span>
            </div>
          </div>
          
          {scrollOpen && (
            <div className={`open-parchment ${loadingReport ? 'loading' : 'loaded'}`}>
              <div className="parchment-content">
                {loadingReport ? (
                  <div className="summoning-text">Summoning the ravens... interpreting the flames...</div>
                ) : (
                  <div className="report-text">
                    <h3>The Royal Assessment</h3>
                    <p>{report}</p>
                    <button className="close-scroll-btn" onClick={() => setScrollOpen(false)}>
                      Roll Scroll
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Archive;
