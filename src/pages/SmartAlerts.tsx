import { useEffect, useState } from 'react';
import { Zap, BellRing, Settings, CloudLightning, TrendingDown, Bug, Loader2, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const MANDI_API_KEY = import.meta.env.VITE_MANDI_API_KEY as string;
const MANDI_API_URL = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${MANDI_API_KEY}&format=json`;

interface Alert {
  id: string;
  type: 'weather' | 'market' | 'pest';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  icon: any;
}

export default function SmartAlerts() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlerts() {
      if (!user) return;
      setLoading(true);
      const newAlerts: Alert[] = [];

      try {
        // 1. Fetch Farm Data for location
        const { data: farm } = await supabase.from('farms').select('latitude, longitude, district').eq('owner_id', user.id).single();
        
        // --- WEATHER ALERTS ---
        if (farm?.latitude && farm?.longitude) {
          try {
            const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${farm.latitude}&longitude=${farm.longitude}&daily=precipitation_sum,temperature_2m_max&timezone=auto`);
            const wData = await wRes.json();
            
            if (wData.daily) {
              const todayPrecip = wData.daily.precipitation_sum[0] || 0;
              const tmrwPrecip = wData.daily.precipitation_sum[1] || 0;
              const maxTemp = wData.daily.temperature_2m_max[0] || 0;

              if (todayPrecip > 20 || tmrwPrecip > 20) {
                newAlerts.push({
                  id: 'weather-rain',
                  type: 'weather',
                  title: language === 'ml' ? 'കനത്ത മഴ മുന്നറിയിപ്പ്' : 'Heavy Rainfall Alert',
                  description: language === 'ml' 
                    ? `നിങ്ങളുടെ പ്രദേശത്ത് (${farm.district || 'Farm'}) കനത്ത മഴ (${Math.max(todayPrecip, tmrwPrecip)}mm) പ്രതീക്ഷിക്കുന്നു. മതിയായ ഡ്രെയിനേജ് ഉറപ്പാക്കുക.` 
                    : `Heavy rainfall (${Math.max(todayPrecip, tmrwPrecip)}mm) expected in your area (${farm.district || 'Farm'}). Ensure proper drainage.`,
                  severity: 'high',
                  icon: CloudLightning
                });
              }

              if (maxTemp > 35) {
                newAlerts.push({
                  id: 'weather-heat',
                  type: 'weather',
                  title: language === 'ml' ? 'അതികഠിനമായ ചൂട്' : 'Extreme Heat Warning',
                  description: language === 'ml'
                    ? `താപനില ${maxTemp}°C വരെ ഉയർന്നേക്കാം. വിളകൾക്ക് ആവശ്യമായ ജലസേചനം നൽകുക.`
                    : `Temperatures may reach ${maxTemp}°C. Ensure adequate irrigation for your crops.`,
                  severity: 'medium',
                  icon: Zap
                });
              }
            }
          } catch (e) {
            console.error('Weather fetch error:', e);
          }
        }

        // --- MARKET ALERTS ---
        try {
          const preferredCrops: string[] = JSON.parse(localStorage.getItem('km_preferred_crops') || '[]');
          if (preferredCrops.length > 0) {
            const cropPromises = preferredCrops.map(crop => 
              fetch(`${MANDI_API_URL}&filters[commodity]=${encodeURIComponent(crop)}&limit=10`)
                .then(r => r.json())
                .catch(() => null)
            );
            
            const results = await Promise.all(cropPromises);
            let foundAny = false;

            results.forEach((mData, index) => {
              const crop = preferredCrops[index];
              if (mData && mData.records && mData.records.length > 0) {
                foundAny = true;
                let highestPrice = 0;
                mData.records.forEach((r: any) => {
                  const price = parseFloat(r.modal_price);
                  if (price > highestPrice) highestPrice = price;
                });

                if (highestPrice > 0) {
                  newAlerts.push({
                    id: `market-${crop}`,
                    type: 'market',
                    title: language === 'ml' ? `${crop} - വില അപ്ഡേറ്റ്` : `${crop} Price Update`,
                    description: language === 'ml'
                      ? `നിങ്ങളുടെ പ്രിയപ്പെട്ട വിളയായ ${crop}-ന് ഇന്ന് മാർക്കറ്റിൽ ₹${highestPrice} വരെ വില ലഭിക്കുന്നുണ്ട്.`
                      : `Your preferred crop ${crop} is trading up to ₹${highestPrice} today.`,
                    severity: 'low',
                    icon: TrendingDown
                  });
                }
              }
            });

            if (!foundAny) {
               newAlerts.push({
                id: `market-no-data`,
                type: 'market',
                title: language === 'ml' ? `മാർക്കറ്റ് അപ്ഡേറ്റുകൾ ലഭ്യമല്ല` : `No Recent Market Data`,
                description: language === 'ml'
                  ? `നിങ്ങൾ തിരഞ്ഞെടുത്ത വിളകൾക്ക് ഇന്നത്തെ മാർക്കറ്റ് വില വിവരങ്ങൾ ലഭ്യമല്ല.`
                  : `No fresh market prices found today for your preferred crops.`,
                severity: 'low',
                icon: TrendingDown
              });
            }
          } else {
            // Tell them to add preferred crops
             newAlerts.push({
                id: `market-setup`,
                type: 'market',
                title: language === 'ml' ? `വിളകൾ തിരഞ്ഞെടുക്കുക` : `Set Preferred Crops`,
                description: language === 'ml'
                  ? `മാർക്കറ്റ് അലർട്ടുകൾ ലഭിക്കാൻ മാർക്കറ്റ് പേജിൽ നിന്ന് നിങ്ങളുടെ പ്രിയപ്പെട്ട വിളകൾ തിരഞ്ഞെടുക്കുക.`
                  : `Go to Market Prices and click the ⭐ icon on crops to get daily price alerts here.`,
                severity: 'low',
                icon: Settings
              });
          }
        } catch (e) {
          console.error('Market fetch error:', e);
        }

        // --- PEST ALERTS ---
        // Simple heuristic alert based on weather
        if (newAlerts.find(a => a.id === 'weather-rain')) {
           newAlerts.push({
            id: 'pest-fungal',
            type: 'pest',
            title: language === 'ml' ? 'ഫംഗസ് രോഗ സാധ്യത' : 'Fungal Disease Risk',
            description: language === 'ml'
              ? `കനത്ത മഴയെ തുടർന്ന് ഉയർന്ന ഈർപ്പം ഫംഗസ് രോഗങ്ങൾക്ക് കാരണമായേക്കാം. ജാഗ്രത പാലിക്കുക.`
              : `High humidity following heavy rains increases the risk of fungal diseases. Please monitor your crops.`,
            severity: 'medium',
            icon: Bug
          });
        }

        setAlerts(newAlerts);

        // Native Browser Notifications
        if (newAlerts.length > 0 && 'Notification' in window) {
          const today = new Date().toDateString();
          const lastNotified = localStorage.getItem('km_last_notified');
          
          if (lastNotified !== today) {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                newAlerts.forEach(alert => {
                  // Only notify high/medium or market alerts to avoid spam
                  if (alert.severity !== 'low' || alert.type === 'market') {
                    new Notification(alert.title, {
                      body: alert.description,
                      icon: '/favicon.ico'
                    });
                  }
                });
                localStorage.setItem('km_last_notified', today);
              }
            });
          }
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAlerts();
  }, [user, language]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'var(--light-green-100)', color: 'var(--agri-green-600)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <Zap size={40} />
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
          {language === 'ml' ? 'സ്മാർട്ട് അലർട്ടുകൾ' : 'Smart Alerts'}
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
          {language === 'ml' 
            ? 'നിങ്ങളുടെ കൃഷിയിടത്തിലെ കാലാവസ്ഥ, മാർക്കറ്റ് വിലകൾ, കീടബാധ എന്നിവയെക്കുറിച്ചുള്ള പ്രധാന മുന്നറിയിപ്പുകൾ.'
            : 'Personalized alerts for weather, market prices, and pest risks based on your farm profile.'}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <Link to="/market-prices" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Star size={16} fill="currentColor" /> {language === 'ml' ? 'വിളകൾ തിരഞ്ഞെടുക്കുക' : 'Manage Preferred Crops'}
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '40px' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--agri-green-600)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>{language === 'ml' ? 'അലർട്ടുകൾ പരിശോധിക്കുന്നു...' : 'Checking for alerts...'}</p>
        </div>
      ) : alerts.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {alerts.map(alert => (
            <div key={alert.id} className="card" style={{ 
              padding: '24px', 
              display: 'flex', 
              gap: '20px', 
              alignItems: 'flex-start',
              borderLeft: `4px solid ${
                alert.severity === 'high' ? 'var(--red-500)' : 
                alert.severity === 'medium' ? 'var(--copper-500)' : 
                'var(--agri-green-500)'
              }`
            }}>
              <div style={{ 
                padding: '12px', 
                borderRadius: '50%', 
                background: alert.severity === 'high' ? '#FEF2F2' : alert.severity === 'medium' ? '#FFFBEB' : '#F0FDF4',
                color: alert.severity === 'high' ? 'var(--red-600)' : alert.severity === 'medium' ? 'var(--copper-600)' : 'var(--agri-green-600)',
              }}>
                <alert.icon size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {alert.title}
                </h3>
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {alert.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', background: '#F8F5EF' }}>
          <BellRing size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {language === 'ml' ? 'പുതിയ അലർട്ടുകൾ ഒന്നുമില്ല' : 'No Active Alerts'}
          </h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            {language === 'ml' ? 'നിങ്ങളുടെ കൃഷിയിടത്തിൽ നിലവിൽ യാതൊരു പ്രശ്നങ്ങളുമില്ല.' : 'Everything looks good! There are no severe weather or market alerts for your farm today.'}
          </p>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
