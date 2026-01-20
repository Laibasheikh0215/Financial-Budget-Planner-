import React from 'react';

function Header({ user, onLogout }) {
  return (
    <header className="header">
      <div className="header-left">
        <h1>BUDGET BLOOM</h1>
        <p>Financial Dashboard</p>
      </div>
      
      <div className="header-right">
        <div className="user-info">
          <div className="user-email">
            {user?.email || 'User'}
          </div>
        </div>
        
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;