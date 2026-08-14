import { NavLink } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { LayoutDashboard, Bot, Leaf, Cloud, TrendingUp, MoreHorizontal } from 'lucide-react';

const BOTTOM_NAV = [
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' as const },
  { to: '/ai-assistant', icon: Bot, labelKey: 'aiAssistant' as const },
  { to: '/crop-advisor', icon: Leaf, labelKey: 'cropAdvisor' as const },
  { to: '/weather', icon: Cloud, labelKey: 'weather' as const },
  { to: '/market-prices', icon: TrendingUp, labelKey: 'marketPrices' as const },
];

export function MobileBottomNav({ onMoreClick }: { onMoreClick?: () => void }) {
  const { t } = useLanguage();

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      <div className="mobile-nav-items">
        {BOTTOM_NAV.map(({ to, icon: Icon, labelKey }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={22} />
            <span>{t.nav[labelKey].split(' ')[0]}</span>
          </NavLink>
        ))}
        <div className="mobile-nav-item" onClick={onMoreClick}>
          <MoreHorizontal size={22} />
          <span>More</span>
        </div>
      </div>
    </nav>
  );
}
