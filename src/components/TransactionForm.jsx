import React, { useState } from 'react';

function TransactionForm({ onSubmit, editingTransaction, onCancel }) {
  const [formData, setFormData] = useState({
    description: editingTransaction?.description || '',
    amount: editingTransaction?.amount || '',
    type: editingTransaction?.type || 'expense',
    category: editingTransaction?.category || 'food'
  });

  const categories = [
    { value: 'food', label: 'Food' },
    { value: 'rent', label: 'Rent' },
    { value: 'transport', label: 'Transport' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount) {
      alert('Please fill all fields');
      return;
    }
    
    if (parseFloat(formData.amount) <= 0) {
      alert('Amount must be greater than 0');
      return;
    }
    
    onSubmit(formData);
    if (!editingTransaction) {
      setFormData({
        description: '',
        amount: '',
        type: 'expense',
        category: 'food'
      });
    }
  };

  return (
    <div className="add-new-card">
      <h2>ADD NEW</h2>
      
      <form onSubmit={handleSubmit} className="transaction-form">
        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter description"
            required
          />
        </div>

        <div className="form-group">
          <label>Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label>Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="form-select"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="form-select"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-button">
            {editingTransaction ? 'UPDATE' : 'SAVE'}
          </button>
          
          {editingTransaction && (
            <button 
              type="button" 
              className="cancel-button"
              onClick={onCancel}
            >
              CANCEL
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default TransactionForm;