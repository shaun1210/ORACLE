import React, { useState, useEffect } from 'react';
import { Map, Plus, Trash2, CheckCircle, Circle, Crosshair } from 'lucide-react';
import api from '../../api';
import './WarRoom.scss';
import UiverseButton from '../UiverseButton/UiverseButton';
import PushableButton from '../PushableButton/PushableButton';

const WarRoom = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [newCampaignTitle, setNewCampaignTitle] = useState('');
  const [newSubtasks, setNewSubtasks] = useState('');
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  
  const [activeCampaign, setActiveCampaign] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await api.get('/campaigns');
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!newCampaignTitle.trim()) return;
    
    // Parse subtasks from comma-separated string
    const subtaskList = newSubtasks.split(',').map(s => s.trim()).filter(s => s !== '');
    
    const newCampaign = {
      id: Date.now().toString(),
      title: newCampaignTitle.trim(),
      progress: 0,
      subtasks: subtaskList.map(title => ({ title, completed: false }))
    };
    
    try {
      await api.post('/campaigns', newCampaign);
      setCampaigns([...campaigns, newCampaign]);
      setNewCampaignTitle('');
      setNewSubtasks('');
    } catch (error) {
      console.error('Error adding campaign:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/campaigns/${id}`);
      setCampaigns(campaigns.filter(c => c.id !== id));
      if (activeCampaign && activeCampaign.id === id) {
        setActiveCampaign(null);
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  const handleToggleSubtask = async (campaignId, subtaskIndex) => {
    try {
      await api.put(`/campaigns/${campaignId}/subtask/${subtaskIndex}`);
      // Optimistic update
      const updatedCampaigns = campaigns.map(c => {
        if (c.id === campaignId) {
          const updatedSubtasks = [...c.subtasks];
          updatedSubtasks[subtaskIndex].completed = !updatedSubtasks[subtaskIndex].completed;
          
          const completedCount = updatedSubtasks.filter(st => st.completed).length;
          const newProgress = Math.round((completedCount / updatedSubtasks.length) * 100);
          
          return { ...c, subtasks: updatedSubtasks, progress: newProgress };
        }
        return c;
      });
      setCampaigns(updatedCampaigns);
      if (activeCampaign && activeCampaign.id === campaignId) {
        setActiveCampaign(updatedCampaigns.find(c => c.id === campaignId));
      }
    } catch (error) {
      console.error('Error toggling subtask:', error);
    }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim() || !activeCampaign) return;

    try {
      await api.post(`/campaigns/${activeCampaign.id}/subtask`, { title: newMilestoneTitle.trim(), completed: false });
      
      const updatedCampaigns = campaigns.map(c => {
        if (c.id === activeCampaign.id) {
          const updatedSubtasks = [...c.subtasks, { title: newMilestoneTitle.trim(), completed: false }];
          const completedCount = updatedSubtasks.filter(st => st.completed).length;
          const newProgress = Math.round((completedCount / updatedSubtasks.length) * 100);
          return { ...c, subtasks: updatedSubtasks, progress: newProgress };
        }
        return c;
      });
      
      setCampaigns(updatedCampaigns);
      setActiveCampaign(updatedCampaigns.find(c => c.id === activeCampaign.id));
      setNewMilestoneTitle('');
    } catch (error) {
      console.error('Error adding milestone:', error);
    }
  };

  const handleDeleteMilestone = async (campaignId, subtaskIndex) => {
    try {
      await api.delete(`/campaigns/${campaignId}/subtask/${subtaskIndex}`);
      
      const updatedCampaigns = campaigns.map(c => {
        if (c.id === campaignId) {
          const updatedSubtasks = [...c.subtasks];
          updatedSubtasks.splice(subtaskIndex, 1);
          const completedCount = updatedSubtasks.filter(st => st.completed).length;
          const newProgress = updatedSubtasks.length > 0 ? Math.round((completedCount / updatedSubtasks.length) * 100) : 0;
          return { ...c, subtasks: updatedSubtasks, progress: newProgress };
        }
        return c;
      });
      
      setCampaigns(updatedCampaigns);
      if (activeCampaign && activeCampaign.id === campaignId) {
        setActiveCampaign(updatedCampaigns.find(c => c.id === campaignId));
      }
    } catch (error) {
      console.error('Error deleting milestone:', error);
    }
  };

  return (
    <div className="war-room-container">
      
      <div className="map-table">
        <div className="map-header">
          <h3>The War Room</h3>
          <p>Plot your major conquests and long-term campaigns.</p>
        </div>

        <div className="map-grid">
          {/* Active Campaigns List (Wooden Markers) */}
          <div className="campaign-markers">
            {campaigns.length === 0 ? (
              <div className="empty-map">The realm is at peace. Plot a new campaign.</div>
            ) : (
              campaigns.map(c => (
                <div 
                  key={c.id} 
                  className={`campaign-marker ${activeCampaign?.id === c.id ? 'active' : ''}`}
                  onClick={() => setActiveCampaign(c)}
                >
                  <div className="marker-sigil"><Crosshair size={24} /></div>
                  <div className="marker-details">
                    <span className="marker-title">{c.title}</span>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${c.progress}%` }}></div>
                    </div>
                  </div>
                  <div style={{ marginLeft: '1rem' }}>
                    <UiverseButton 
                      scale={0.3}
                      onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                      title="Abandon Campaign"
                    >
                      <Trash2 size={24} />
                    </UiverseButton>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Campaign Details Panel */}
          <div className="campaign-details-panel">
            {activeCampaign ? (
              <div className="active-campaign-view">
                <div className="ac-header">
                  <h4>{activeCampaign.title}</h4>
                  <UiverseButton scale={0.4} onClick={(e) => { e.stopPropagation(); handleDelete(activeCampaign.id); }}>
                    <Trash2 size={36} />
                  </UiverseButton>
                </div>
                
                <div className="ac-progress">
                  <span className="progress-text">Conquest Progress: {activeCampaign.progress}%</span>
                </div>
                
                <div className="subtasks-list">
                  {activeCampaign.subtasks.map((st, idx) => (
                    <div 
                      key={idx} 
                      className={`subtask-item ${st.completed ? 'completed' : ''}`}
                    >
                      <div className="subtask-content" onClick={() => handleToggleSubtask(activeCampaign.id, idx)}>
                        {st.completed ? <CheckCircle size={20} className="check-icon" /> : <Circle size={20} className="circle-icon" />}
                        <span>{st.title}</span>
                      </div>
                      <div style={{ marginLeft: '0.5rem' }}>
                        <UiverseButton 
                          scale={0.3}
                          onClick={(e) => { e.stopPropagation(); handleDeleteMilestone(activeCampaign.id, idx); }}
                          title="Delete Milestone"
                        >
                          <Trash2 size={24} />
                        </UiverseButton>
                      </div>
                    </div>
                  ))}
                  {activeCampaign.subtasks.length === 0 && (
                    <div className="no-subtasks">No specific objectives set for this campaign.</div>
                  )}
                  
                  <form onSubmit={handleAddMilestone} className="add-milestone-form" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input 
                      type="text"
                      value={newMilestoneTitle}
                      onChange={(e) => setNewMilestoneTitle(e.target.value)}
                      placeholder="Add new milestone..."
                      style={{ flex: 1 }}
                    />
                    <UiverseButton type="submit" scale={0.4} disabled={!newMilestoneTitle.trim()}>
                      <Plus size={36} />
                    </UiverseButton>
                  </form>
                </div>
              </div>
            ) : (
              <div className="create-campaign-view">
                <h4>Declare a New Campaign</h4>
                <form onSubmit={handleCreateCampaign} className="create-campaign-form">
                  <div className="form-group">
                    <label>Campaign Objective</label>
                    <input 
                      type="text" 
                      value={newCampaignTitle}
                      onChange={(e) => setNewCampaignTitle(e.target.value)}
                      placeholder="e.g. Conquer the Northern Markets"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Strategic Milestones (comma separated)</label>
                    <textarea 
                      value={newSubtasks}
                      onChange={(e) => setNewSubtasks(e.target.value)}
                      placeholder="e.g. Scout the area, Establish supply lines, Launch the attack"
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                    <PushableButton type="submit">
                      Declare Campaign
                    </PushableButton>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default WarRoom;
