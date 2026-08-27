import React, { useState, useEffect } from 'react';
import api from '../../api';
import './TodoList.scss';
import { Check, Circle, Plus, Trash2 } from 'lucide-react';

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
      <h3>Tasks for Today</h3>
      
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
        {todos.map(todo => (
          <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <button className="toggle-btn" onClick={() => toggleTodo(todo.id)}>
              {todo.completed ? <Check size={20} className="check-icon" /> : <Circle size={20} className="circle-icon" />}
            </button>
            <span className="todo-title">{todo.title}</span>
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
