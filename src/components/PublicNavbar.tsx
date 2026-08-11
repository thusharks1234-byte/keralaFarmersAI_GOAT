import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Sprout, Menu, X } from 'lucide-react';

export function PublicNavbar() {
  const { t, language, setLanguage } = useLanguage();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* Detect scroll to trigger background transition */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { to: '/features', label: t.nav.features },
    { to: '/about', label: t.nav.about },
    { to: '/resources', label: t.nav.resources },
    { to: '/support', label: t.nav.support },
  ];

  return (
    <motion.header
      className="public-navbar"
      role="banner"
      animate={{
        background: scrolled
          ? 'rgba(11, 61, 46, 0.97)'
          : 'rgba(11, 61, 46, 0.35)',
        backdropFilter: scrolled ? 'blur(16px)' : 'blur(4px)',
        boxShadow: scrolled
          ? '0 2px 24px rgba(0,0,0,0.25)'
          : '0 0 0 rgba(0,0,0,0)',
      }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{ background: 'rgba(11, 61, 46, 0.35)' }}
    >
      <Link to="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sprout size={22} style={{ color: 'var(--leaf-green-400)' }} />
        Krishi Mithram
      </Link>

      <nav className="nav-links" aria-label="Primary navigation" style={{ display: menuOpen ? 'flex' : undefined }}>
        {navLinks.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="nav-actions">
        <div className="lang-switch">
          <button
            className={`lang-btn${language === 'en' ? ' active' : ''}`}
            onClick={() => setLanguage('en')}
            aria-pressed={language === 'en'}
          >
            EN
          </button>
          <button
            className={`lang-btn${language === 'ml' ? ' active' : ''}`}
            onClick={() => setLanguage('ml')}
            aria-pressed={language === 'ml'}
          >
            ML
          </button>
        </div>

        {session ? (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/dashboard')}
          >
            {t.nav.dashboard}
          </button>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {t.nav.login}
            </Link>
            <Link to="/signup" className="btn btn-primary btn-sm">
              {t.nav.getStarted}
            </Link>
          </>
        )}

        <button
          className="btn btn-ghost btn-icon"
          style={{ color: 'white', display: 'none' }}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          id="hamburger"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </motion.header>
  );
}

