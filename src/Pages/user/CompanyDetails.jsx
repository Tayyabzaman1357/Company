import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Clock, Calendar, Upload, CheckCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';

// Mock data for companies
const mockCompanies = [
  { id: 1, name: 'HealthCare Plus', since: '2010', timings: '9 AM - 6 PM', address: '123 Main St, NY', lat: 40.7128, lng: -74.0060, totalTokens: 50, currentToken: 12 },
  { id: 2, name: 'Dr. Smith Clinic', since: '2015', timings: '10 AM - 4 PM', address: '456 Park Ave, NY', lat: 40.7589, lng: -73.9851, totalTokens: 30, currentToken: 30 },
  { id: 3, name: 'City Hospital', since: '2005', timings: '24/7', address: '789 Broadway, NY', lat: 40.7306, lng: -73.9352, totalTokens: 100, currentToken: 45 },
];

export default function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const company = mockCompanies.find(c => c.id === parseInt(id)) || mockCompanies[0];
  
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [patientImage, setPatientImage] = useState(null);

  const handleBooking = (e) => {
    e.preventDefault();
    if (!patientImage) {
      toast.error('Please upload patient image');
      return;
    }
    toast.success('Token booked successfully!');
    setIsBookingModalOpen(false);
    navigate('/user/my-tokens');
  };

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
                <Calendar size={18} /> Since {company.since}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <Clock size={18} /> {company.timings}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <MapPin size={18} /> {company.address}
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ height: '400px', padding: 0, overflow: 'hidden' }}>
            <MapContainer center={[company.lat, company.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[company.lat, company.lng]}>
                <Popup>{company.name}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ textAlign: 'center' }}>
            <h3>Token Status</h3>
            <div style={{ margin: '1.5rem 0' }}>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: company.currentToken >= company.totalTokens ? 'var(--danger)' : 'var(--accent)' }}>
                {company.currentToken} / {company.totalTokens}
              </div>
              <p style={{ color: 'var(--text-muted)' }}>Tokens currently issued</p>
            </div>
            
            <button 
              className="glass"
              style={{ 
                width: '100%', padding: '1rem', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem',
                background: company.currentToken >= company.totalTokens ? 'rgba(255,255,255,0.05)' : 'var(--primary)',
                color: 'white', border: 'none', cursor: company.currentToken >= company.totalTokens ? 'not-allowed' : 'pointer'
              }}
              disabled={company.currentToken >= company.totalTokens}
              onClick={() => setIsBookingModalOpen(true)}
            >
              {company.currentToken >= company.totalTokens ? 'Fully Booked' : 'Book a Token'}
            </button>
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
                style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '2rem', textAlign: 'center', cursor: 'pointer', marginBottom: '1.5rem' }}
              >
                {patientImage ? (
                  <img src={URL.createObjectURL(patientImage)} alt="Patient" style={{ width: '100%', borderRadius: '8px' }} />
                ) : (
                  <>
                    <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                    <p>Click to upload picture</p>
                  </>
                )}
                <input type="file" id="patient-upload" hidden onChange={(e) => setPatientImage(e.target.files[0])} />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setIsBookingModalOpen(false)} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleBooking} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Confirm</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
