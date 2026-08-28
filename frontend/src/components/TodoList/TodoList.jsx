import React, { useState, useEffect } from 'react';
import api from '../../api';
import './TodoList.scss';
import { Check, Circle, Plus, Trash2 } from 'lucide-react';
import UiverseButton from '../UiverseButton/UiverseButton';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');

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

  return (
    <div className="todo-container">
      <h2 className="section-title">Tasks for Today</h2>
      <div className="section-divider">
        <div className="div-line"></div>
        <div className="div-ornament"></div>
        <div className="div-line right"></div>
      </div>

      <form className="add-todo-form" onSubmit={addTodo} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <input 
          type="text" 
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task..." 
          className="todo-input"
          style={{ flex: 1 }}
        />
        <UiverseButton type="submit" scale={0.5}>
          <Plus size={48} />
        </UiverseButton>
      </form>

      <div className="todo-list">
        {todos.map(todo => (
          <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <UiverseButton scale={0.4} onClick={() => toggleTodo(todo.id)}>
              {todo.completed ? <Check size={48} /> : <Circle size={48} />}
            </UiverseButton>
            <span className="todo-title" style={{ flex: 1 }}>{todo.title}</span>
            <UiverseButton scale={0.4} onClick={() => deleteTodo(todo.id)}>
              <Trash2 size={40} />
            </UiverseButton>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoList;
