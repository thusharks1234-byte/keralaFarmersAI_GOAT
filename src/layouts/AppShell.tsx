import { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { MobileBottomNav } from '../components/MobileBottomNav';

export function AppShell() {
  const { session, loading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--forest-900)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌱</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px' }}>Loading Krishi Mithram...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99,
          }}
          aria-hidden="true"
        />
      )}

      <Sidebar onClose={() => setSidebarOpen(false)} isOpen={sidebarOpen} />

      <div className="app-main">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main id="main-content" className="page-content">
          <Outlet />
        </main>
        <MobileBottomNav onMoreClick={() => setSidebarOpen(true)} />
      </div>
    </div>
  );
}
