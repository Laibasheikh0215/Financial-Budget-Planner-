import React from 'react';

function TransactionList({ transactions, onEdit, onDelete }) {
  const categories = {
    food: { label: 'Food', color: '#FF6B6B' },
    rent: { label: 'Rent', color: '#4CAF50' },
    transport: { label: 'Transport', color: '#2196F3' },
    shopping: { label: 'Shopping', color: '#FF9800' },
    entertainment: { label: 'Entertainment', color: '#9C27B0' },
    other: { label: 'Other', color: '#795548' }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="transactions-section">
      <h2>TRANSACTIONS</h2>
      
      <div className="transactions-table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Category</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-transactions">
                  No transactions yet. Add your first transaction above.
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.description}</td>
                  <td>
                    <span 
                      className="category-badge"
                      style={{ 
                        backgroundColor: categories[transaction.category]?.color + '20',
                        color: categories[transaction.category]?.color,
                        border: `1px solid ${categories[transaction.category]?.color}`
                      }}
                    >
                      {categories[transaction.category]?.label}
                    </span>
                  </td>
                  <td>{formatDate(transaction.created_at)}</td>
                  <td style={{ 
                    color: transaction.type === 'income' ? '#4CAF50' : '#FF5722',
                    fontWeight: '600'
                  }}>
                    {transaction.type === 'income' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                  </td>
                  <td>
                    <div className="actions">
                      <button 
                        onClick={() => onEdit(transaction)}
                        className="edit-button"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => onDelete(transaction.id)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransactionList;