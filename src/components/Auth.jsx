import React, { useState } from 'react';
import { supabase } from '../App';

function Auth({ setSession }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Auth attempt:', { email, isLogin });

    try {
      if (isLogin) {
        // Login
        console.log('Attempting login...');
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        console.log('Login response:', data, error);
        if (error) throw error;
        setSession(data.session);
      } else {
        // Register
        console.log('Attempting registration...');
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        console.log('Registration response:', data, error);
        if (error) throw error;
        
        if (data.user) {
          alert('✅ Registration successful! You can now login.');
          setIsLogin(true);
          setEmail('');
          setPassword('');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '10px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#4CAF50', marginBottom: '10px' }}>BUDGET BLOOM</h1>
          <p style={{ color: '#666' }}>Track your finances, grow your savings</p>
        </div>

        {error && (
          <div style={{
            background: '#ffebee',
            color: '#c62828',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            <p>❌ {error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 15px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              minLength="6"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 15px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: '10px'
            }}
          >
            {loading ? 'Processing...' : (isLogin ? 'LOGIN' : 'REGISTER')}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '25px',
          paddingTop: '20px',
          borderTop: '1px solid #eee',
          color: '#666',
          fontSize: '14px'
        }}>
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              disabled={loading}
              style={{
                background: 'none',
                border: 'none',
                color: '#4CAF50',
                fontWeight: '600',
                cursor: 'pointer',
                marginLeft: '5px',
                padding: 0
              }}
            >
              {isLogin ? ' Register here' : ' Login here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;