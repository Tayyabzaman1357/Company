import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Building, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AddCompanyModal from '../../components/company/AddCompanyModal';

export default function CompanyDashboard() {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companies, setCompanies] = useState([]);

  const handleAddCompany = (newCompany) => {
    setCompanies([...companies, { ...newCompany, id: Date.now() }]);
    setIsModalOpen(false);
  };

  return (
    <div className="container" style={{ position: 'relative', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 className="text-gradient">Company Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back, {currentUser?.displayName}</p>
        </div>
        <button onClick={logout} className="glass" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'white', background: 'transparent', cursor: 'pointer' }}>
          <LogOut size={18} /> Logout
        </button>
      </header>

      {companies.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '5rem', color: 'var(--text-muted)' }}>
          <Building size={64} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
          <h2>No companies added yet</h2>
          <p>Click the + button to register your first company.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {companies.map((company, i) => (
            <motion.div 
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card"
            >
              <h3>{company.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0' }}>Since: {company.since}</p>
              <p style={{ fontSize: '0.9rem' }}>{company.address}</p>
              <button 
                className="glass"
                style={{ marginTop: '1rem', width: '100%', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', background: 'var(--primary)', color: 'white', border: 'none' }}
                onClick={() => navigate(`/company/tokens/${company.id}`)}
              >
                Manage Tokens
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsModalOpen(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'var(--primary)',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 20px rgba(109, 40, 217, 0.4)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer'
        }}
      >
        <Plus size={32} />
      </motion.button>

      {isModalOpen && (
        <AddCompanyModal 
          onClose={() => setIsModalOpen(false)} 
          onAdd={handleAddCompany} 
        />
      )}
    </div>
  );
}
