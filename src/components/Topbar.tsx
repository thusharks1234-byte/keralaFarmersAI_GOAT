import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { MapPin, Menu, Bell, User, Navigation } from 'lucide-react';
import { useState, useEffect } from 'react';
import { reverseGeocode } from '../hooks/useGeolocation';

export function Topbar({ onMenuClick, pageTitle }: { onMenuClick?: () => void; pageTitle?: string }) {
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [weather, setWeather] = useState<{ temp: number; location: string; isLive?: boolean } | null>(null);

  useEffect(() => {
    const WEATHER_API_URL = import.meta.env.VITE_WEATHER_API_URL || 'https://api.open-meteo.com/v1/forecast';

    const fetchWeatherChip = (lat: number, lng: number, label: string, isLive: boolean = false) => {
      fetch(`${WEATHER_API_URL}?latitude=${lat}&longitude=${lng}&current_weather=true`)
        .then(r => r.json())
        .then(d => {
          setWeather({ temp: Math.round(d.current_weather.temperature), location: label, isLive });
        })
        .catch(() => {});
    };

    const fallbackToFarm = () => {
      const farmStr = localStorage.getItem('km_farm_quick');
      if (farmStr) {
        try {
          const farm = JSON.parse(farmStr);
          if (farm.lat && farm.lng) {
            fetchWeatherChip(farm.lat, farm.lng, farm.district || 'Farm');
          }
        } catch {}
      }
    };

    const fallbackToBrowserGeolocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const locationName = await reverseGeocode(lat, lng);
            fetchWeatherChip(lat, lng, locationName, true);
          },
          () => fallbackToFarm(),
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
        );
      } else {
        fallbackToFarm();
      }
    };

    const tryIpstack = async () => {
      const IPSTACK_KEY = import.meta.env.VITE_IPSTACK_API_KEY;
      if (!IPSTACK_KEY) return false;
      try {
        const res = await fetch(`http://api.ipstack.com/check?access_key=${IPSTACK_KEY}`);
        if (res.ok) {
          const data = await res.json();
          if (data.latitude && data.longitude) {
            fetchWeatherChip(data.latitude, data.longitude, data.city || data.region_name || 'My Location', true);
            return true;
          }
        }
      } catch (err) {
        console.error('IPStack failed:', err);
      }
      return false;
    };

    tryIpstack().then(success => {
      if (!success) {
        fallbackToBrowserGeolocation();
      }
    });
  }, []);

  const getTitle = () => {
    if (pageTitle) return pageTitle;
    const path = location.pathname;
    if (path === '/dashboard') return t.nav.dashboard;
    if (path === '/ai-assistant') return t.nav.aiAssistant;
    if (path === '/crop-advisor') return t.nav.cropAdvisor;
    if (path === '/weather') return t.nav.weather;
    if (path === '/market-prices') return t.nav.marketPrices;
    if (path === '/govt-schemes') return t.nav.govtSchemes;
    if (path === '/farm-calendar') return t.nav.farmCalendar;
    if (path === '/disease-doctor') return t.nav.diseaseDoctor;
    if (path === '/smart-alerts') return t.nav.smartAlerts;
    if (path === '/farm-profile') return t.nav.farmProfile;
    if (path === '/settings') return t.nav.settings;
    return 'Krishi Mithram';
  };

  return (
    <header className="topbar" role="banner">
      <button
        className="btn btn-ghost btn-icon topbar-menu-btn"
        onClick={onMenuClick}
        aria-label="Toggle navigation menu"
        id="menu-btn"
      >
        <Menu size={20} />
      </button>

      <h1 className="topbar-title">{getTitle()}</h1>

      {weather && (
        <div className="topbar-chip" aria-live="polite" aria-label={`Current location: ${weather.location}`}>
          {weather.isLive ? (
            <Navigation size={14} style={{ color: 'var(--agri-green-600)' }} />
          ) : (
            <MapPin size={14} style={{ color: 'var(--agri-green-600)' }} />
          )}
          <span>{weather.location}{weather.isLive ? ' • Live' : ''}</span>
        </div>
      )}

      <div className="lang-switch lang-switch-dark">
        <button
          className={`lang-btn${language === 'en' ? ' active' : ''}`}
          onClick={() => setLanguage('en')}
          aria-pressed={language === 'en'}
        >
          EN
        </button>
        <button
          className={`lang-btn${language === 'ml' ? ' active' : ''}`}
          onClick={() => setLanguage('ml')}
          aria-pressed={language === 'ml'}
        >
          ML
        </button>
      </div>

      <button
        className="btn btn-ghost btn-icon"
        aria-label="Notifications"
        onClick={() => navigate('/smart-alerts')}
      >
        <Bell size={20} />
      </button>

      <button
        className="btn btn-ghost btn-icon"
        aria-label="Profile"
        onClick={() => navigate('/farm-profile')}
        style={{
          background: 'var(--agri-green-600)',
          color: 'white',
          borderRadius: '50%',
          width: '36px',
          height: '36px'
        }}
      >
        <User size={18} />
      </button>
    </header>
  );
}
