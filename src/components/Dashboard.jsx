import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../App';

function Dashboard({ session }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: 'food'
  });
  const [editingId, setEditingId] = useState(null);

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchTransactions();
    }
  }, [session]);

  // Handle form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    try {
      const transactionToSave = {
        ...formData,
        amount: parseFloat(formData.amount),
        user_id: session.user.id
      };

      if (editingId) {
        await supabase.from('transactions').update(transactionToSave).eq('id', editingId);
        setEditingId(null);
      } else {
        await supabase.from('transactions').insert([transactionToSave]);
      }

      setFormData({ description: '', amount: '', type: 'expense', category: 'food' });
      fetchTransactions();
    } catch (error) {
      alert('Error saving transaction');
    }
  };

  // Delete transaction
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await supabase.from('transactions').delete().eq('id', id);
      fetchTransactions();
      if (editingId === id) setEditingId(null);
    } catch (error) {
      alert('Error deleting');
    }
  };

  // Edit transaction
  const handleEdit = (transaction) => {
    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category
    });
    setEditingId(transaction.id);
  };

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Calculate totals
  const calculateTotals = () => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const balance = income - expenses;
    const savingsPercentage = income > 0 ? ((balance / income) * 100).toFixed(0) : 0;

    return {
      income: income.toFixed(2),
      expenses: expenses.toFixed(2),
      balance: balance.toFixed(2),
      savingsPercentage
    };
  };

  const totals = calculateTotals();

  // Data for Donut Chart (Income vs Expense)
  const getPieChartData = () => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    return [
      { name: 'Income', value: parseFloat(income.toFixed(2)), color: '#4CAF50' },
      { name: 'Expenses', value: parseFloat(expenses.toFixed(2)), color: '#FF5722' }
    ];
  };

  // Data for Bar Graph (Category-wise Expenses)
  const getCategoryExpenseData = () => {
    const categoryData = {};
    
    // Filter only expenses
    const expenses = transactions.filter(t => t.type === 'expense');
    
    expenses.forEach(transaction => {
      const category = transaction.category;
      if (!categoryData[category]) {
        categoryData[category] = 0;
      }
      categoryData[category] += parseFloat(transaction.amount);
    });

    // Convert to array and sort by amount
    return Object.entries(categoryData)
      .map(([category, amount]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        amount: parseFloat(amount.toFixed(2)),
        color: '#FF5722'
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  const pieData = getPieChartData();
  const barData = getCategoryExpenseData();
  const totalIncome = pieData.find(d => d.name === 'Income')?.value || 0;
  const totalExpenses = pieData.find(d => d.name === 'Expenses')?.value || 0;
  const savingsPercentage = totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(0) : 0;

  if (loading && transactions.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e0e0e0',
            borderTopColor: '#4CAF50',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Loading your data...</p>
        </div>
      </div>
    );
  }

  // Category colors function
  const getCategoryColor = (category, type) => {
    if (type === 'income') {
      return '#4CAF50';
    }
    return '#FF5722';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header - Mobile Responsive */}
      <header style={{
        background: 'white',
        padding: '15px 20px',
        display: 'flex',
        flexDirection: window.innerWidth < 768 ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: window.innerWidth < 768 ? 'flex-start' : 'center',
        gap: window.innerWidth < 768 ? '15px' : '0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{ 
            color: '#4CAF50', 
            marginBottom: '5px',
            fontSize: window.innerWidth < 768 ? '20px' : '24px'
          }}>
            BUDGET BLOOM
          </h1>
          <p style={{ 
            color: '#666', 
            fontSize: window.innerWidth < 768 ? '12px' : '14px' 
          }}>
            Financial Dashboard
          </p>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '15px',
          flexDirection: window.innerWidth < 768 ? 'column' : 'row',
          width: window.innerWidth < 768 ? '100%' : 'auto'
        }}>
          <div style={{
            background: '#f8f9fa',
            padding: '8px 12px',
            borderRadius: '6px',
            width: window.innerWidth < 768 ? '100%' : 'auto',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontWeight: '500', 
              fontSize: window.innerWidth < 768 ? '12px' : '14px',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {session.user.email}
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            style={{
              background: '#2196F3',
              color: 'white',
              border: 'none',
              padding: window.innerWidth < 768 ? '10px 15px' : '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              width: window.innerWidth < 768 ? '100%' : 'auto',
              fontSize: window.innerWidth < 768 ? '14px' : 'inherit'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <div style={{ 
        padding: window.innerWidth < 768 ? '15px' : '30px', 
        maxWidth: '1400px', 
        margin: '0 auto' 
      }}>
        {/* Stats Row - Mobile Responsive */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 
                              window.innerWidth < 1024 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: '15px',
          marginBottom: '25px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '10px',
            padding: window.innerWidth < 768 ? '15px' : '20px',
            borderLeft: '5px solid #4CAF50'
          }}>
            <div style={{ 
              fontSize: window.innerWidth < 768 ? '12px' : '14px', 
              color: '#666', 
              marginBottom: '8px' 
            }}>
              TOTAL BALANCE
            </div>
            <div style={{ 
              fontSize: window.innerWidth < 768 ? '24px' : '28px', 
              fontWeight: '700', 
              color: '#4CAF50' 
            }}>
              ${totals.balance}
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '10px',
            padding: window.innerWidth < 768 ? '15px' : '20px',
            borderLeft: '5px solid #4CAF50'
          }}>
            <div style={{ 
              fontSize: window.innerWidth < 768 ? '12px' : '14px', 
              color: '#666', 
              marginBottom: '8px' 
            }}>
              INCOME
            </div>
            <div style={{ 
              fontSize: window.innerWidth < 768 ? '24px' : '28px', 
              fontWeight: '700', 
              color: '#4CAF50' 
            }}>
              ${totals.income}
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '10px',
            padding: window.innerWidth < 768 ? '15px' : '20px',
            borderLeft: '5px solid #FF5722'
          }}>
            <div style={{ 
              fontSize: window.innerWidth < 768 ? '12px' : '14px', 
              color: '#666', 
              marginBottom: '8px' 
            }}>
              EXPENSES
            </div>
            <div style={{ 
              fontSize: window.innerWidth < 768 ? '24px' : '28px', 
              fontWeight: '700', 
              color: '#FF5722' 
            }}>
              ${totals.expenses}
            </div>
          </div>
        </div>

        {/* Add New and Monthly Summary - Mobile Responsive */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1fr 2fr',
          gap: '20px',
          marginBottom: '25px'
        }}>
          {/* Left Column - Add New Form */}
          <div style={{
            background: 'white',
            borderRadius: '10px',
            padding: window.innerWidth < 768 ? '15px' : '20px',
            height: 'fit-content'
          }}>
            <h2 style={{ 
              marginBottom: '20px',
              fontSize: window.innerWidth < 768 ? '18px' : '20px'
            }}>
              ADD NEW TRANSACTION
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '500',
                  fontSize: window.innerWidth < 768 ? '14px' : 'inherit'
                }}>
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                  required
                  style={{
                    width: '100%',
                    padding: window.innerWidth < 768 ? '10px 12px' : '12px 15px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: window.innerWidth < 768 ? '14px' : 'inherit'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '500',
                  fontSize: window.innerWidth < 768 ? '14px' : 'inherit'
                }}>
                  Amount ($)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                  style={{
                    width: '100%',
                    padding: window.innerWidth < 768 ? '10px 12px' : '12px 15px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: window.innerWidth < 768 ? '14px' : 'inherit'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '500',
                  fontSize: window.innerWidth < 768 ? '14px' : 'inherit'
                }}>
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: window.innerWidth < 768 ? '10px 12px' : '12px 15px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: window.innerWidth < 768 ? '14px' : 'inherit'
                  }}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '500',
                  fontSize: window.innerWidth < 768 ? '14px' : 'inherit'
                }}>
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: window.innerWidth < 768 ? '10px 12px' : '12px 15px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: window.innerWidth < 768 ? '14px' : 'inherit'
                  }}
                >
                  <option value="food">Food</option>
                  <option value="rent">Rent</option>
                  <option value="transport">Transport</option>
                  <option value="shopping">Shopping</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="salary">Salary</option>
                  <option value="investment funds">Investment Funds</option>
                  <option value="stocks">Stocks</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                marginTop: '20px',
                flexDirection: window.innerWidth < 480 ? 'column' : 'row'
              }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: window.innerWidth < 768 ? '12px' : '14px',
                    background: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: window.innerWidth < 768 ? '14px' : '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    minWidth: window.innerWidth < 480 ? '100%' : 'auto'
                  }}
                >
                  {editingId ? 'UPDATE' : 'SAVE'}
                </button>
                
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({
                        description: '',
                        amount: '',
                        type: 'expense',
                        category: 'food'
                      });
                    }}
                    style={{
                      flex: 1,
                      padding: window.innerWidth < 768 ? '12px' : '14px',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: window.innerWidth < 768 ? '14px' : '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      minWidth: window.innerWidth < 480 ? '100%' : 'auto'
                    }}
                  >
                    CANCEL
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right Column - Monthly Summary Charts */}
          <div style={{
            background: 'white',
            borderRadius: '10px',
            padding: window.innerWidth < 768 ? '15px' : '20px'
          }}>
            <h2 style={{ 
              marginBottom: '20px',
              fontSize: window.innerWidth < 768 ? '18px' : '20px'
            }}>
              MONTHLY SUMMARY
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
              gap: '20px'
            }}>
              {/* Donut Chart - Income vs Expense with Savings % in center */}
              <div>
                <h3 style={{ 
                  marginBottom: '12px', 
                  fontSize: window.innerWidth < 768 ? '14px' : '16px', 
                  textAlign: 'center' 
                }}>
                  Income vs Expenses
                </h3>
                {totalIncome > 0 || totalExpenses > 0 ? (
                  <div style={{ 
                    height: window.innerWidth < 768 ? '200px' : '250px', 
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                      zIndex: 10
                    }}>
                      <div style={{
                        fontSize: window.innerWidth < 768 ? '22px' : '28px',
                        fontWeight: '800',
                        color: '#4CAF50',
                        lineHeight: '1.2'
                      }}>
                        {savingsPercentage}%
                      </div>
                      <div style={{
                        fontSize: window.innerWidth < 768 ? '12px' : '14px',
                        color: '#666',
                        marginTop: '4px'
                      }}>
                        Savings
                      </div>
                    </div>
                    
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData.filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={false}
                          outerRadius={window.innerWidth < 768 ? 70 : 80}
                          innerRadius={window.innerWidth < 768 ? 50 : 60}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.filter(d => d.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`$${value}`, 'Amount']}
                          labelFormatter={(name) => `${name}`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={{
                    height: window.innerWidth < 768 ? '200px' : '250px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    color: '#999',
                    fontSize: window.innerWidth < 768 ? '14px' : 'inherit'
                  }}>
                    <p>No financial data</p>
                  </div>
                )}
              </div>

              {/* Bar Chart - Category-wise Expenses */}
              <div>
                <h3 style={{ 
                  marginBottom: '12px', 
                  fontSize: window.innerWidth < 768 ? '14px' : '16px', 
                  textAlign: 'center' 
                }}>
                  Category Expenses
                </h3>
                {barData.length > 0 ? (
                  <div style={{ 
                    height: window.innerWidth < 768 ? '200px' : '250px' 
                  }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="category" 
                          angle={window.innerWidth < 768 ? -45 : 0}
                          textAnchor={window.innerWidth < 768 ? "end" : "middle"}
                          height={window.innerWidth < 768 ? 60 : 40}
                          fontSize={window.innerWidth < 768 ? 10 : 12}
                        />
                        <YAxis fontSize={window.innerWidth < 768 ? 10 : 12} />
                        <Tooltip 
                          formatter={(value) => [`$${value}`, 'Amount']}
                          labelFormatter={(category) => `Category: ${category}`}
                        />
                        <Bar 
                          dataKey="amount" 
                          fill="#FF5722"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={{
                    height: window.innerWidth < 768 ? '200px' : '250px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    color: '#999',
                    fontSize: window.innerWidth < 768 ? '14px' : 'inherit'
                  }}>
                    <p>No expense data</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Full Width Transactions Table - Mobile Responsive */}
        <div style={{
          background: 'white',
          borderRadius: '10px',
          padding: window.innerWidth < 768 ? '15px' : '20px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: window.innerWidth < 768 ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: window.innerWidth < 768 ? 'flex-start' : 'center',
            marginBottom: '20px',
            gap: window.innerWidth < 768 ? '10px' : '0'
          }}>
            <h2 style={{ 
              margin: 0,
              fontSize: window.innerWidth < 768 ? '18px' : '20px'
            }}>
              TRANSACTIONS HISTORY
            </h2>
            <div style={{
              fontSize: window.innerWidth < 768 ? '12px' : '14px',
              color: '#666',
              background: '#f8f9fa',
              padding: '6px 12px',
              borderRadius: '20px'
            }}>
              Total: {transactions.length} transactions
            </div>
          </div>
          
          <div style={{ 
            overflowX: 'auto',
            maxHeight: window.innerWidth < 768 ? '300px' : '400px',
            overflowY: 'auto'
          }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              minWidth: window.innerWidth < 768 ? '600px' : '800px'
            }}>
              <thead>
                <tr>
                  <th style={{
                    textAlign: 'left',
                    padding: window.innerWidth < 768 ? '10px' : '15px',
                    background: '#f8f9fa',
                    color: '#666',
                    fontWeight: '600',
                    fontSize: window.innerWidth < 768 ? '12px' : '14px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                  }}>Description</th>
                  <th style={{
                    textAlign: 'left',
                    padding: window.innerWidth < 768 ? '10px' : '15px',
                    background: '#f8f9fa',
                    color: '#666',
                    fontWeight: '600',
                    fontSize: window.innerWidth < 768 ? '12px' : '14px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                  }}>Category</th>
                  <th style={{
                    textAlign: 'left',
                    padding: window.innerWidth < 768 ? '10px' : '15px',
                    background: '#f8f9fa',
                    color: '#666',
                    fontWeight: '600',
                    fontSize: window.innerWidth < 768 ? '12px' : '14px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                  }}>Date</th>
                  <th style={{
                    textAlign: 'left',
                    padding: window.innerWidth < 768 ? '10px' : '15px',
                    background: '#f8f9fa',
                    color: '#666',
                    fontWeight: '600',
                    fontSize: window.innerWidth < 768 ? '12px' : '14px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                  }}>Amount</th>
                  <th style={{
                    textAlign: 'left',
                    padding: window.innerWidth < 768 ? '10px' : '15px',
                    background: '#f8f9fa',
                    color: '#666',
                    fontWeight: '600',
                    fontSize: window.innerWidth < 768 ? '12px' : '14px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                  }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{
                      textAlign: 'center',
                      padding: window.innerWidth < 768 ? '40px' : '60px',
                      color: '#999',
                      fontStyle: 'italic',
                      fontSize: window.innerWidth < 768 ? '14px' : 'inherit'
                    }}>
                      No transactions yet. Add your first transaction above.
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => {
                    const date = new Date(transaction.created_at);
                    const formattedDate = date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });

                    const categoryColor = getCategoryColor(transaction.category, transaction.type);

                    return (
                      <tr key={transaction.id} style={{
                        borderBottom: '1px solid #dee2e6'
                      }}>
                        <td style={{ 
                          padding: window.innerWidth < 768 ? '10px' : '15px',
                          fontSize: window.innerWidth < 768 ? '13px' : 'inherit',
                          maxWidth: window.innerWidth < 768 ? '150px' : 'none',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {transaction.description}
                        </td>
                        <td style={{ 
                          padding: window.innerWidth < 768 ? '10px' : '15px' 
                        }}>
                          <span style={{
                            padding: window.innerWidth < 768 ? '4px 8px' : '5px 12px',
                            borderRadius: '20px',
                            fontSize: window.innerWidth < 768 ? '10px' : '12px',
                            fontWeight: '600',
                            background: `${categoryColor}20`,
                            color: categoryColor,
                            border: `1px solid ${categoryColor}`,
                            display: 'inline-block',
                            minWidth: window.innerWidth < 768 ? '80px' : '100px',
                            textAlign: 'center'
                          }}>
                            {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                          </span>
                        </td>
                        <td style={{ 
                          padding: window.innerWidth < 768 ? '10px' : '15px',
                          fontSize: window.innerWidth < 768 ? '12px' : 'inherit'
                        }}>
                          {formattedDate}
                        </td>
                        <td style={{
                          padding: window.innerWidth < 768 ? '10px' : '15px',
                          color: transaction.type === 'income' ? '#4CAF50' : '#FF5722',
                          fontWeight: '600',
                          fontSize: window.innerWidth < 768 ? '14px' : '16px'
                        }}>
                          {transaction.type === 'income' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                        </td>
                        <td style={{ 
                          padding: window.innerWidth < 768 ? '10px' : '15px' 
                        }}>
                          <div style={{ 
                            display: 'flex', 
                            gap: window.innerWidth < 768 ? '5px' : '8px',
                            flexDirection: window.innerWidth < 480 ? 'column' : 'row'
                          }}>
                            <button
                              onClick={() => handleEdit(transaction)}
                              style={{
                                padding: window.innerWidth < 768 ? '6px 10px' : '8px 12px',
                                background: '#2196F3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: window.innerWidth < 768 ? '11px' : '13px',
                                fontWeight: '500',
                                minWidth: window.innerWidth < 480 ? '100%' : 'auto'
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(transaction.id)}
                              style={{
                                padding: window.innerWidth < 768 ? '6px 10px' : '8px 12px',
                                background: '#2196F3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: window.innerWidth < 768 ? '11px' : '13px',
                                fontWeight: '500',
                                minWidth: window.innerWidth < 480 ? '100%' : 'auto'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        table thead th {
          position: sticky;
          top: 0;
          background: #f8f9fa;
        }
        
        /* Responsive Media Queries */
        @media (max-width: 1024px) {
          .mobile-column {
            flex-direction: column;
          }
        }
        
        @media (max-width: 768px) {
          .mobile-stack {
            flex-direction: column;
          }
        }
        
        @media (max-width: 480px) {
          .mobile-full-width {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;