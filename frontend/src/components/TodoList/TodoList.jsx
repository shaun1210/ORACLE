import React, { useState, useEffect } from 'react';
import api from '../../api';
import './TodoList.scss';
import { Check, Circle, Plus, Trash2, Bell, Clock, X } from 'lucide-react';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [schedulingTodo, setSchedulingTodo] = useState(null);
  const [scheduleTime, setScheduleTime] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await api.get('/todos');
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    try {
      const todo = {
        id: Date.now().toString(),
        title: newTodo,
        completed: false
      };
      await api.post('/todos', todo);
      setTodos([...todos, todo]);
      setNewTodo('');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodo = async (id) => {
    try {
      await api.put(`/todos/${id}`);
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await api.delete(`/todos/${id}`);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const sendToRaven = async () => {
    if (!schedulingTodo || !scheduleTime) return;
    
    const now = new Date();
    const [hours, minutes] = scheduleTime.split(':');
    const scheduledDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hours), parseInt(minutes));
    
    if (scheduledDate < now) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }
    
    try {
      const raven = {
        id: Date.now().toString(),
        message: `[Task] ${schedulingTodo.title}`,
        dispatch_time: scheduledDate.toISOString()
      };
      await api.post('/ravens', raven);
      setSchedulingTodo(null);
      setScheduleTime('');
      
      // Visual feedback
      const toast = document.createElement('div');
      toast.className = 'raven-sent-toast';
      toast.textContent = 'Raven dispatched!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (error) {
      console.error('Error dispatching raven:', error);
    }
  };

  const openScheduleModal = (todo) => {
    setSchedulingTodo(todo);
    setScheduleTime('');
  };

  return (
    <div className="todo-container">
      <h2 className="section-title">Tasks for Today</h2>
      <div className="section-divider">
        <div className="div-line"></div>
        <div className="div-ornament"></div>
        <div className="div-line right"></div>
      </div>

      {/* Schedule Modal */}
      {schedulingTodo && (
        <div className="schedule-modal-overlay" onClick={() => setSchedulingTodo(null)}>
          <div className="schedule-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSchedulingTodo(null)}>
              <X size={20} />
            </button>
            <div className="modal-header">
              <Bell size={24} />
              <h3>Dispatch Raven</h3>
            </div>
            <p className="modal-desc">Schedule a notification for: <strong>"{schedulingTodo.title}"</strong></p>
            <div className="modal-time-row">
              <Clock size={18} />
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="time-picker"
              />
            </div>
            <button 
              className="dispatch-btn" 
              onClick={sendToRaven}
              disabled={!scheduleTime}
            >
              <Bell size={16} /> Dispatch Raven
            </button>
          </div>
        </div>
      )}

      <form className="add-todo-form" onSubmit={addTodo}>
        <input 
          type="text" 
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task..." 
          className="todo-input"
        />
        <button type="submit" className="add-btn">
          <Plus size={20} />
        </button>
      </form>

      <div className="todo-list">
        {todos.map((todo, idx) => (
          <div 
            key={todo.id} 
            className={`todo-item ${todo.completed ? 'completed' : ''}`}
            style={{ animationDelay: `${idx * 0.04}s` }}
          >
            <button className="toggle-btn" onClick={() => toggleTodo(todo.id)}>
              {todo.completed ? <Check size={20} className="check-icon" /> : <Circle size={20} className="circle-icon" />}
            </button>
            <span className="todo-title">{todo.title}</span>
            <button 
              className="raven-btn" 
              onClick={() => openScheduleModal(todo)}
              title="Schedule as Raven notification"
            >
              <Bell size={16} />
            </button>
            <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoList;
