import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LogOut, Key, Globe, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Settings() {
  const { user, signOut } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setMsg('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setMsg(`Error: ${error.message}`);
    } else {
      setMsg('Password updated successfully');
      setPassword('');
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="section-header">
        <h1 className="section-title">⚙️ {t.nav.settings}</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Language */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Globe style={{ color: 'var(--agri-green-600)' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Language Preferences</h2>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className={`btn ${language === 'en' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setLanguage('en')}
            >
              English
            </button>
            <button
              className={`btn ${language === 'ml' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setLanguage('ml')}
            >
              മലയാളം (Malayalam)
            </button>
            <button
              className={`btn ${language === 'hi' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setLanguage('hi')}
            >
              हिंदी (Hindi)
            </button>
          </div>
        </div>

        {/* Security */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Shield style={{ color: 'var(--agri-green-600)' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Security</h2>
          </div>
          
          <form onSubmit={handleUpdatePassword}>
            <div className="form-group" style={{ maxWidth: '300px' }}>
              <label className="form-label">New Password</label>
              <input 
                type="password" 
                className="form-input" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                minLength={6}
              />
            </div>
            {msg && <div style={{ fontSize: '13px', color: msg.includes('Error') ? 'var(--red-500)' : 'var(--agri-green-600)', marginBottom: '12px' }}>{msg}</div>}
            <button type="submit" className="btn btn-secondary" disabled={loading}>
              <Key size={16} /> Update Password
            </button>
          </form>
        </div>

        {/* Account Actions */}
        <div className="card" style={{ padding: '24px', border: '1px solid var(--red-200)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--red-500)' }}>Account</h2>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Logged in as {user?.email}
          </p>
          <button className="btn btn-danger" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>

      </div>
    </div>
  );
}
