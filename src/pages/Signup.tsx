import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { Sprout, Eye, EyeOff, Loader2, X } from 'lucide-react';
import type { Language } from '../types';

export default function Signup() {
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    preferredLanguage: language as Language,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const getPasswordStrength = (pass: string) => {
    if (pass.length < 6) return { label: 'Weak', color: 'var(--red-500)', width: '25%' };
    if (pass.length < 10) return { label: 'Fair', color: 'var(--golden-paddy-500)', width: '50%' };
    if (pass.length < 14) return { label: 'Good', color: 'var(--agri-green-500)', width: '75%' };
    return { label: 'Strong', color: 'var(--agri-green-600)', width: '100%' };
  };

  const strength = form.password ? getPasswordStrength(form.password) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
            phone: form.phone,
            preferred_language: form.preferredLanguage,
          },
        },
      });

      if (authError) {
        if (authError.message.includes('already')) {
          setError(t.auth.emailExists);
        } else {
          setError(t.auth.signupError);
        }
        return;
      }

      if (data.user) {
        // Insert profile row
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: form.fullName,
          phone: form.phone,
          preferred_language: form.preferredLanguage,
        });

        setLanguage(form.preferredLanguage);
        navigate('/farm-profile?onboarding=true');
      }
    } catch {
      setError(t.auth.signupError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page animate-fade-in">
      <div className="auth-card animate-slide-up" style={{ maxWidth: '480px', position: 'relative' }}>
        <Link 
          to="/" 
          style={{ 
            position: 'absolute', 
            top: '20px', 
            right: '20px', 
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            borderRadius: '50%',
            transition: 'background 0.2s'
          }}
          aria-label="Go back to home"
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--light-green-100)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <X size={20} />
        </Link>
        <div className="auth-logo">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
            <Sprout size={28} style={{ color: 'var(--agri-green-600)' }} />
            <span className="auth-logo-text">Krishi Mithram</span>
          </div>
          <div className="auth-logo-sub">Create your farming companion account</div>
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 700, textAlign: 'center', marginBottom: '24px', color: 'var(--text-primary)' }}>
          {t.auth.signup}
        </h1>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label htmlFor="fullName" className="form-label required">{t.auth.fullName}</label>
              <input
                id="fullName"
                type="text"
                className="form-input"
                value={form.fullName}
                onChange={e => update('fullName', e.target.value)}
                required
                placeholder="Ramesh Kumar"
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="su-email" className="form-label required">{t.auth.email}</label>
              <input
                id="su-email"
                type="email"
                className="form-input"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                required
                placeholder="farmer@example.com"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">{t.auth.phone}</label>
              <input
                id="phone"
                type="tel"
                className="form-input"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                placeholder="+91 9876543210"
                autoComplete="tel"
              />
            </div>

            <div className="form-group">
              <label htmlFor="su-password" className="form-label required">{t.auth.password}</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="su-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  required
                  style={{ paddingRight: '48px' }}
                  autoComplete="new-password"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {strength && (
                <div style={{ marginTop: '6px' }}>
                  <div style={{ height: '4px', background: 'var(--light-green-100)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: strength.width, background: strength.color, transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ fontSize: '12px', color: strength.color, fontWeight: 600 }}>{strength.label}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">{t.auth.language}</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {(['en', 'ml', 'hi'] as Language[]).map(lang => (
                  <label
                    key={lang}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      border: `1.5px solid ${form.preferredLanguage === lang ? 'var(--agri-green-600)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      background: form.preferredLanguage === lang ? 'var(--light-green-100)' : 'var(--white)',
                      transition: 'all 0.15s',
                    }}
                  >
                    <input
                      type="radio"
                      name="preferredLanguage"
                      value={lang}
                      checked={form.preferredLanguage === lang}
                      onChange={() => update('preferredLanguage', lang)}
                      style={{ accentColor: 'var(--agri-green-600)' }}
                    />
                    {lang === 'en' ? 'English' : lang === 'ml' ? 'മലയാളം' : 'हिंदी'}
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <p className="form-error" role="alert">⚠️ {error}</p>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '14px', fontSize: '16px', marginTop: '8px' }}
            >
              {loading ? (
                <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> {t.general.loading}</>
              ) : t.auth.signup}
            </button>
          </div>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          {t.auth.haveAccount}{' '}
          <Link to="/login" style={{ color: 'var(--agri-green-600)', fontWeight: 600 }}>
            {t.auth.login}
          </Link>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
