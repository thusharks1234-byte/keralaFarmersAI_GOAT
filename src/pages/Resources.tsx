import { ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Resources() {
  const { t } = useLanguage();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 20px' }}>
      <h1 style={{ fontSize: '40px', fontWeight: 800, textAlign: 'center', marginBottom: '60px' }}>{t.resourcesPage.title}</h1>
      
      <div className="grid-2" style={{ gap: '24px' }}>
        <a href="http://www.keralaagriculture.gov.in/" target="_blank" rel="noopener noreferrer" className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>{t.resourcesPage.deptTitle} <ExternalLink size={16} /></h3>
          <p style={{ color: 'var(--text-secondary)' }}>{t.resourcesPage.deptDesc}</p>
        </a>

        <a href="http://www.kau.in/" target="_blank" rel="noopener noreferrer" className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>{t.resourcesPage.kauTitle} <ExternalLink size={16} /></h3>
          <p style={{ color: 'var(--text-secondary)' }}>{t.resourcesPage.kauDesc}</p>
        </a>

        <a href="https://vfarm.kerala.gov.in/" target="_blank" rel="noopener noreferrer" className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>{t.resourcesPage.vfpckTitle} <ExternalLink size={16} /></h3>
          <p style={{ color: 'var(--text-secondary)' }}>{t.resourcesPage.vfpckDesc}</p>
        </a>
      </div>
    </div>
  );
}
