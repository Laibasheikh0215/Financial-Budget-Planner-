import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import './App.css';

// Debug: Log environment variables
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

// Hardcode credentials for testing (temporary)
const supabaseUrl = 'https://bqqqgrzqjjjvwsmdmhqv.supabase.co'; // REPLACE THIS
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxcXFncnpxampqdndzbWRtaHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MjUyMDIsImV4cCI6MjA4NDQwMTIwMn0.u01kYcKLK_gNlTzXU0WVQiEunuGk-_lB2LF8klzW0fA'; // REPLACE THIS

// OR use environment variables
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('App mounted, checking session...');
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Session data:', session);
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log('Auth state changed:', session);
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTopColor: 'white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Loading Budget Bloom...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {!session ? (
        <Auth setSession={setSession} />
      ) : (
        <Dashboard session={session} />
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default App;