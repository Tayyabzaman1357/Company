import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const normalizedRole = typeof role === 'string' ? role.toLowerCase() : 'user';
    
    if (normalizedRole === 'company') {
      navigate('/company');
    } else if (normalizedRole) {
      navigate('/user');
    }
  }, [role, navigate]);

  return (
    <div className="container flex-col flex-center" style={{ minHeight: '100vh', gap: '2rem' }}>
      <h1 className="text-gradient" style={{ fontSize: '2rem' }}>Loading your dashboard...</h1>
      <p style={{ color: 'var(--text-muted)' }}>If you are stuck here for more than a few seconds, there might be a network issue.</p>
      <button 
        onClick={() => logout().then(() => navigate('/login'))} 
        className="glass" 
        style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', background: 'var(--danger)', color: 'white', border: 'none' }}
      >
        Force Logout
      </button>
    </div>
  );
}