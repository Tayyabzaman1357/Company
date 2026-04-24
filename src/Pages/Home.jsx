import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, UserSearch } from 'lucide-react';

export default function Home() {
  const { role, selectRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role === 'company') navigate('/company');
    if (role === 'user') navigate('/user');
  }, [role, navigate]);

  const handleRoleSelect = (selectedRole) => {
    selectRole(selectedRole);
  };

  return (
    <div className="container flex-col flex-center" style={{ minHeight: '100vh', gap: '2rem' }}>
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-gradient"
        style={{ fontSize: '3rem', textAlign: 'center' }}
      >
        Welcome to TokenFlow
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '2rem' }}
      >
        How would you like to use the app today?
      </motion.p>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <RoleCard 
          icon={<Building2 size={48} color="var(--primary)" />}
          title="I am a Company"
          description="Manage tokens, track users, and streamline your daily operations."
          onClick={() => handleRoleSelect('company')}
          delay={0.3}
        />
        <RoleCard 
          icon={<UserSearch size={48} color="var(--accent)" />}
          title="I need a Token"
          description="Find companies, book tokens, and track your estimated waiting time."
          onClick={() => handleRoleSelect('user')}
          delay={0.4}
        />
      </div>
    </div>
  );
}

function RoleCard({ icon, title, description, onClick, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -10, scale: 1.02 }}
      onClick={onClick}
      className="glass-card"
      style={{
        width: '300px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '1rem',
        padding: '3rem 2rem',
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}
    >
      <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
        {icon}
      </div>
      <h2 style={{ color: 'var(--text-main)', fontSize: '1.5rem' }}>{title}</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>{description}</p>
    </motion.div>
  );
}