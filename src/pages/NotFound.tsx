import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
      <div>
        <div style={{ fontSize: '72px', marginBottom: '24px' }}>🌾</div>
        <h1 style={{ fontSize: '48px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>404</h1>
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Looks like you've wandered off the farm path.<br/>This page doesn't exist.
        </p>
        <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Home size={18} /> Go Home
        </Link>
      </div>
    </div>
  );
}
