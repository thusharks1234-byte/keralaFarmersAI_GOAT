import { Zap, BellRing, Settings } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';

export default function SmartAlerts() {
  useLanguage();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '60px 20px' }}>
      <div style={{
        width: '80px', height: '80px', borderRadius: '50%',
        background: 'var(--light-green-100)', color: 'var(--agri-green-600)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px'
      }}>
        <Zap size={40} />
      </div>

      <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
        Smart Alerts
      </h1>
      
      <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
        Proactive push notifications for severe weather changes, sudden market price drops, and pest risk warnings are now active. Make sure your contact details are up to date!
      </p>

      <div className="card" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BellRing size={20} style={{ color: 'var(--agri-green-600)' }} />
            <span style={{ fontWeight: 600 }}>Notification Preferences</span>
          </div>
          <Link to="/farm-profile" className="btn btn-secondary btn-sm">
            <Settings size={14} /> Profile Settings
          </Link>
        </div>
        
        <div style={{ padding: '24px 0 0 0' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>What to expect:</h4>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li style={{ display: 'flex', gap: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <span>🌧️</span> <strong>Weather:</strong> Heavy rain or extreme heat warnings for your district.
            </li>
            <li style={{ display: 'flex', gap: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <span>📉</span> <strong>Market:</strong> Significant price changes for your current crop.
            </li>
            <li style={{ display: 'flex', gap: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <span>🐛</span> <strong>Pest Risk:</strong> Seasonal pest outbreak alerts based on your crop cycle.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
