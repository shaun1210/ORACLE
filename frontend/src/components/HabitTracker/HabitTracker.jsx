import React, { useState, useEffect } from 'react';
import api from '../../api';
import './HabitTracker.scss';
import { Flame, Plus, Trash2, Sparkles, TrendingUp, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

const HabitTracker = () => {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');
  const [smartPlan, setSmartPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [showPlan, setShowPlan] = useState(false);

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

  const addHabit = async (e) => {
    e.preventDefault();
    if (!newHabit.trim()) return;
    
    try {
      const habit = {
        id: Date.now().toString(),
        title: newHabit,
        streak: 0
      };
      await api.post('/habits', habit);
      setHabits([...habits, habit]);
      setNewHabit('');
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  const toggleDay = async (habitId, dayIdx) => {
    try {
      await api.put(`/habits/${habitId}/toggle/${dayIdx}`);
      setHabits(habits.map(habit => {
        if (habit.id === habitId) {
          const days = habit.completed_days || [];
          const newDays = days.includes(dayIdx) ? days.filter(d => d !== dayIdx) : [...days, dayIdx];
          return { ...habit, completed_days: newDays, streak: newDays.length };
        }
        return habit;
      }));
    } catch (error) {
      console.error('Error toggling day:', error);
    }
  };

  const deleteHabit = async (habitId) => {
    try {
      await api.delete(`/habits/${habitId}`);
      setHabits(habits.filter(h => h.id !== habitId));
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const fetchSmartPlan = async () => {
    setLoadingPlan(true);
    setShowPlan(true);
    try {
      const response = await api.get('/habit-plan');
      setSmartPlan(response.data.plan);
    } catch (error) {
      console.error('Error fetching habit plan:', error);
      setSmartPlan('The Maester could not divine a plan. The flames are unclear.');
    }
    setLoadingPlan(false);
  };

  // Calculate stats
  const totalHabits = habits.length;
  const totalCompletions = habits.reduce((acc, h) => acc + (h.completed_days?.length || 0), 0);
  const maxPossible = totalHabits * 7;
  const weeklyRate = maxPossible > 0 ? Math.round((totalCompletions / maxPossible) * 100) : 0;
  const bestStreak = Math.max(0, ...habits.map(h => h.completed_days?.length || 0));

  // Day labels with full names for heatmap
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayFullNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Calculate per-day completion rate across all habits
  const dayRates = dayLabels.map((_, idx) => {
    const completed = habits.filter(h => h.completed_days?.includes(idx)).length;
    return totalHabits > 0 ? Math.round((completed / totalHabits) * 100) : 0;
  });

  return (
    <div className="habit-container">
      <h2 className="section-title">Alliances & Fealties</h2>
      <div className="section-divider">
        <div className="div-line"></div>
        <div className="div-ornament"></div>
        <div className="div-line right"></div>
      </div>

      {/* Stats Row */}
      <div className="habit-stats-row">
        <div className="stat-card smooth-in">
          <div className="stat-icon"><Flame size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{totalHabits}</span>
            <span className="stat-label">Active Alliances</span>
          </div>
        </div>
        <div className="stat-card smooth-in smooth-in-delay-1">
          <div className="stat-icon"><Calendar size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{totalCompletions}</span>
            <span className="stat-label">Total Fealties</span>
          </div>
        </div>
        <div className="stat-card smooth-in smooth-in-delay-2">
          <div className="stat-icon"><TrendingUp size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{weeklyRate}%</span>
            <span className="stat-label">Weekly Devotion</span>
          </div>
        </div>
        <div className="stat-card smooth-in smooth-in-delay-3">
          <div className="stat-icon"><Sparkles size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{bestStreak}/7</span>
            <span className="stat-label">Best Streak</span>
          </div>
        </div>
      </div>

      {/* Weekly Heatmap */}
      {totalHabits > 0 && (
        <div className="weekly-heatmap smooth-in smooth-in-delay-2">
          <h4>Weekly Devotion Heatmap</h4>
          <div className="heatmap-grid">
            {dayLabels.map((day, idx) => (
              <div key={day} className="heatmap-day">
                <div 
                  className={`heatmap-cell rate-${Math.floor(dayRates[idx] / 25)}`}
                  style={{ opacity: dayRates[idx] > 0 ? 0.3 + (dayRates[idx] / 100) * 0.7 : 0.15 }}
                  title={`${day}: ${dayRates[idx]}% completion`}
                >
                  <span className="heatmap-pct">{dayRates[idx]}%</span>
                </div>
                <span className="heatmap-label">{day}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <form className="add-habit-form" onSubmit={addHabit}>
        <input 
          type="text" 
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="Forge a new alliance..." 
          className="habit-input"
        />
        <button type="submit" className="add-btn">
          <Plus size={20} />
        </button>
      </form>

      {/* Smart Plan Section */}
      <div className="smart-plan-section smooth-in smooth-in-delay-3">
        <button 
          className={`smart-plan-toggle ${showPlan ? 'active' : ''}`}
          onClick={() => { if (!showPlan) fetchSmartPlan(); else setShowPlan(false); }}
        >
          <Sparkles size={18} />
          <span>{showPlan ? 'Dismiss Royal Counsel' : 'Summon Smart Habit Plan'}</span>
          {showPlan ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {showPlan && (
          <div className="smart-plan-content">
            {loadingPlan ? (
              <div className="plan-loading">
                <div className="loading-spinner"></div>
                <p>The Maester studies the flames...</p>
              </div>
            ) : smartPlan ? (
              typeof smartPlan === 'string' ? (
                <p className="plan-text">{smartPlan}</p>
              ) : (
                <div className="plan-cards">
                  {Array.isArray(smartPlan) ? smartPlan.map((item, idx) => (
                    <div key={idx} className="plan-card" style={{ animationDelay: `${idx * 0.1}s` }}>
                      <div className="plan-card-header">
                        <span className="plan-habit-name">{item.habit || `Habit ${idx + 1}`}</span>
                      </div>
                      <div className="plan-card-body">
                        <div className="plan-field">
                          <span className="plan-field-label">Recommendation</span>
                          <p>{item.recommendation}</p>
                        </div>
                        <div className="plan-field">
                          <span className="plan-field-label">Strategy</span>
                          <p>{item.strategy}</p>
                        </div>
                        <div className="plan-field motivation">
                          <span className="plan-field-label">Motivation</span>
                          <p>{item.motivation}</p>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <p className="plan-text">{JSON.stringify(smartPlan)}</p>
                  )}
                </div>
              )
            ) : null}
          </div>
        )}
      </div>

      <div className="habit-grid">
        {habits.map((habit, idx) => {
          const completedCount = habit.completed_days?.length || 0;
          const completionPct = Math.round((completedCount / 7) * 100);
          const circumference = 2 * Math.PI * 28;
          const strokeDashoffset = circumference - (completionPct / 100) * circumference;

          return (
            <div key={habit.id} className="habit-card smooth-in" style={{ animationDelay: `${0.1 + idx * 0.05}s` }}>
              {/* Progress Ring */}
              <div className="habit-progress-ring">
                <svg viewBox="0 0 64 64" className="progress-svg">
                  <circle cx="32" cy="32" r="28" className="ring-bg" />
                  <circle 
                    cx="32" cy="32" r="28" 
                    className="ring-fill"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                  />
                </svg>
                <span className="ring-text">{completionPct}%</span>
              </div>

              <div className="habit-header">
                <span className="habit-title">{habit.title}</span>
                <div className="habit-actions">
                  <div className="streak-badge">
                    <Flame size={16} className="flame-icon" />
                    <span>{completedCount}</span>
                  </div>
                  <button className="delete-btn" onClick={() => deleteHabit(habit.id)} title="Delete Habit">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Per-day completion dots */}
              <div className="day-dots">
                {dayLabels.map((day, dayIdx) => {
                  const isActive = (habit.completed_days || []).includes(dayIdx);
                  const isToday = new Date().getDay() === (dayIdx + 1) % 7;
                  return (
                    <div 
                      key={dayIdx} 
                      className={`day-dot ${isActive ? 'active' : ''} ${isToday ? 'today' : ''}`}
                      onClick={() => toggleDay(habit.id, dayIdx)}
                      title={`${dayFullNames[dayIdx]}${isActive ? ' ✓' : ''}`}
                    >
                      <span className="dot-letter">{day[0]}</span>
                      {isActive && <span className="dot-check">✓</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HabitTracker;
