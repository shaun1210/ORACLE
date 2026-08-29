import React, { useState, useEffect } from 'react';
import api from '../../api';
import './FitnessTracker.scss';
import { Plus, Trash2, Target, Flame, Wheat, Beef, ChevronLeft, ChevronRight, UtensilsCrossed, Salad, Moon, Cookie } from 'lucide-react';

const COMMON_FOODS = [
  { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, icon: 'chicken' },
  { name: 'Rice (1 cup)', calories: 206, protein: 4, carbs: 45, icon: 'grain' },
  { name: 'Eggs (2)', calories: 156, protein: 13, carbs: 1, icon: 'egg' },
  { name: 'Banana', calories: 105, protein: 1, carbs: 27, icon: 'fruit' },
  { name: 'Oats (1 cup)', calories: 154, protein: 5, carbs: 27, icon: 'grain' },
  { name: 'Salmon Fillet', calories: 208, protein: 20, carbs: 0, icon: 'fish' },
  { name: 'Sweet Potato', calories: 103, protein: 2, carbs: 24, icon: 'vegetable' },
  { name: 'Broccoli (1 cup)', calories: 55, protein: 4, carbs: 11, icon: 'vegetable' },
  { name: 'Greek Yogurt', calories: 100, protein: 17, carbs: 6, icon: 'dairy' },
  { name: 'Almonds (1oz)', calories: 164, protein: 6, carbs: 6, icon: 'nut' },
  { name: 'Whole Wheat Bread', calories: 81, protein: 4, carbs: 14, icon: 'grain' },
  { name: 'Avocado', calories: 240, protein: 3, carbs: 12, icon: 'fruit' },
  { name: 'Steak (6oz)', calories: 380, protein: 44, carbs: 0, icon: 'meat' },
  { name: 'Pasta (1 cup)', calories: 220, protein: 8, carbs: 43, icon: 'grain' },
  { name: 'Milk (1 cup)', calories: 149, protein: 8, carbs: 12, icon: 'dairy' },
  { name: 'Apple', calories: 95, protein: 0, carbs: 25, icon: 'fruit' },
  { name: 'Peanut Butter (2tbsp)', calories: 188, protein: 8, carbs: 6, icon: 'nut' },
  { name: 'Whey Protein Shake', calories: 120, protein: 24, carbs: 3, icon: 'drink' },
  { name: 'Cottage Cheese', calories: 110, protein: 14, carbs: 5, icon: 'dairy' },
  { name: 'Tuna (1 can)', calories: 128, protein: 26, carbs: 0, icon: 'fish' },
];

const MEAL_ICONS = {
  breakfast: UtensilsCrossed,
  lunch: Salad,
  dinner: Flame,
  snack: Cookie,
};

