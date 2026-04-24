import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

export default function Login() {
  const { loginWithFacebook, currentUser } = useAuth();

  if (currentUser) {
    return <Navigate to="/" />;
  }

  return (
    <div className="container flex-center" style={{ minHeight: '100vh' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card" 
        style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '3rem 2rem' }}
      >
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>TokenFlow</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage and find your appointments with ease.</p>
        </div>

        <button 
          onClick={loginWithFacebook}
          className="glass"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            width: '100%',
            padding: '1rem',
            borderRadius: '12px',
            color: 'white',
            background: 'linear-gradient(to right, #1877F2, #145dbf)',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'transform 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <FacebookIcon size={24} />
          Continue with Facebook
        </button>

        <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}