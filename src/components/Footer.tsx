import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Sprout, Mail, Phone } from 'lucide-react';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-grid">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Sprout size={22} style={{ color: 'var(--leaf-green-400)' }} />
            <span style={{ fontSize: '20px', fontWeight: 800, color: 'white' }}>Krishi Mithram</span>
          </div>
          <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'rgba(255,255,255,0.6)', maxWidth: '280px' }}>
            {t.footer.tagline}
          </p>
          <p style={{ fontSize: '12px', fontFamily: 'var(--font-ml)', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
            കേരളത്തിലെ കർഷകർക്ക് ഒരു AI കൂട്ടുകാരൻ
          </p>
        </div>

        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'white', marginBottom: '16px' }}>{t.footer.quickLinks}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { to: '/features', label: t.nav.features },
              { to: '/about', label: t.nav.about },
              { to: '/resources', label: t.nav.resources },
              { to: '/support', label: t.nav.support },
            ].map(({ to, label }) => (
              <Link key={to} to={to} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'white', marginBottom: '16px' }}>{t.nav.features}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { to: '/ai-assistant', label: t.nav.aiAssistant },
              { to: '/crop-advisor', label: t.nav.cropAdvisor },
              { to: '/weather', label: t.nav.weather },
              { to: '/market-prices', label: t.nav.marketPrices },
            ].map(({ to, label }) => (
              <Link key={to} to={to} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'white', marginBottom: '16px' }}>{t.footer.contact}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <a href="mailto:thusharks1234@gmail.com" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={14} /> thusharks1234@gmail.com
            </a>
            <a href="tel:+919591997179" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={14} /> +91 9591 997 179
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>{t.footer.copyright}</span>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/privacy" style={{ color: 'rgba(255,255,255,0.5)' }}>{t.footer.privacy}</Link>
          <Link to="/terms" style={{ color: 'rgba(255,255,255,0.5)' }}>{t.footer.terms}</Link>
        </div>
      </div>
    </footer>
  );
}