const FitnessTracker = () => {
  const [entries, setEntries] = useState([]);
  const [goal, setGoal] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newEntry, setNewEntry] = useState({
    name: '', calories: '', protein: '', carbs: '', meal_type: 'other'
  });
  const [goalForm, setGoalForm] = useState({ daily_calories: 2000, daily_protein: 150, daily_carbs: 250 });
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    fetchEntries();
    fetchGoal();
  }, [selectedDate]);

  const fetchEntries = async () => {
    try {
      const response = await api.get(`/fitness/entries?date=${selectedDate}`);
      setEntries(response.data);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const fetchGoal = async () => {
    try {
      const response = await api.get('/fitness/goals');
      if (response.data) {
        setGoal(response.data);
        setGoalForm({
          daily_calories: response.data.daily_calories,
          daily_protein: response.data.daily_protein,
          daily_carbs: response.data.daily_carbs,
        });
      }
    } catch (error) {
      console.error('Error fetching goal:', error);
    }
  };

  const addEntry = async (e) => {
    e.preventDefault();
    if (!newEntry.name.trim() || !newEntry.calories) return;
    try {
      const item = {
        id: Date.now().toString(),
        name: newEntry.name.trim(),
        calories: parseFloat(newEntry.calories),
        protein: parseFloat(newEntry.protein) || 0,
        carbs: parseFloat(newEntry.carbs) || 0,
        date: selectedDate,
        meal_type: newEntry.meal_type,
      };
      await api.post('/fitness/entries', item);
      setEntries([...entries, item]);
      setNewEntry({ name: '', calories: '', protein: '', carbs: '', meal_type: 'other' });
      setShowAddForm(false);
      setAnimKey(k => k + 1);
    } catch (error) {
      console.error('Error adding entry:', error);
    }
  };

  const addQuickFood = async (food) => {
    try {
      const item = {
        id: Date.now().toString(),
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        date: selectedDate,
        meal_type: 'other',
      };
      await api.post('/fitness/entries', item);
      setEntries([...entries, item]);
      setShowQuickAdd(false);
      setSearchQuery('');
      setAnimKey(k => k + 1);
    } catch (error) {
      console.error('Error adding food:', error);
    }
  };

  const deleteEntry = async (id) => {
    try {
      await api.delete(`/fitness/entries/${id}`);
      setEntries(entries.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const saveGoal = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put('/fitness/goals', goalForm);
      setGoal(response.data);
      setShowGoalForm(false);
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  // Calculate totals
  const totals = entries.reduce((acc, e) => ({
    calories: acc.calories + e.calories,
    protein: acc.protein + e.protein,
    carbs: acc.carbs + e.carbs,
  }), { calories: 0, protein: 0, carbs: 0 });

  const dailyCalories = goal?.daily_calories || 2000;
  const dailyProtein = goal?.daily_protein || 150;
  const dailyCarbs = goal?.daily_carbs || 250;

  const caloriePct = Math.min(100, Math.round((totals.calories / dailyCalories) * 100));
  const proteinPct = Math.min(100, Math.round((totals.protein / dailyProtein) * 100));
  const carbsPct = Math.min(100, Math.round((totals.carbs / dailyCarbs) * 100));

  const remaining = Math.max(0, dailyCalories - totals.calories);
  const overBy = Math.max(0, totals.calories - dailyCalories);

  // SVG circle progress
  const circleRadius = 70;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const circleOffset = circleCircumference - (caloriePct / 100) * circleCircumference;

  // Filter common foods
  const filteredFoods = COMMON_FOODS.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Meal type grouping
  const mealTypes = [
    { key: 'breakfast', label: 'Breakfast', icon: UtensilsCrossed },
    { key: 'lunch', label: 'Lunch', icon: Salad },
    { key: 'dinner', label: 'Dinner', icon: Moon },
    { key: 'snack', label: 'Snacks', icon: Cookie },
  ];

  const getEntriesForMeal = (mealType) => entries.filter(e => e.meal_type === mealType);
  const getEntriesForOther = () => entries.filter(e => !mealTypes.some(m => m.key === e.meal_type));

  // Date navigation
  const prevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };
  const nextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };
  const goToday = () => setSelectedDate(new Date().toISOString().split('T')[0]);

  return (
    <div className="fitness-container">
      <h2 className="section-title">The Royal Feast</h2>
      <div className="section-divider">
        <div className="div-line"></div>
        <div className="div-ornament"></div>
        <div className="div-line right"></div>
      </div>

      {/* Date Selector */}
      <div className="date-selector smooth-in">
        <button className="date-nav" onClick={prevDay}><ChevronLeft size={18} /></button>
        <button className="date-display" onClick={goToday}>
          {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </button>
        <button className="date-nav" onClick={nextDay}><ChevronRight size={18} /></button>
      </div>

      {/* Hero Section: Circular Gauge + Macros */}
      <div className="feast-hero smooth-in smooth-in-delay-1" key={animKey}>
        <div className="calorie-gauge">
          <svg viewBox="0 0 180 180" className="gauge-svg">
            {/* Background track */}
            <circle cx="90" cy="90" r={circleRadius} fill="none"
              stroke="rgba(92, 64, 32, 0.2)" strokeWidth="12" />
            {/* Progress arc */}
            <circle cx="90" cy="90" r={circleRadius} fill="none"
              stroke="url(#calorieGradient)" strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circleCircumference}
              strokeDashoffset={circleOffset}
              transform="rotate(-90 90 90)"
              className="gauge-progress" />
            <defs>
              <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8a2218" />
                <stop offset="50%" stopColor="#c9a84c" />
                <stop offset="100%" stopColor="#a07830" />
              </linearGradient>
            </defs>
          </svg>
          <div className="gauge-center">
            <span className="gauge-consumed">{Math.round(totals.calories)}</span>
            <span className="gauge-separator">of {dailyCalories}</span>
            <span className="gauge-label">calories</span>
          </div>
          {overBy > 0 && <div className="gauge-warning">+{overBy} over</div>}
        </div>

        <div className="macro-sidebar">
          <div className="macro-ring-card">
            <div className="macro-ring-header">
              <Beef size={14} className="macro-icon protein" />
              <span>Protein</span>
            </div>
            <div className="macro-ring-track">
              <div className="macro-ring-fill protein-fill" style={{ width: `${proteinPct}%` }} />
            </div>
            <div className="macro-ring-text">{Math.round(totals.protein)}g / {dailyProtein}g</div>
          </div>

          <div className="macro-ring-card">
            <div className="macro-ring-header">
              <Wheat size={14} className="macro-icon carbs" />
              <span>Carbs</span>
            </div>
            <div className="macro-ring-track">
              <div className="macro-ring-fill carbs-fill" style={{ width: `${carbsPct}%` }} />
            </div>
            <div className="macro-ring-text">{Math.round(totals.carbs)}g / {dailyCarbs}g</div>
          </div>

          <div className="macro-ring-card stat-card">
            <div className="macro-ring-header">
              <Flame size={14} className="macro-icon remaining" />
              <span>Remaining</span>
            </div>
            <div className="stat-value">{remaining}</div>
            <div className="stat-unit">calories</div>
          </div>

          <div className="macro-ring-card stat-card">
            <div className="macro-ring-header">
              <Target size={14} className="macro-icon goal" />
              <span>Entries</span>
            </div>
            <div className="stat-value">{entries.length}</div>
            <div className="stat-unit">items logged</div>
          </div>
        </div>
      </div>

      {/* Goal Form */}
      {showGoalForm && (
        <form className="goal-form smooth-in" onSubmit={saveGoal}>
          <h4>Set Daily Goal</h4>
          <div className="goal-inputs">
            <div className="goal-input-group">
              <label>Calories</label>
              <input type="number" value={goalForm.daily_calories} onChange={e => setGoalForm({...goalForm, daily_calories: parseFloat(e.target.value) || 0})} />
            </div>
            <div className="goal-input-group">
              <label>Protein (g)</label>
              <input type="number" value={goalForm.daily_protein} onChange={e => setGoalForm({...goalForm, daily_protein: parseFloat(e.target.value) || 0})} />
            </div>
            <div className="goal-input-group">
              <label>Carbs (g)</label>
              <input type="number" value={goalForm.daily_carbs} onChange={e => setGoalForm({...goalForm, daily_carbs: parseFloat(e.target.value) || 0})} />
            </div>
          </div>
          <button type="submit" className="save-goal-btn">Save Goal</button>
        </form>
      )}

      {/* Action Buttons */}
      <div className="action-row smooth-in smooth-in-delay-2">
        <button className="action-btn primary" onClick={() => { setShowAddForm(!showAddForm); setShowQuickAdd(false); }}>
          <Plus size={16} /> Custom Food
        </button>
        <button className="action-btn secondary" onClick={() => { setShowQuickAdd(!showQuickAdd); setShowAddForm(false); }}>
          <Plus size={16} /> Quick Add
        </button>
        <button className="action-btn tertiary" onClick={() => setShowGoalForm(!showGoalForm)}>
          <Target size={16} /> Goal
        </button>
      </div>

      {/* Quick Add Search */}
      {showQuickAdd && (
        <div className="quick-add-panel smooth-in">
          <div className="quick-add-header">
            <span>Quick Add from Pantry</span>
            <button className="close-panel-btn" onClick={() => setShowQuickAdd(false)}>x</button>
          </div>
          <input
            type="text"
            placeholder="Search the pantry..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input"
            autoFocus
          />
          <div className="food-grid">
            {filteredFoods.map((food, idx) => (
              <div key={idx} className="food-card" onClick={() => addQuickFood(food)}>
                <div className="food-card-name">{food.name}</div>
                <div className="food-card-macros">
                  <span className="food-cal">{food.calories} cal</span>
                  <span className="food-protein">{food.protein}g P</span>
                  <span className="food-carbs">{food.carbs}g C</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Food Form */}
      {showAddForm && (
        <form className="add-entry-form smooth-in" onSubmit={addEntry}>
          <div className="form-header">
            <span>Log a Meal</span>
            <button type="button" className="close-panel-btn" onClick={() => setShowAddForm(false)}>x</button>
          </div>
          <input type="text" placeholder="What did you eat?" value={newEntry.name} onChange={e => setNewEntry({...newEntry, name: e.target.value})} required />
          <div className="entry-row">
            <input type="number" placeholder="Calories" value={newEntry.calories} onChange={e => setNewEntry({...newEntry, calories: e.target.value})} required min="0" />
            <input type="number" placeholder="Protein (g)" value={newEntry.protein} onChange={e => setNewEntry({...newEntry, protein: e.target.value})} min="0" />
            <input type="number" placeholder="Carbs (g)" value={newEntry.carbs} onChange={e => setNewEntry({...newEntry, carbs: e.target.value})} min="0" />
          </div>
          <div className="meal-type-row">
            {mealTypes.map(mt => {
              const Icon = mt.icon;
              return (
                <button
                  key={mt.key}
                  type="button"
                  className={`meal-type-btn ${newEntry.meal_type === mt.key ? 'active' : ''}`}
                  onClick={() => setNewEntry({...newEntry, meal_type: mt.key})}
                >
                  <Icon size={12} /> {mt.label}
                </button>
              );
            })}
          </div>
          <button type="submit" className="submit-btn">Add to Feast</button>
        </form>
      )}

      {/* Meal Sections */}
      <div className="meal-sections smooth-in smooth-in-delay-3">
        {mealTypes.map(mt => {
          const mealEntries = getEntriesForMeal(mt.key);
          const mealCalories = mealEntries.reduce((a, e) => a + e.calories, 0);
          const mealProtein = mealEntries.reduce((a, e) => a + e.protein, 0);
          if (mealEntries.length === 0) return null;
          const Icon = mt.icon;
          return (
            <div key={mt.key} className="meal-section">
              <div className="meal-header">
                <div className="meal-header-left">
                  <Icon size={14} />
                  <h4>{mt.label}</h4>
                </div>
                <div className="meal-header-right">
                  <span className="meal-stat">{Math.round(mealCalories)} cal</span>
                  <span className="meal-stat-sep">|</span>
                  <span className="meal-stat">{Math.round(mealProtein)}g P</span>
                </div>
              </div>
              {mealEntries.map(entry => (
                <div key={entry.id} className="entry-item">
                  <div className="entry-info">
                    <span className="entry-name">{entry.name}</span>
                    <div className="entry-macro-row">
                      <span className="macro-pill cal-pill">{entry.calories} cal</span>
                      <span className="macro-pill protein-pill">{entry.protein}g P</span>
                      <span className="macro-pill carbs-pill">{entry.carbs}g C</span>
                    </div>
                  </div>
                  <button className="entry-delete" onClick={() => deleteEntry(entry.id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          );
        })}
        {getEntriesForOther().length > 0 && (
          <div className="meal-section">
            <div className="meal-header">
              <div className="meal-header-left">
                <UtensilsCrossed size={14} />
                <h4>Other</h4>
              </div>
            </div>
            {getEntriesForOther().map(entry => (
              <div key={entry.id} className="entry-item">
                <div className="entry-info">
                  <span className="entry-name">{entry.name}</span>
                  <div className="entry-macro-row">
                    <span className="macro-pill cal-pill">{entry.calories} cal</span>
                    <span className="macro-pill protein-pill">{entry.protein}g P</span>
                    <span className="macro-pill carbs-pill">{entry.carbs}g C</span>
                  </div>
                </div>
                <button className="entry-delete" onClick={() => deleteEntry(entry.id)}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
        {entries.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">No entries yet</div>
            <p>Break your fast, Your Grace.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FitnessTracker;
