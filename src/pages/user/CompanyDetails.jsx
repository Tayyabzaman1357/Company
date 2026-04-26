import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Clock, Calendar, Upload, CheckCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import { db } from '../../firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

// Fix for Leaflet marker icon
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

export default function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasBooked, setHasBooked] = useState(false);
  
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [patientImage, setPatientImage] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchCompanyAndTokenStatus = async () => {
      try {
        // Fetch company details
        const docRef = doc(db, "companies", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCompany({ id: docSnap.id, ...docSnap.data() });
        } else {
          toast.error("Company not found");
          navigate('/user');
          return;
        }

        // Check if user already booked today
        if (currentUser) {
          // Simple check: has this user booked for this company ever? 
          // You could add a date filter for "today" specifically, but for now we enforce "one token per account" as requested: "aik baar jis account se token le usse dobara token nhi le sakte"
          const q = query(
            collection(db, "tokens"), 
            where("companyId", "==", id),
            where("userId", "==", currentUser.uid)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            setHasBooked(true);
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Error fetching details");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyAndTokenStatus();
  }, [id, currentUser, navigate]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (hasBooked) {
      toast.error('You have already booked a token for this company!');
      return;
    }
    if (!patientImage) {
      toast.error('Please upload patient image');
      return;
    }

    setBookingLoading(true);
    try {
      // In a full app, we would upload the image to Firebase Storage here.
      // For this implementation, we will just save the token record.
      const tokenNumber = (company.currentToken || 0) + 1;
      
      await addDoc(collection(db, "tokens"), {
        companyId: company.id,
        userId: currentUser.uid,
        userName: currentUser.displayName,
        tokenNumber: tokenNumber,
        status: 'booked',
        createdAt: serverTimestamp()
      });

      // Update company token count
      await updateDoc(doc(db, "companies", company.id), {
        currentToken: increment(1)
      });

      toast.success(`Token #${tokenNumber} booked successfully!`);
      setHasBooked(true);
      setCompany(prev => ({...prev, currentToken: tokenNumber}));
      setIsBookingModalOpen(false);
      navigate('/user/my-tokens');
    } catch (error) {
      console.error(error);
      toast.error('Failed to book token');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <div className="container flex-center" style={{ minHeight: '100vh' }}><p>Loading company details...</p></div>;
  }

  if (!company) return null;

  const isFull = company.currentToken >= (company.totalTokens || 50);

  return (
    <div className="container" style={{ minHeight: '100vh' }}>
      <button onClick={() => navigate('/user')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '2rem' }}>
        <ArrowLeft size={18} /> Back to Search
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-card">
            <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>{company.name}</h1>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <Calendar size={18} /> Since {company.since || 'N/A'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <Clock size={18} /> {company.timings || 'N/A'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <MapPin size={18} /> {company.address}
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ height: '400px', padding: 0, overflow: 'hidden' }}>
            {(company.lat && company.lng) ? (
              <MapContainer center={[company.lat, company.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[company.lat, company.lng]}>
                  <Popup>{company.name}</Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className="flex-center" style={{ height: '100%', color: 'var(--text-muted)' }}>
                No Map Data Available
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ textAlign: 'center' }}>
            <h3>Token Status</h3>
            <div style={{ margin: '1.5rem 0' }}>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: isFull ? 'var(--danger)' : 'var(--accent)' }}>
                {company.currentToken || 0} / {company.totalTokens || 50}
              </div>
              <p style={{ color: 'var(--text-muted)' }}>Tokens currently issued</p>
            </div>
            
            {hasBooked ? (
              <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontWeight: 'bold' }}>
                <CheckCircle size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--accent)' }} />
                You have already booked here
              </div>
            ) : (
              <button 
                className="glass"
                style={{ 
                  width: '100%', padding: '1rem', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem',
                  background: isFull ? 'rgba(255,255,255,0.05)' : 'var(--primary)',
                  color: 'white', border: 'none', cursor: isFull ? 'not-allowed' : 'pointer'
                }}
                disabled={isFull}
                onClick={() => setIsBookingModalOpen(true)}
              >
                {isFull ? 'Fully Booked' : 'Book a Token'}
              </button>
            )}
          </div>

          <div className="glass-card">
            <h4>Safety Information</h4>
            <ul style={{ color: 'var(--text-muted)', paddingLeft: '1.2rem', marginTop: '0.5rem', fontSize: '0.9rem' }}>
              <li>Please arrive 10 minutes before your estimated time.</li>
              <li>Keep your token digital copy ready.</li>
              <li>Notifications will be sent via browser.</li>
            </ul>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isBookingModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card" style={{ width: '100%', maxWidth: '400px' }}
            >
              <h2 className="text-gradient">Book Token</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Upload patient picture to confirm booking.</p>
              
              <div 
                onClick={() => document.getElementById('patient-upload').click()}
                style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '2rem', textAlign: 'center', cursor: 'pointer', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)' }}
              >
                {patientImage ? (
                  <img src={URL.createObjectURL(patientImage)} alt="Patient" style={{ width: '100%', borderRadius: '8px' }} />
                ) : (
                  <>
                    <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                    <p>Click to upload picture</p>
                  </>
                )}
                <input type="file" id="patient-upload" hidden accept="image/*" onChange={(e) => setPatientImage(e.target.files[0])} />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button disabled={bookingLoading} onClick={() => setIsBookingModalOpen(false)} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white', cursor: 'pointer' }}>Cancel</button>
                <button disabled={bookingLoading} onClick={handleBooking} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 'bold', cursor: bookingLoading ? 'not-allowed' : 'pointer' }}>
                  {bookingLoading ? 'Booking...' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
