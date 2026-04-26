import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Building, LogOut, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AddCompanyModal from '../../Components/company/AddCompanyModal';
import { db, storage } from '../../firebase';
import { collection, query, where, getDocs, addDoc, doc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';

export default function CompanyDashboard() {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const fetchCompanies = async () => {
      try {
        const q = query(collection(db, "companies"), where("ownerId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        const fetchedCompanies = [];
        querySnapshot.forEach((doc) => {
          fetchedCompanies.push({ id: doc.id, ...doc.data() });
        });

        setCompanies(fetchedCompanies);
      } catch (error) {
        toast.error("Failed to load companies");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [currentUser]);

  const handleAddCompany = async (newCompany) => {
    try {
      toast.loading("Registering company and uploading files...", { id: "register-toast" });
      
      const { files, ...companyDetails } = newCompany;
      
      // 1. Generate a new document reference so we have the ID for storage
      const newDocRef = doc(collection(db, "companies"));
      const docId = newDocRef.id;

      // 2. Upload images to Firebase Storage
      const certificateUrls = [];
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split('.').pop();
          const storageRef = ref(storage, `companies/${docId}/cert_${i}_${Date.now()}.${fileExt}`);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          certificateUrls.push(url);
        }
      }

      // 3. Save everything to Firestore
      const companyData = {
        ...companyDetails,
        ownerId: currentUser.uid,
        totalTokens: 50, // Default for now
        currentToken: 0,
        certificateUrls, // Array of uploaded image URLs
        createdAt: serverTimestamp()
      };
      
      await setDoc(newDocRef, companyData);
      
      setCompanies([...companies, { ...companyData, id: docId }]);
      setIsModalOpen(false);
      toast.success('Company registered successfully!', { id: "register-toast" });
    } catch (error) {
      toast.error("Failed to add company. Check Firebase Storage rules.", { id: "register-toast" });
      console.error(error);
    }
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

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '5rem', color: 'var(--text-muted)' }}>
          <p>Loading companies...</p>
        </div>
      ) : companies.length === 0 ? (
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
              style={{ position: 'relative' }}
            >
              <button 
                onClick={async () => {
                  if (window.confirm("Are you sure you want to delete this company?")) {
                    try {
                      await deleteDoc(doc(db, "companies", company.id));
                      setCompanies(companies.filter(c => c.id !== company.id));
                      toast.success("Company deleted");
                    } catch (e) {
                      toast.error("Failed to delete company");
                    }
                  }
                }}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.2rem' }}
                title="Delete Company"
              >
                <X size={20} />
              </button>
              
              <h3 style={{ paddingRight: '2rem' }}>{company.name}</h3>
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
