import { Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Support() {
  const { t } = useLanguage();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 20px' }}>
      <h1 style={{ fontSize: '40px', fontWeight: 800, textAlign: 'center', marginBottom: '60px' }}>{t.supportPage.title}</h1>
      
      <div className="grid-2" style={{ gap: '40px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>{t.supportPage.helpTitle}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
            {t.supportPage.helpDesc}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--light-green-100)', color: 'var(--agri-green-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{t.supportPage.email}</div>
                <a href="mailto:thusharks1234@gmail.com" style={{ color: 'var(--text-secondary)' }}>thusharks1234@gmail.com</a>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--light-green-100)', color: 'var(--agri-green-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{t.supportPage.phone}</div>
                <a href="tel:+919591997179" style={{ color: 'var(--text-secondary)' }}>+91 9591 997 179</a>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--light-green-100)', color: 'var(--agri-green-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{t.supportPage.office}</div>
                <div style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>Lakshmi Rental Homes (GOAT TKS){'\n'}4HP7+7F2</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={e => e.preventDefault()}>
            <div className="form-group">
              <label className="form-label">{t.support.name}</label>
              <input type="text" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">{t.support.email}</label>
              <input type="email" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">{t.support.message}</label>
              <textarea className="form-input" rows={4}></textarea>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }}>{t.support.send}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
