import { useLanguage } from '../contexts/LanguageContext';

export default function Features() {
  const { t } = useLanguage();

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '80px 20px' }}>
      <h1 style={{ fontSize: '40px', fontWeight: 800, textAlign: 'center', marginBottom: '60px' }}>{t.featuresPage.title}</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
        <div className="card" style={{ display: 'flex', gap: '40px', alignItems: 'center', padding: '40px' }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>{t.featuresPage.aiTitle}</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '16px' }}>
              {t.featuresPage.aiDesc}
            </p>
          </div>
          <div style={{ flex: 1, background: 'var(--light-green-50)', height: '200px', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px' }}>
            🤖
          </div>
        </div>

        <div className="card" style={{ display: 'flex', gap: '40px', alignItems: 'center', padding: '40px', flexDirection: 'row-reverse' }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>{t.featuresPage.cropTitle}</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '16px' }}>
              {t.featuresPage.cropDesc}
            </p>
          </div>
          <div style={{ flex: 1, background: 'var(--light-green-50)', height: '200px', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px' }}>
            🌱
          </div>
        </div>

        <div className="card" style={{ display: 'flex', gap: '40px', alignItems: 'center', padding: '40px' }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>{t.featuresPage.marketTitle}</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '16px' }}>
              {t.featuresPage.marketDesc}
            </p>
          </div>
          <div style={{ flex: 1, background: 'var(--light-green-50)', height: '200px', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px' }}>
            📈
          </div>
        </div>
      </div>
    </div>
  );
}
