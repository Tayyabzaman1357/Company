import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Users, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { db } from '../../firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

export default function CompanyTokens() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [tokenLimit, setTokenLimit] = useState(50);
  const [isAllowed, setIsAllowed] = useState(true);
  const [tokens, setTokens] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const compRef = doc(db, "companies", id);
        const compSnap = await getDoc(compRef);
        if (!compSnap.exists()) {
          toast.error("Company not found");
          return navigate('/company');
        }
        
        const compData = compSnap.data();
        setCompany({ id: compSnap.id, ...compData });
        setTokenLimit(compData.totalTokens || 50);

        const q = query(collection(db, "tokens"), where("companyId", "==", id), where("status", "==", "booked"));
        const querySnapshot = await getDocs(q);
        
        const fetchedTokens = [];
        querySnapshot.forEach((doc) => {
          fetchedTokens.push({ id: doc.id, ...doc.data() });
        });
        
        fetchedTokens.sort((a, b) => a.tokenNumber - b.tokenNumber);
        setTokens(fetchedTokens);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load tokens");
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, [id, navigate]);

  const handleUpdateLimit = async () => {
    try {
      await updateDoc(doc(db, "companies", id), {
        totalTokens: Number(tokenLimit)
      });
      toast.success("Limit updated");
    } catch (error) {
      toast.error("Failed to update limit");
    }
  };

  const handleNextToken = async () => {
    if (tokens.length === 0) return;
    try {
      const nextToken = tokens[0];
      await updateDoc(doc(db, "tokens", nextToken.id), { status: 'done' });
      
      setTokens(tokens.slice(1));
      toast.success(`Token #${nextToken.tokenNumber} marked as done!`);
    } catch (error) {
      toast.error("Failed to update token");
    }
  };

  if (loading) {
    return <div className="container flex-center" style={{ minHeight: '100vh' }}><p>Loading...</p></div>;
  }

  return (
    <div className="container" style={{ minHeight: '100vh' }}>
      <button onClick={() => navigate('/company')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '2rem' }}>
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div>
        <h1 className="text-gradient" style={{ marginBottom: '2rem' }}>Manage Tokens - {company?.name}</h1>
        
        <div className="glass-card" style={{ marginBottom: '2rem', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="input-group" style={{ margin: 0, flex: 1, minWidth: '200px' }}>
            <label>Daily Token Limit</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input type="number" className="input-field" value={tokenLimit} onChange={e => setTokenLimit(e.target.value)} />
              <button onClick={handleUpdateLimit} className="glass" style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0 1rem', borderRadius: '8px', cursor: 'pointer' }}>Save</button>
            </div>
          </div>
        </div>

        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={20} /> Current Queue ({tokens.length})</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tokens.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
                  #{t.tokenNumber}
                </div>
                <div>
                  <h4 style={{ margin: 0 }}>{t.userName || 'Patient'}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status: {t.status}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                {i === 0 && (
                  <button onClick={handleNextToken} className="glass" style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
