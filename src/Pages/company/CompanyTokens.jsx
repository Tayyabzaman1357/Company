import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Users, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function CompanyTokens() {
  const navigate = useNavigate();
  const [tokenLimit, setTokenLimit] = useState(50);
  const [isAllowed, setIsAllowed] = useState(true);
  const [tokens, setTokens] = useState([
    { id: 1, name: 'Alice Smith', email: 'alice@example.com', estTime: '10:30', status: 'waiting', img: 'https://i.pravatar.cc/150?u=1' },
    { id: 2, name: 'Bob Jones', email: 'bob@example.com', estTime: '10:45', status: 'waiting', img: 'https://i.pravatar.cc/150?u=2' },
  ]);

  const handleNextToken = () => {
    if (tokens.length === 0) return;
    const newTokens = [...tokens];
    newTokens[0].status = 'done';
    setTokens(newTokens.slice(1));
    toast.success('Token marked as done!');
  };

  return (
    <div className="container" style={{ minHeight: '100vh' }}>
      <button onClick={() => navigate('/company')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '2rem' }}>
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div>
        <h1 className="text-gradient" style={{ marginBottom: '2rem' }}>Manage Tokens</h1>
        
        <div className="glass-card" style={{ marginBottom: '2rem', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="input-group" style={{ margin: 0, flex: 1, minWidth: '200px' }}>
            <label>Daily Token Limit</label>
            <input type="number" className="input-field" value={tokenLimit} onChange={e => setTokenLimit(e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Today's Status:</span>
            <button 
              onClick={() => setIsAllowed(!isAllowed)}
              style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: 'none', background: isAllowed ? 'var(--accent)' : 'var(--danger)', color: 'white', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s' }}
            >
              {isAllowed ? 'Allowing Tokens' : 'Disallowed'}
            </button>
          </div>
        </div>

        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={20} /> Current Queue ({tokens.length} / {tokenLimit})</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tokens.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
                  #{i + 1}
                </div>
                <img src={t.img} alt={t.name} style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid var(--border-color)', objectFit: 'cover' }} />
                <div>
                  <h4 style={{ margin: 0 }}>{t.name}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.email}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
                  <Clock size={16} />
                  <input type="time" value={t.estTime} className="input-field" style={{ padding: '0.4rem', width: '120px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }} onChange={(e) => {
                     const nt = [...tokens]; nt[i].estTime = e.target.value; setTokens(nt);
                  }}/>
                </div>
                {i === 0 && (
                  <button onClick={handleNextToken} className="glass" style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={18} /> Mark Done
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          {tokens.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Queue is empty.</p>}
        </div>
      </div>
    </div>
  );
}
