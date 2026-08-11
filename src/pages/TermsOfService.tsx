export default function TermsOfService() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 20px', lineHeight: 1.8 }}>
      <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '24px' }}>Terms of Service — Krishi Mithram</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>Last Updated: 10 August 2026</p>

      <p style={{ marginBottom: '24px' }}>Krishi Mithram (കൃഷിമിത്രം) is an AI-powered farming assistance platform owned by Thushar K S.</p>
      
      <p style={{ marginBottom: '24px', fontWeight: 600 }}>By using Krishi Mithram, you agree to these Terms.</p>

      <h2 style={{ fontSize: '20px', fontWeight: 700, marginTop: '32px', marginBottom: '16px' }}>The platform may provide:</h2>
      <ul style={{ paddingLeft: '24px', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <li>AI Assistant</li>
        <li>Crop Advisor</li>
        <li>Weather information</li>
        <li>Market prices</li>
        <li>Government schemes</li>
        <li>Farm Calendar</li>
        <li>Farmer Profile</li>
      </ul>

      <p style={{ marginBottom: '24px' }}>AI-generated recommendations are provided for informational and decision-support purposes only and do not guarantee crop yield, disease prevention, profitability, or any particular farming result.</p>
      
      <p style={{ marginBottom: '24px' }}>Weather, market prices, and government-scheme information may come from external sources and may not always be accurate or current.</p>
      
      <p style={{ marginBottom: '24px' }}>Disease Doctor and Smart Alerts are currently Coming Soon / ഉടൻ വരുന്നു and should not be relied upon until officially launched.</p>

      <h2 style={{ fontSize: '20px', fontWeight: 700, marginTop: '32px', marginBottom: '16px' }}>Users must not:</h2>
      <ul style={{ paddingLeft: '24px', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <li>Misuse the platform</li>
        <li>Attempt unauthorized access</li>
        <li>Upload malicious content</li>
        <li>Abuse the AI or APIs</li>
        <li>Access another user's information</li>
        <li>Use the service for unlawful purposes</li>
      </ul>

      <p style={{ marginBottom: '24px', fontWeight: 600 }}>Krishi Mithram may suspend accounts that violate these Terms.</p>

      <p style={{ marginBottom: '32px' }}>The service is provided on an "as is" and "as available" basis to the extent permitted by applicable law.</p>

      <h2 style={{ fontSize: '20px', fontWeight: 700, marginTop: '32px', marginBottom: '16px' }}>For questions:</h2>
      <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
        <p><strong>Thushar K S</strong></p>
        <p>Email: <a href="mailto:thusharks1234@gmail.com" style={{ color: 'var(--agri-green-600)' }}>thusharks1234@gmail.com</a></p>
        <p>India</p>
      </div>

      <p style={{ color: 'var(--text-secondary)' }}>© 2026 Krishi Mithram. All Rights Reserved.</p>
    </div>
  );
}
