import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, MapPin, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon missing in Leaflet + Vite
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position ? <Marker position={position} /> : null;
}

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14);
    }
  }, [center, map]);
  return null;
}

export default function AddCompanyModal({ onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    since: '',
    timings: '',
    address: ''
  });
  
  const [position, setPosition] = useState(null); // {lat, lng}
  const [mapCenter, setMapCenter] = useState([24.8607, 67.0011]);
  
  // Image Upload State
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Geosearch State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 3) {
      toast.error('You can only upload a maximum of 3 images.');
      return;
    }
    setFiles([...files, ...selectedFiles].slice(0, 3));
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        setSearchResults(data);
      } else {
        toast.error("No locations found");
        setSearchResults([]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to search location");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (loc) => {
    const lat = parseFloat(loc.lat);
    const lon = parseFloat(loc.lon);
    
    if (isNaN(lat) || isNaN(lon)) {
       toast.error("Invalid coordinates.");
       return;
    }

    const newPos = { lat, lng: lon };
    const address = loc.display_name || loc.name;
    
    setPosition(newPos);
    setMapCenter([lat, lon]);
    setFormData({ ...formData, address: address });
    setSearchResults([]);
    setSearchQuery('');
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter a Company Name');
      return;
    }
    if (!formData.address.trim()) {
      toast.error('Please enter an Address or use the map search');
      return;
    }
    if (!position) {
      toast.error('Please click on the Map below to drop a pin for the exact location');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onAdd({
        ...formData,
        lat: position.lat,
        lng: position.lng,
        files // Pass files to parent
      });
    } finally {
      setIsSubmitting(false);
    }
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
          style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}
        >
          <button 
            type="button"
            onClick={onClose}
            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', zIndex: 10 }}
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
              <label 
                style={{ 
                  display: 'block', 
                  border: '2px dashed var(--border-color)', 
                  borderRadius: '8px', 
                  padding: '1rem', 
                  textAlign: 'center', 
                  cursor: 'pointer', 
                  background: 'rgba(255,255,255,0.02)',
                  position: 'relative'
                }}
              >
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 2 }}
                  onChange={handleFileChange}
                />
                <Upload size={24} style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }} />
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>Click to upload images</p>
              </label>
              {files.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  {files.map((file, idx) => (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.1)', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 3, position: 'relative' }}>
                      <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                      <button type="button" onClick={(e) => { e.preventDefault(); removeFile(idx); }} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 0 }}><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="input-group">
              <label>Search Location on Map</label>
              <div style={{ position: 'relative', display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                  placeholder="e.g. Karachi Airport"
                  style={{ flex: 1 }}
                />
                <button 
                  type="button" 
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="glass"
                  style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0 1rem', borderRadius: '8px', cursor: 'pointer' }}
                >
                  <Search size={18} />
                </button>
              </div>

              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div style={{ position: 'absolute', zIndex: 1001, background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', width: '100%', maxHeight: '200px', overflowY: 'auto', marginTop: '0.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                  {searchResults.map((loc, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => handleSelectLocation(loc)}
                      style={{ padding: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', fontSize: '0.9rem' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <strong style={{ display: 'block', color: 'var(--text-main)' }}>{loc.name}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{loc.location?.formatted_address}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="input-group" style={{ position: 'relative' }}>
              <label>Manual Address (or mapped from search)</label>
              <input 
                type="text" 
                className="input-field" 
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                placeholder="Enter full address..."
              />
            </div>

            <div className="input-group">
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Map Preview (Click to pin exactly)</label>
              <div style={{ height: '200px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative', zIndex: 1 }}>
                <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapController center={mapCenter} />
                  <LocationPicker position={position} setPosition={setPosition} />
                </MapContainer>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="glass"
              style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer', marginTop: '1rem', opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? 'Adding...' : 'Add Company'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
