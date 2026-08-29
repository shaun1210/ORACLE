import React, { useState, useEffect } from 'react';
import { Map, Plus, Trash2, CheckCircle, Circle, Crosshair, TrendingUp, Clock, Target } from 'lucide-react';
import api from '../../api';
import './WarRoom.scss';

const WarRoom = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [newCampaignTitle, setNewCampaignTitle] = useState('');
  const [newSubtasks, setNewSubtasks] = useState('');
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'workflow'

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

  // Compute overall realm stats
  const totalCampaigns = campaigns.length;
  const avgProgress = totalCampaigns > 0 
    ? Math.round(campaigns.reduce((a, c) => a + c.progress, 0) / totalCampaigns) 
    : 0;
  const completedCampaigns = campaigns.filter(c => c.progress === 100).length;
  const totalMilestones = campaigns.reduce((a, c) => a + c.subtasks.length, 0);
  const completedMilestones = campaigns.reduce((a, c) => a + c.subtasks.filter(s => s.completed).length, 0);

  const getCampaignStatus = (progress) => {
    if (progress === 100) return 'conquered';
    if (progress >= 60) return 'advancing';
    if (progress >= 30) return 'marching';
    return 'planning';
  };

  return (
    <div className="war-room-container">
      
      <div className="map-table">
        {/* Realm Overview Stats */}
        <div className="realm-stats smooth-in">
          <div className="realm-stat">
            <Target size={20} />
            <div className="rs-info">
              <span className="rs-value">{totalCampaigns}</span>
              <span className="rs-label">Campaigns</span>
            </div>
          </div>
          <div className="realm-stat">
            <TrendingUp size={20} />
            <div className="rs-info">
              <span className="rs-value">{avgProgress}%</span>
              <span className="rs-label">Avg Progress</span>
            </div>
          </div>
          <div className="realm-stat">
            <CheckCircle size={20} />
            <div className="rs-info">
              <span className="rs-value">{completedCampaigns}</span>
              <span className="rs-label">Conquered</span>
            </div>
          </div>
          <div className="realm-stat">
            <Clock size={20} />
            <div className="rs-info">
              <span className="rs-value">{completedMilestones}/{totalMilestones}</span>
              <span className="rs-label">Milestones</span>
            </div>
          </div>
        </div>

        <div className="map-header">
          <div className="header-top">
            <h3>The War Room</h3>
            <div className="view-toggle">
              <button 
                className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >List</button>
              <button 
                className={`toggle-btn ${viewMode === 'workflow' ? 'active' : ''}`}
                onClick={() => setViewMode('workflow')}
              >Workflow</button>
            </div>
          </div>
          <p>Plot your major conquests and long-term campaigns.</p>
        </div>

        {/* Workflow View — Campaign timeline */}
        {viewMode === 'workflow' && (
          <div className="workflow-view smooth-in">
            {campaigns.length === 0 ? (
              <div className="empty-map">No campaigns to visualize. Declare one first.</div>
            ) : (
              <div className="workflow-timeline">
                {campaigns.map((c, idx) => (
                  <div key={c.id} className="workflow-node" style={{ animationDelay: `${idx * 0.1}s` }}>
                    {/* Progress ring */}
                    <div className="wf-progress-ring">
                      <svg viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="34" className="wf-ring-bg" />
                        <circle 
                          cx="40" cy="40" r="34" 
                          className={`wf-ring-fill status-${getCampaignStatus(c.progress)}`}
                          strokeDasharray={2 * Math.PI * 34}
                          strokeDashoffset={2 * Math.PI * 34 - (c.progress / 100) * 2 * Math.PI * 34}
                        />
                      </svg>
                      <span className="wf-ring-pct">{c.progress}%</span>
                    </div>
                    <div className="wf-info">
                      <span className={`wf-status-badge status-${getCampaignStatus(c.progress)}`}>
                        {getCampaignStatus(c.progress)}
                      </span>
                      <span className="wf-title">{c.title}</span>
                      <span className="wf-milestones">{c.subtasks.length} milestones</span>
                    </div>
                    {/* Milestone dots */}
                    <div className="wf-milestone-dots">
                      {c.subtasks.map((st, sIdx) => (
                        <div 
                          key={sIdx} 
                          className={`wf-dot ${st.completed ? 'done' : ''}`}
                          title={st.title}
                        />
                      ))}
                    </div>
                    <button 
                      className="wf-select-btn"
                      onClick={() => { setActiveCampaign(c); setViewMode('list'); }}
                    >View</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* List View — Original layout enhanced */}
        {viewMode === 'list' && (
          <div className="map-grid">
            {/* Active Campaigns List */}
            <div className="campaign-markers">
              {campaigns.length === 0 ? (
                <div className="empty-map">The realm is at peace. Plot a new campaign.</div>
              ) : (
                campaigns.map((c, idx) => (
                  <div 
                    key={c.id} 
                    className={`campaign-marker ${activeCampaign?.id === c.id ? 'active' : ''}`}
                    onClick={() => setActiveCampaign(c)}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    {/* Mini progress ring */}
                    <div className="marker-ring">
                      <svg viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="16" className="mr-ring-bg" />
                        <circle 
                          cx="20" cy="20" r="16" 
                          className="mr-ring-fill"
                          strokeDasharray={2 * Math.PI * 16}
                          strokeDashoffset={2 * Math.PI * 16 - (c.progress / 100) * 2 * Math.PI * 16}
                        />
                      </svg>
                      <span className="mr-ring-pct">{c.progress}</span>
                    </div>
                    <div className="marker-details">
                      <span className="marker-title">{c.title}</span>
                      <span className={`marker-status status-${getCampaignStatus(c.progress)}`}>
                        {getCampaignStatus(c.progress)}
                      </span>
                    </div>
                    <button 
                      className="quick-delete-btn" 
                      onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                      title="Abandon Campaign"
                    >
                      <Trash2 size={16} />
                    </button>
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
                    <button className="delete-btn" onClick={(e) => { e.stopPropagation(); handleDelete(activeCampaign.id); }}>
                      <Trash2 size={20} />
                    </button>
                  </div>
                  
                  {/* Large progress ring */}
                  <div className="ac-progress-ring">
                    <svg viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" className="ac-ring-bg" />
                      <circle 
                        cx="60" cy="60" r="50" 
                        className="ac-ring-fill"
                        strokeDasharray={2 * Math.PI * 50}
                        strokeDashoffset={2 * Math.PI * 50 - (activeCampaign.progress / 100) * 2 * Math.PI * 50}
                      />
                    </svg>
                    <div className="ac-ring-content">
                      <span className="ac-ring-pct">{activeCampaign.progress}%</span>
                      <span className="ac-ring-label">Complete</span>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="ac-progress-bar">
                    <div className="progress-bar-track">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${activeCampaign.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="subtasks-list">
                    {activeCampaign.subtasks.map((st, idx) => (
                      <div 
                        key={idx} 
                        className={`subtask-item ${st.completed ? 'completed' : ''}`}
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        <div className="subtask-content" onClick={() => handleToggleSubtask(activeCampaign.id, idx)}>
                          {st.completed ? <CheckCircle size={20} className="check-icon" /> : <Circle size={20} className="circle-icon" />}
                          <span>{st.title}</span>
                        </div>
                        <button 
                          className="delete-milestone-btn" 
                          onClick={(e) => { e.stopPropagation(); handleDeleteMilestone(activeCampaign.id, idx); }}
                          title="Delete Milestone"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {activeCampaign.subtasks.length === 0 && (
                      <div className="no-subtasks">No specific objectives set for this campaign.</div>
                    )}
                    
                    <form onSubmit={handleAddMilestone} className="add-milestone-form">
                      <input 
                        type="text"
                        value={newMilestoneTitle}
                        onChange={(e) => setNewMilestoneTitle(e.target.value)}
                        placeholder="Add new milestone..."
                      />
                      <button type="submit" disabled={!newMilestoneTitle.trim()}>
                        <Plus size={18} />
                      </button>
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
                    
                    <button type="submit" className="declare-btn">
                      <Plus size={18} /> Declare Campaign
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default WarRoom;
