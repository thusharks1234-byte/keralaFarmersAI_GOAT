import { useLanguage } from '../contexts/LanguageContext';

export default function BuyFertilisers() {
  const { t } = useLanguage();
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      minHeight: '60vh',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-primary, #333)' }}>
        {t.nav.buyFertilisers}
      </h1>
      <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary, #666)' }}>
        Coming soon
      </p>
    </div>
  );
}
