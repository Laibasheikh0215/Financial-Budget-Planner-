import React from 'react';

function ExpenseChart({ expensesByCategory }) {
  const categories = [
    { name: 'Food', value: expensesByCategory.food || 0, color: '#FF5722' },
    { name: 'Rent', value: expensesByCategory.rent || 0, color: '#4CAF50' },
    { name: 'Transport', value: expensesByCategory.transport || 0, color: '#2196F3' },
    { name: 'Shopping', value: expensesByCategory.shopping || 0, color: '#FF9800' },
    { name: 'Entertainment', value: expensesByCategory.entertainment || 0, color: '#9C27B0' },
    { name: 'Other', value: expensesByCategory.other || 0, color: '#795548' }
  ];

  const data = categories.filter(item => item.value > 0);
  const totalExpenses = data.reduce((sum, item) => sum + item.value, 0);

  if (totalExpenses === 0) {
    return (
      <div className="chart-container">
        <h3>Expense Distribution</h3>
        <div className="no-data-chart">
          <p>No expense data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3>Expense Distribution</h3>
      <div className="chart-bars">
        {data.map((category, index) => {
          const percentage = (category.value / totalExpenses) * 100;
          return (
            <div key={index} className="chart-bar-item">
              <div className="bar-label">
                <span 
                  className="category-dot" 
                  style={{ backgroundColor: category.color }}
                ></span>
                <span className="category-name">{category.name}</span>
                <span className="category-percentage">{percentage.toFixed(1)}%</span>
              </div>
              <div className="bar-container">
                <div 
                  className="bar-fill" 
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: category.color
                  }}
                ></div>
              </div>
              <div className="bar-amount">${category.value.toFixed(2)}</div>
            </div>
          );
        })}
      </div>
      
      <div className="chart-summary">
        <div className="summary-item">
          <span>Total Expenses</span>
          <strong>${totalExpenses.toFixed(2)}</strong>
        </div>
      </div>
    </div>
  );
}

export default ExpenseChart;