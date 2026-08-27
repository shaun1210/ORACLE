import React, { useState, useEffect } from 'react';
import { Bird, Send, Trash2, Clock } from 'lucide-react';
import api from '../../api';
import './RavenNetwork.scss';

const RavenNetwork = () => {
  const [ravens, setRavens] = useState([]);
  const [message, setMessage] = useState('');
  const [dispatchTime, setDispatchTime] = useState('');

  useEffect(() => {
    fetchRavens();
  }, []);

  const fetchRavens = async () => {
    try {
      const response = await api.get('/ravens');
      setRavens(response.data);
    } catch (error) {
      console.error('Error fetching ravens:', error);
    }
  };

  const handleDispatchRaven = async (e) => {
    e.preventDefault();
    if (!message.trim() || !dispatchTime) return;
    
    // Create an ISO string for the dispatch time based on today's date
    const now = new Date();
    const [hours, minutes] = dispatchTime.split(':');
    const scheduledDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hours), parseInt(minutes));
    
    if (scheduledDate < now) {
      // If time has passed today, schedule for tomorrow
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }
    
    const newRaven = {
      id: Date.now().toString(),
      message: message.trim(),
      dispatch_time: scheduledDate.toISOString()
    };
    
    try {
      await api.post('/ravens', newRaven);
      setRavens([...ravens, newRaven]);
      setMessage('');
      setDispatchTime('');
    } catch (error) {
      console.error('Error dispatching raven:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/ravens/${id}`);
      setRavens(ravens.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting raven:', error);
    }
  };

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="raven-network-container">
      
      <div className="rookery-tower">
        <div className="tower-header">
          <Bird size={48} className="master-raven-icon" />
          <h3>The Raven Network</h3>
          <p>Schedule messages to be delivered across the realm.</p>
        </div>

        <div className="dispatch-station">
          <h4>Prepare a Scroll</h4>
          <form onSubmit={handleDispatchRaven} className="dispatch-form">
            <div className="form-group">
              <label>The Message</label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. The Lannisters send their regards..."
                rows="3"
                required
              ></textarea>
            </div>
            
            <div className="form-group time-group">
              <label><Clock size={16} /> Time of Dispatch</label>
              <input 
                type="time" 
                value={dispatchTime}
                onChange={(e) => setDispatchTime(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="send-btn">
              <Send size={18} /> Dispatch Raven
            </button>
          </form>
        </div>
      </div>

      <div className="cages-area">
        <h4>Ravens Awaiting Flight</h4>
        <div className="ravens-list">
          {ravens.length === 0 ? (
            <div className="empty-cages">All ravens have flown. The cages are empty.</div>
          ) : (
            ravens.map(r => {
              const isPast = new Date(r.dispatch_time) < new Date();
              return (
                <div key={r.id} className={`raven-item ${isPast ? 'flown' : ''}`}>
                  <div className="r-icon">
                    <Bird size={24} />
                  </div>
                  <div className="r-details">
                    <span className="r-message">"{r.message}"</span>
                    <span className="r-time">Scheduled for: {formatTime(r.dispatch_time)}</span>
                  </div>
                  <button className="delete-btn" onClick={() => handleDelete(r.id)} title="Recall Raven">
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};

export default RavenNetwork;
