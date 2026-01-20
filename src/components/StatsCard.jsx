import React from 'react';

function StatsCard({ title, amount, type }) {
  const getTypeStyles = () => {
    switch(type) {
      case 'balance':
        return { color: '#4CAF50', borderColor: '#4CAF50' };
      case 'income':
        return { color: '#2196F3', borderColor: '#2196F3' };
      case 'expense':
        return { color: '#FF5722', borderColor: '#FF5722' };
      default:
        return { color: '#666', borderColor: '#666' };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="stats-card" style={{ borderLeft: `5px solid ${styles.borderColor}` }}>
      <div className="stats-title">{title}</div>
      <div className="stats-amount" style={{ color: styles.color }}>
        ${amount}
      </div>
    </div>
  );
}

export default StatsCard;