export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 20px', lineHeight: 1.8 }}>
      <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '24px' }}>Privacy Policy — Krishi Mithram</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>Last Updated: 10 August 2026</p>

      <p style={{ marginBottom: '24px' }}>Krishi Mithram (കൃഷിമിത്രം), owned by Thushar K S, respects your privacy.</p>
      
      <p style={{ marginBottom: '24px' }}>We may collect information such as your name, email, phone number, farm details, location, soil information, crop information, farming activities, and AI chat interactions to provide personalized agricultural services.</p>

      <h2 style={{ fontSize: '20px', fontWeight: 700, marginTop: '32px', marginBottom: '16px' }}>Your information may be used for:</h2>
      <ul style={{ paddingLeft: '24px', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <li>Farmer profile management</li>
        <li>Personalized crop recommendations</li>
        <li>AI agricultural assistance</li>
        <li>Weather and market information</li>
        <li>Farm calendar and activities</li>
        <li>Improving the Krishi Mithram platform</li>
      </ul>

      <p style={{ marginBottom: '24px' }}>Krishi Mithram uses Supabase and other necessary third-party services to securely operate the platform. We do not intend to sell your personal information.</p>
      
      <p style={{ marginBottom: '24px' }}>AI-generated agricultural advice may not always be accurate. Important farming decisions should be verified with qualified agricultural professionals.</p>
      
      <p style={{ marginBottom: '24px' }}>Disease Doctor and Smart Alerts are currently under development and marked "Coming Soon / ഉടൻ വരുന്നു."</p>

      <h2 style={{ fontSize: '20px', fontWeight: 700, marginTop: '32px', marginBottom: '16px' }}>You may request access, correction, or deletion of your personal information by contacting:</h2>
      <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
        <p><strong>Thushar K S</strong></p>
        <p>Email: <a href="mailto:thusharks1234@gmail.com" style={{ color: 'var(--agri-green-600)' }}>thusharks1234@gmail.com</a></p>
        <p>Country: India</p>
      </div>

      <p style={{ fontWeight: 600 }}>By using Krishi Mithram, you acknowledge this Privacy Policy.</p>
    </div>
  );
}
