import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  LayoutDashboard, Bot, Leaf, FlaskConical, Cloud, TrendingUp,
  FileText, Calendar, Zap, User, Settings, LogOut, Sprout, ShoppingBag
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' as const },
  { to: '/ai-assistant', icon: Bot, labelKey: 'aiAssistant' as const },
  { to: '/crop-advisor', icon: Leaf, labelKey: 'cropAdvisor' as const },
  { to: '/weather', icon: Cloud, labelKey: 'weather' as const },
  { to: '/market-prices', icon: TrendingUp, labelKey: 'marketPrices' as const },
  { to: '/buy-fertilisers', icon: ShoppingBag, labelKey: 'buyFertilisers' as const, isComingSoon: true },
  { to: '/govt-schemes', icon: FileText, labelKey: 'govtSchemes' as const },
  { to: '/farm-calendar', icon: Calendar, labelKey: 'farmCalendar' as const },
  { to: '/disease-doctor', icon: FlaskConical, labelKey: 'diseaseDoctor' as const },
  { to: '/smart-alerts', icon: Zap, labelKey: 'smartAlerts' as const },
];

const BOTTOM_ITEMS = [
  { to: '/farm-profile', icon: User, labelKey: 'farmProfile' as const },
  { to: '/settings', icon: Settings, labelKey: 'settings' as const },
];

export function Sidebar({ onClose, isOpen }: { onClose?: () => void; isOpen?: boolean }) {
  const { signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} role="navigation" aria-label="Main navigation">
      <div className="sidebar-logo">
        <div className="sidebar-logo-text">
          <Sprout size={22} style={{ color: 'var(--leaf-green-400)' }} />
          Krishi Mithram
        </div>
        <div className="sidebar-logo-sub">കൃഷിമിത്രം</div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main Menu</div>
        {NAV_ITEMS.map(({ to, icon: Icon, labelKey, isComingSoon }) => (
          <NavLink
            key={labelKey}
            to={to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            onClick={handleClick}
          >
            <Icon size={18} />
            <span>{t.nav[labelKey]}</span>
            {isComingSoon && (
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 'bold',
                backgroundColor: 'rgba(253, 224, 71, 0.2)', // muted yellow bg
                color: '#fde047', // soft yellow text
                padding: '2px 6px',
                borderRadius: '4px',
                marginLeft: 'auto',
                whiteSpace: 'nowrap'
              }}>
                Coming Soon
              </span>
            )}
          </NavLink>
        ))}

        <div className="sidebar-section-label" style={{ marginTop: 'var(--space-4)' }}>Account</div>
        {BOTTOM_ITEMS.map(({ to, icon: Icon, labelKey }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            onClick={handleClick}
          >
            <Icon size={18} />
            <span>{t.nav[labelKey]}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button
          className="sidebar-link"
          onClick={handleLogout}
          style={{ width: '100%', color: 'rgba(255,255,255,0.5)' }}
        >
          <LogOut size={18} />
          <span>{t.nav.logout}</span>
        </button>
      </div>
    </aside>
  );
}
