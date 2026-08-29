import React, { useState, useEffect } from 'react';
import api from '../../api';
import './Calendar.scss';
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const Calendar = () => {
  const [schedule, setSchedule] = useState([]);
  const [foodEntries, setFoodEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [newEvent, setNewEvent] = useState({
    title: '', date: new Date().toISOString().split('T')[0], time: '09:00', duration: 60
  });

  useEffect(() => {
    fetchSchedule();
    fetchFoodEntries();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await api.get('/schedule');
      setSchedule(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      setLoading(false);
    }
  };

  const fetchFoodEntries = async () => {
    try {
      const response = await api.get('/fitness/entries');
      setFoodEntries(response.data);
    } catch (error) {
      console.error('Error fetching food entries:', error);
    }
  };

  const getDayCalories = (dateStr) => {
    const dayFoods = foodEntries.filter(f => f.date === dateStr);
    return dayFoods.reduce((a, f) => a + f.calories, 0);
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title.trim()) return;
    
    try {
      const item = {
        id: Date.now().toString(),
        title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time,
        duration: parseInt(newEvent.duration),
        is_busy: true
      };
      await api.post('/schedule', item);
      setSchedule([...schedule, item]);
      setShowForm(false);
      setNewEvent({ ...newEvent, title: '' });
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const deleteEvent = async (id) => {
    try {
      await api.delete(`/schedule/${id}`);
      setSchedule(schedule.filter(s => s.id !== id));
      if (selectedEvent && selectedEvent.id === id) {
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleCellClick = (dateStr) => {
    if (dateStr) {
      setNewEvent({ ...newEvent, date: dateStr });
      setShowForm(true);
    }
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = new Date(year, month, 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    
    const days = [];
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push(dateString);
    }
    return days;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date();
    return dateStr === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="month-navigation">
          <button className="nav-btn" onClick={prevMonth}><ChevronLeft size={18} /></button>
          <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
          <button className="nav-btn" onClick={nextMonth}><ChevronRight size={18} /></button>
        </div>
      </div>

      {showForm && (
        <form className="event-form" onSubmit={handleAddEvent}>
          <input 
            type="text" 
            placeholder="Event Title" 
            value={newEvent.title}
            onChange={e => setNewEvent({...newEvent, title: e.target.value})}
            required
          />
          <input 
            type="date" 
            value={newEvent.date}
            onChange={e => setNewEvent({...newEvent, date: e.target.value})}
            required
          />
          <input 
            type="time" 
            value={newEvent.time}
            onChange={e => setNewEvent({...newEvent, time: e.target.value})}
            required
          />
          <input 
            type="number" 
            placeholder="Duration (mins)" 
            value={newEvent.duration}
            onChange={e => setNewEvent({...newEvent, duration: e.target.value})}
            min="15"
            required
          />
          <button type="submit" className="submit-event-btn">Save</button>
        </form>
      )}

      {selectedEvent && (
        <div className="event-modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="event-modal" onClick={e => e.stopPropagation()}>
            <h3>Event Details</h3>
            <div className="event-detail-row">
              <strong>Title:</strong> <p>{selectedEvent.title}</p>
            </div>
            <div className="event-detail-row">
              <strong>Date:</strong> <span>{selectedEvent.date || selectedEvent.day}</span>
            </div>
            <div className="event-detail-row">
              <strong>Time:</strong> <span>{selectedEvent.time}</span>
            </div>
            <div className="event-detail-row">
              <strong>Duration:</strong> <span>{selectedEvent.duration} minutes</span>
            </div>
            <div className="modal-actions">
              <button className="delete-btn" onClick={() => deleteEvent(selectedEvent.id)}>
                <Trash2 size={14} /> Delete
              </button>
              <button className="close-btn" onClick={() => setSelectedEvent(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="loader">Loading schedule...</div>
      ) : (
        <div className="month-grid">
          {weekDays.map(day => (
            <div key={day} className="weekday-header">{day}</div>
          ))}
          {generateCalendarDays().map((dateStr, idx) => (
            <div 
              key={idx} 
              className={`calendar-cell ${!dateStr ? 'empty' : 'clickable'} ${isToday(dateStr) ? 'today' : ''}`}
              onClick={() => handleCellClick(dateStr)}
            >
              {dateStr && (
                <>
                  <div className="cell-date">{parseInt(dateStr.split('-')[2])}</div>
                  {getDayCalories(dateStr) > 0 && (
                    <div className="cell-nutrition">
                      <span className="cell-cal">{Math.round(getDayCalories(dateStr))} cal</span>
                    </div>
                  )}
                  <div className="cell-events">
                    {schedule
                      .filter(item => item.date === dateStr || item.day === dateStr)
                      .sort((a, b) => (a.time || "").localeCompare(b.time || ""))
                      .map(item => (
                        <div 
                          key={item.id} 
                          className="compact-event"
                          onClick={(e) => { e.stopPropagation(); setSelectedEvent(item); }}
                        >
                          <span className="compact-title">{item.time} {item.title}</span>
                          <button className="delete-btn" onClick={(e) => { e.stopPropagation(); deleteEvent(item.id); }}>
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Calendar;
