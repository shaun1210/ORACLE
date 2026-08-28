import React, { useState, useEffect } from 'react';
import api from '../../api';
import './HabitTracker.scss';
import { Flame, Plus, Trash2 } from 'lucide-react';

const HabitTracker = () => {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');

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

  return (
    <div className="habit-container">
      <h2 className="section-title">Alliances & Fealties</h2>
      <div className="section-divider">
        <div className="div-line"></div>
        <div className="div-ornament"></div>
        <div className="div-line right"></div>
      </div>


      <form className="add-habit-form" onSubmit={addHabit}>
        <input 
          type="text" 
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="New habit to track..." 
          className="habit-input"
        />
        <button type="submit" className="add-btn">
          <Plus size={20} />
        </button>
      </form>

      <div className="habit-grid">
        {habits.map(habit => (
          <div key={habit.id} className="habit-card">
            <div className="habit-header">
              <span className="habit-title">{habit.title}</span>
              <div className="habit-actions">
                <div className="streak-badge">
                  <Flame size={16} className="flame-icon" />
                  <span>{habit.streak || 0}</span>
                </div>
                <button className="delete-btn" onClick={() => deleteHabit(habit.id)} title="Delete Habit">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="week-tracker">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                const isActive = (habit.completed_days || []).includes(idx);
                return (
                  <div 
                    key={idx} 
                    className={`day-circle ${isActive ? 'active' : ''}`}
                    onClick={() => toggleDay(habit.id, idx)}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HabitTracker;
