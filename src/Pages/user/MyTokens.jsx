import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, XCircle, Bell, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

export default function MyTokens() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyTokens = async () => {
      if (!currentUser) return;
      try {
        const q = query(collection(db, "tokens"), where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const myTokens = [];
        for (const tokenDoc of querySnapshot.docs) {
          const tokenData = { id: tokenDoc.id, ...tokenDoc.data() };
          
          // Fetch company to get currentToken and name
          const companyRef = doc(db, "companies", tokenData.companyId);
          const companySnap = await getDoc(companyRef);
          
          if (companySnap.exists()) {
            const companyData = companySnap.data();
            myTokens.push({
              ...tokenData,
              companyName: companyData.name,
              currentToken: companyData.currentToken || 0,
              estWait: Math.max(0, (tokenData.tokenNumber - (companyData.currentToken || 0)) * 10) // 10 mins per token
            });
          }
        }
        
        // Sort by creation time
        myTokens.sort((a, b) => b.createdAt - a.createdAt);
        setTokens(myTokens);
        
      } catch (error) {
        console.error(error);
        toast.error("Failed to load tokens");
      } finally {
        setLoading(false);
      }
    };

    fetchMyTokens();
  }, [currentUser]);

  const cancelToken = async (id) => {
    try {
      await deleteDoc(doc(db, "tokens", id));
      setTokens(tokens.filter(t => t.id !== id));
      toast.success('Token cancelled successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to cancel token');
    }
  };

  useEffect(() => {
    // Simulated notification logic based on real estWait
    const timer = setTimeout(() => {
      if (tokens.length > 0 && tokens[0].estWait > 0 && tokens[0].estWait <= 15) {
        toast(`Your token at ${tokens[0].companyName} is coming up in ${tokens[0].estWait} minutes!`, {
          icon: '🔔',
          duration: 6000,
        });
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [tokens]);

  return (
    <div className="container" style={{ minHeight: '100vh' }}>
      <button onClick={() => navigate('/user')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '2rem' }}>
        <ArrowLeft size={18} /> Back to Search
      </button>

      <h1 className="text-gradient" style={{ marginBottom: '2rem' }}>My Active Tokens</h1>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '5rem', color: 'var(--text-muted)' }}>
          <p>Loading tokens...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
          {tokens.map((token) => (
            <motion.div 
              key={token.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}
            >
              <div>
                <h2 style={{ marginBottom: '0.5rem' }}>{token.companyName}</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <span className="glass" style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 'bold' }}>
                    Your Token: #{token.tokenNumber}
                  </span>
                  <span className="glass" style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Now Serving: #{token.currentToken}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end' }}>
                    <Clock size={14} /> Est. Wait
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {token.tokenNumber <= token.currentToken ? 'Done' : `${token.estWait} mins`}
                  </div>
                </div>

                <button 
                  onClick={() => cancelToken(token.id)}
                  className="glass" 
                  style={{ padding: '0.8rem', borderRadius: '50%', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', cursor: 'pointer', background: 'rgba(239, 68, 68, 0.05)' }}
                  title="Cancel Token"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </motion.div>
          ))}

          {tokens.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: '5rem', color: 'var(--text-muted)' }}>
              <CheckCircle size={64} style={{ opacity: 0.1, margin: '0 auto 1rem' }} />
              <h3>No active tokens</h3>
              <p>You haven't booked any tokens yet.</p>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '3rem', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><Bell size={18} /> Notification Settings</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          You will receive a notification on your device when your token is within 10 minutes of being called. 
          Please ensure your browser notifications are enabled.
        </p>
      </div>
    </div>
  );
}
