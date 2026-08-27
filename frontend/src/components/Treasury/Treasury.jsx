import React, { useState, useEffect } from 'react';
import { Coins, Plus, Trash2, ArrowUpCircle, ArrowDownCircle, Repeat } from 'lucide-react';
import api from '../../api';
import './Treasury.scss';

const Treasury = () => {
  const [transactions, setTransactions] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense'); // 'income' or 'expense'
  const [isRecurring, setIsRecurring] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/treasury');
      const loadedTransactions = response.data;
      setTransactions(loadedTransactions);
      
      // Auto-pay logic
      const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-08"
      const lastAutoPayMonth = localStorage.getItem('lastAutoPayMonth');
      
      if (lastAutoPayMonth && lastAutoPayMonth !== currentMonth) {
        // A new month has started! Apply all recurring items.
        const recurringItems = loadedTransactions.filter(t => t.is_recurring);
        if (recurringItems.length > 0) {
          const newItems = [];
          for (const item of recurringItems) {
            const newItem = {
              id: Date.now().toString() + Math.random(),
              title: `${item.title} (Auto-Pay)`,
              amount: item.amount,
              type: item.type,
              is_recurring: true // Keep them recurring for the future
            };
            await api.post('/treasury', newItem);
            newItems.push(newItem);
          }
          setTransactions([...loadedTransactions, ...newItems]);
        }
      }
      // Initialize or update the tracker
      localStorage.setItem('lastAutoPayMonth', currentMonth);
      
    } catch (error) {
      console.error('Error fetching treasury:', error);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;
    
    const newTransaction = {
      id: Date.now().toString(),
      title: title.trim(),
      amount: parseFloat(amount),
      type: type,
      is_recurring: isRecurring
    };
    
    try {
      await api.post('/treasury', newTransaction);
      setTransactions([...transactions, newTransaction]);
      setTitle('');
      setAmount('');
      setIsRecurring(false);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/treasury/${id}`);
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const balance = transactions.reduce((acc, curr) => {
    return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
  }, 0);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="treasury-container">
      <div className="ledger-book">
        
        {/* Left Page: Summary & Input */}
        <div className="ledger-page left-page">
          <div className="vault-summary">
            <h3>The Royal Vault</h3>
            <div className="balance-display">
              <Coins size={32} className={balance >= 0 ? 'gold' : 'silver'} />
              <span className={`balance-amount ${balance < 0 ? 'negative' : ''}`}>
                {balance >= 0 ? '' : '-'}{Math.abs(balance).toLocaleString()} Dragons
              </span>
            </div>
            
            <div className="stats-row">
              <div className="stat-box income">
                <ArrowUpCircle size={20} />
                <div className="stat-info">
                  <span className="stat-label">Income</span>
                  <span className="stat-value">{totalIncome.toLocaleString()}</span>
                </div>
              </div>
              <div className="stat-box expense">
                <ArrowDownCircle size={20} />
                <div className="stat-info">
                  <span className="stat-label">Expenses</span>
                  <span className="stat-value">{totalExpense.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="transaction-form-wrapper">
            <h4>Record a Transaction</h4>
            <form onSubmit={handleAddTransaction} className="transaction-form">
              <div className="form-group type-selector">
                <button 
                  type="button" 
                  className={`type-btn income ${type === 'income' ? 'active' : ''}`}
                  onClick={() => setType('income')}
                >
                  <ArrowUpCircle size={16} /> Income
                </button>
                <button 
                  type="button" 
                  className={`type-btn expense ${type === 'expense' ? 'active' : ''}`}
                  onClick={() => setType('expense')}
                >
                  <ArrowDownCircle size={16} /> Expense
                </button>
              </div>
              
              <div className="form-group">
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Taxes from Dorne, Iron Swords" 
                  className="treasury-input"
                  required
                />
              </div>
              
              <div className="form-group amount-group">
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0" 
                  min="0"
                  step="0.01"
                  className="treasury-input amount-input"
                  required
                />
                <span className="currency-label">Dragons</span>
              </div>
              
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                  />
                  <span><Repeat size={14} /> Auto-Pay (Monthly)</span>
                </label>
              </div>
              
              <button type="submit" className="add-btn">
                <Plus size={20} /> Record
              </button>
            </form>
          </div>
        </div>

        {/* Right Page: Transaction List */}
        <div className="ledger-page right-page">
          <h3>The Great Ledger</h3>
          
          <div className="transaction-list">
            {transactions.length === 0 ? (
              <div className="empty-ledger">The ledger is blank. No dragons have moved.</div>
            ) : (
              transactions.map(t => (
                <div key={t.id} className={`transaction-item ${t.type}`}>
                  <div className="t-icon">
                    {t.type === 'income' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                  </div>
                  <div className="t-details">
                    <span className="t-title">
                      {t.title} 
                      {t.is_recurring && <span className="recurring-badge" title="Auto-Pays Monthly"><Repeat size={12}/></span>}
                    </span>
                  </div>
                  <div className="t-amount">
                    {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()} 
                    <Coins size={14} className={t.type === 'income' ? 'gold' : 'silver'} />
                  </div>
                  <button className="delete-btn" onClick={() => handleDelete(t.id)} title="Strike from record">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {transactions.length > 0 && (
            <div className="ledger-footer">
              <span className="footer-label">Total Dragons:</span>
              <span className={`footer-amount ${balance < 0 ? 'negative' : ''}`}>
                {balance >= 0 ? '' : '-'}{Math.abs(balance).toLocaleString()} <Coins size={18} className={balance >= 0 ? 'gold' : 'silver'} />
              </span>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default Treasury;
