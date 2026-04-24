import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Search, MapPin, Building, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';


export default function UserDashboard() {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock companies
  const companies = [
    { id: 1, name: 'HealthCare Plus', address: '123 Main St, NY', totalTokens: 50, currentToken: 12, estWait: '45 mins' },
    { id: 2, name: 'Dr. Smith Clinic', address: '456 Park Ave, NY', totalTokens: 30, currentToken: 30, estWait: 'Full' },
    { id: 3, name: 'City Hospital', address: '789 Broadway, NY', totalTokens: 100, currentToken: 45, estWait: '2 hrs' },
  ];

  const filtered = companies.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="container" style={{ minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 className="text-gradient">Find a Token</h1>
          <p style={{ color: 'var(--text-muted)' }}>Hello, {currentUser?.displayName}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/user/my-tokens" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '500', fontSize: '0.9rem' }}>My Tokens</Link>
          <button onClick={logout} className="glass" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'white', background: 'transparent', cursor: 'pointer' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>

      </header>

      <div style={{ position: 'relative', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
        <input 
          type="text" 
          placeholder="Search for hospitals, clinics, or companies..." 
          className="input-field" 
          style={{ paddingLeft: '3rem', height: '60px', fontSize: '1.1rem', borderRadius: '30px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search size={24} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {filtered.map((company, i) => (
          <motion.div 
            key={company.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card"
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Building size={24} color="var(--primary)" />
              </div>
              <div>
                <h3 style={{ margin: 0 }}>{company.name}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <MapPin size={12} /> {company.address}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status</div>
                <div style={{ fontWeight: 'bold', color: company.currentToken >= company.totalTokens ? 'var(--danger)' : 'var(--accent)' }}>
                  {company.currentToken} / {company.totalTokens}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Est. Wait</div>
                <div style={{ fontWeight: 'bold' }}>{company.estWait}</div>
              </div>
            </div>

            <button 
              className="glass"
              style={{ 
                marginTop: 'auto', width: '100%', padding: '0.8rem', borderRadius: '8px', 
                cursor: company.currentToken >= company.totalTokens ? 'not-allowed' : 'pointer', 
                background: company.currentToken >= company.totalTokens ? 'rgba(255,255,255,0.1)' : 'var(--primary)', 
                color: 'white', border: 'none', fontWeight: 'bold' 
              }}
              onClick={() => navigate(`/user/company/${company.id}`)}
            >
              {company.currentToken >= company.totalTokens ? 'Tokens Full Today' : 'Book Token'}
            </button>

          </motion.div>
        ))}
      </div>
    </div>
  );
}
