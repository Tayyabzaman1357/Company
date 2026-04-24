import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddCompanyModal({ onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    since: '',
    timings: '',
    address: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.address) {
      toast.error('Please fill in required fields');
      return;
    }
    onAdd(formData);
    toast.success('Company registered successfully!');
  };

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', 
        backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', 
        alignItems: 'center', zIndex: 1000
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass-card"
          style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}
        >
          <button 
            onClick={onClose}
            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>

          <h2 style={{ marginBottom: '1.5rem', marginTop: '0.5rem' }} className="text-gradient">Register Company</h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group">
              <label>Company Name</label>
              <input 
                type="text" 
                className="input-field" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. HealthCare Inc."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label>Since (Year)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={formData.since}
                  onChange={e => setFormData({...formData, since: e.target.value})}
                  placeholder="e.g. 2010"
                />
              </div>
              <div className="input-group">
                <label>Timings</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.timings}
                  onChange={e => setFormData({...formData, timings: e.target.value})}
                  placeholder="e.g. 9 AM - 5 PM"
                />
              </div>
            </div>

            <div className="input-group">
              <label>Certificates (Max 3 Images)</label>
              <div style={{ border: '2px dashed var(--border-color)', borderRadius: '8px', padding: '2rem', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}>
                <Upload size={24} style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }} />
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Click to upload images</p>
              </div>
            </div>

            <div className="input-group">
              <label>Address</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  placeholder="Search via Foursquare..."
                  style={{ paddingRight: '2.5rem' }}
                />
                <MapPin size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
              <div style={{ height: '150px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Map Preview (Leaflet/Foursquare)</span>
              </div>
            </div>

            <button 
              type="submit"
              className="glass"
              style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem' }}
            >
              Add Company
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
