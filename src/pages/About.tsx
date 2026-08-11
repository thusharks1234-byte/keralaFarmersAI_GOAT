import { useLanguage } from '../contexts/LanguageContext';

export default function About() {
  const { t } = useLanguage();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 20px' }}>
      <h1 style={{ fontSize: '40px', fontWeight: 800, textAlign: 'center', marginBottom: '40px' }}>{t.aboutPage.title}</h1>
      
      <div className="card" style={{ padding: '40px' }}>
        <p style={{ fontSize: '18px', lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: '24px' }}>
          {t.aboutPage.p1}
        </p>
        <p style={{ fontSize: '18px', lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: '24px' }}>
          {t.aboutPage.p2}
        </p>
        <p style={{ fontSize: '18px', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
          {t.aboutPage.p3}
        </p>
      </div>
    </div>
  );
}
