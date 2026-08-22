import { useEffect, useState, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getIpstackLocation, reverseGeocodePerfect } from '../hooks/useGeolocation';
import { supabase } from '../lib/supabase';
import { Cloud, Droplets, Wind, Sunrise, AlertTriangle, MapPin, Sprout, Navigation } from 'lucide-react';
import { format, addDays } from 'date-fns';
import type { WeatherData } from '../types';
import { Link } from 'react-router-dom';

const WEATHER_ICONS: Record<number, string> = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️', 51: '🌦️', 53: '🌦️', 55: '🌧️',
  61: '🌧️', 63: '🌧️', 65: '🌧️', 80: '🌦️', 81: '🌧️', 95: '⛈️',
};

const WEATHER_DESC: Record<number, string> = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
  61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain', 80: 'Slight rain showers', 81: 'Moderate rain showers', 95: 'Thunderstorm',
};



// India bounding box (approximate)
const INDIA_BOUNDS = { latMin: 6.5, latMax: 35.5, lngMin: 68.0, lngMax: 97.3 };
const isInsideIndia = (lat: number, lng: number) =>
  lat >= INDIA_BOUNDS.latMin && lat <= INDIA_BOUNDS.latMax &&
  lng >= INDIA_BOUNDS.lngMin && lng <= INDIA_BOUNDS.lngMax;


export default function Weather() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [data, setData] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [guidance, setGuidance] = useState<string>('');
  const [geoStatus, setGeoStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [outsideIndia, setOutsideIndia] = useState(false);

  const fetchWeatherData = useCallback(async (lat: number, lng: number, name: string) => {
    setError('');
    try {
      const WEATHER_API_URL = import.meta.env.VITE_WEATHER_API_URL || 'https://api.open-meteo.com/v1/forecast';
      const res = await fetch(
        `${WEATHER_API_URL}?latitude=${lat}&longitude=${lng}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum` +
        `&timezone=auto`
      );
      if (!res.ok) throw new Error('Failed to fetch weather');

      const json = await res.json();
      const weatherData: WeatherData = {
        current: {
          temperature: json.current.temperature_2m,
          humidity: json.current.relative_humidity_2m,
          windspeed: json.current.wind_speed_10m,
          weathercode: json.current.weather_code,
          apparent_temperature: json.current.apparent_temperature,
          precipitation: json.current.precipitation,
        },
        daily: {
          time: json.daily.time,
          temperature_2m_max: json.daily.temperature_2m_max,
          temperature_2m_min: json.daily.temperature_2m_min,
          weathercode: json.daily.weather_code,
          precipitation_sum: json.daily.precipitation_sum,
          sunrise: json.daily.sunrise,
          sunset: json.daily.sunset,
        }
      };
      setData(weatherData);
      setLocation({ lat, lng, name });

      // Crop-aware guidance
      if (user) {
        const { data: farm } = await supabase.from('farms').select('id').eq('owner_id', user.id).single();
        if (farm) {
          const { data: crop } = await supabase.from('crop_cycles').select('crop_name').eq('farm_id', farm.id).eq('is_current', true).single();
          const heavyRain = json.daily.precipitation_sum.slice(0, 3).some((p: number) => p > 20);
          const isHot = json.current.temperature_2m > 34;
          let guide = "Weather conditions are stable for normal farm operations.";
          if (heavyRain) {
            guide = `Heavy rain expected in the next few days. Consider delaying fertilizer application and ensure proper drainage${crop ? ` for your ${crop.crop_name}` : ''}.`;
          } else if (isHot) {
            guide = `High temperatures currently. Ensure adequate irrigation${crop ? ` for your ${crop.crop_name}` : ''}, preferably during early morning or late evening.`;
          }
          setGuidance(guide);
        }
      }
    } catch {
      setError(t.weather.error);
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  const loadFarmFallback = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const { data: farm } = await supabase.from('farms').select('latitude, longitude, district').eq('owner_id', user.id).single();
      if (farm?.latitude && farm?.longitude) {
        await fetchWeatherData(farm.latitude, farm.longitude, farm.district || 'Farm Location');
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, [user, fetchWeatherData]);

  const requestGeolocation = useCallback(async () => {
    setGeoStatus('requesting');
    setLoading(true);
    setOutsideIndia(false);

    const tryBrowserGeo = () => {
      if (!navigator.geolocation) {
        loadFarmFallback();
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          if (!isInsideIndia(lat, lng)) {
            setGeoStatus('denied');
            setOutsideIndia(true);
            setLoading(false);
            return;
          }
          setGeoStatus('granted');
          const details = await reverseGeocodePerfect(lat, lng);
          
          // Auto-fill District in the database if user exists
          if (user && details.district) {
            try {
              const { data: farm } = await supabase.from('farms').select('id, district, village, pincode').eq('owner_id', user.id).single();
              if (farm && !farm.district) {
                await supabase.from('farms').update({
                  district: details.district,
                  village: farm.village || details.village,
                  pincode: farm.pincode || details.pincode,
                  latitude: lat,
                  longitude: lng
                }).eq('id', farm.id);
              }
            } catch (e) {
              console.warn('Farm auto-update failed', e);
            }
          }
          
          await fetchWeatherData(lat, lng, details.locationName);
        },
        async () => {
          setGeoStatus('denied');
          await loadFarmFallback();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    };

    const ipLocation = await getIpstackLocation();
    if (ipLocation) {
      if (!isInsideIndia(ipLocation.lat, ipLocation.lng)) {
        setGeoStatus('denied');
        setOutsideIndia(true);
        setLoading(false);
        return;
      }
      setGeoStatus('granted');
      await fetchWeatherData(ipLocation.lat, ipLocation.lng, ipLocation.locationName);
    } else {
      tryBrowserGeo();
    }
  }, [fetchWeatherData, loadFarmFallback, user]);



  useEffect(() => {
    requestGeolocation();
  }, [requestGeolocation]);


  if (loading) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="skeleton skeleton-card" style={{ height: '300px', marginBottom: '24px' }} />
        <div className="skeleton skeleton-text" style={{ height: '100px', marginBottom: '24px' }} />
        <div style={{ display: 'flex', gap: '16px' }}>
          {[1,2,3,4,5,6,7].map(i => <div key={i} className="skeleton skeleton-card" style={{ flex: 1, height: '150px' }} />)}
        </div>
      </div>
    );
  }

  // Outside India screen
  if (outsideIndia) {
    return (
      <div style={{ maxWidth: '520px', margin: '60px auto', textAlign: 'center' }}>
        <div style={{
          background: '#fff',
          border: '1px solid rgba(184,115,51,0.2)',
          borderRadius: '20px',
          padding: '48px 40px',
          boxShadow: '0 8px 32px rgba(184,115,51,0.08), 0 2px 10px rgba(11,61,46,0.04)'
        }}>
          <div style={{ fontSize: '72px', marginBottom: '16px', lineHeight: 1 }}>🌍</div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', marginBottom: '12px' }}>
            Currently Available Only in India
          </h2>
          <p style={{ fontSize: '15.5px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '12px' }}>
            <strong style={{ color: 'var(--copper-500)' }}>Krishi Mithram</strong> is specially designed for Indian farmers.
            Your current location is detected <strong style={{ color: 'var(--text-primary)' }}>outside India</strong>.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={requestGeolocation}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Navigation size={16} /> Try Again
            </button>
          </div>
          <div style={{ marginTop: '28px', fontSize: '12.5px', color: 'var(--text-muted)', opacity: 0.8 }}>
            If you are in India and seeing this, please check your browser's location settings.
          </div>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="empty-state" style={{ maxWidth: '480px', margin: '40px auto', background: '#fff', border: '1px solid rgba(213,232,213,0.5)', borderRadius: '20px', padding: '48px 32px', boxShadow: '0 8px 32px rgba(11,61,46,0.05)' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>📍</div>
        <h2 className="empty-state-title" style={{ marginTop: '0', fontFamily: 'var(--font-serif)', fontSize: '24px' }}>
          {geoStatus === 'denied' ? 'Location Access Denied' : 'Location Needed'}
        </h2>
        <p className="empty-state-desc" style={{ marginBottom: '24px' }}>
          {geoStatus === 'denied'
            ? 'Please allow location access in your browser, or set coordinates in your Farm Profile.'
            : 'Allow location access to see real-time weather for your current location.'}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={requestGeolocation} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Navigation size={16} /> Allow Location
          </button>
          <Link to="/farm-profile" className="btn btn-secondary">
            {t.weather.changeLocation}
          </Link>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="empty-state" style={{ maxWidth: '500px', margin: '40px auto' }}>
        <div style={{ color: 'var(--red-500)', marginBottom: '16px' }}><AlertTriangle size={48} /></div>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={requestGeolocation} style={{ marginTop: '16px' }}>{t.weather.retry}</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="section-header">
        <h1 className="section-title">🌤️ {t.weather.title}</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="badge badge-green" style={{ fontSize: '14px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {geoStatus === 'granted' ? <Navigation size={14} /> : <MapPin size={14} />}
            {location.name}
            {geoStatus === 'granted' && <span style={{ fontSize: '10px', opacity: 0.75, marginLeft: '2px' }}>• Live</span>}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={requestGeolocation} title="Re-detect location" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <Navigation size={14} /> Refresh GPS
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="weather-hero" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ fontSize: '80px', lineHeight: 1, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}>
            {WEATHER_ICONS[data.current.weathercode] || '🌤️'}
          </div>
          <div>
            <div className="weather-temp">{Math.round(data.current.temperature)}°C</div>
            <div style={{ fontSize: '18px', fontWeight: 600, opacity: 0.9 }}>
              {WEATHER_DESC[data.current.weathercode] || 'Clear'}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.75, marginTop: '4px' }}>
              Feels like {Math.round(data.current.apparent_temperature)}°C
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 32px', background: 'rgba(0,0,0,0.15)', padding: '20px', borderRadius: 'var(--radius-lg)', backdropFilter: 'blur(8px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Droplets size={24} style={{ opacity: 0.8 }} />
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.7, textTransform: 'uppercase' }}>{t.weather.humidity}</div>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>{data.current.humidity}%</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Wind size={24} style={{ opacity: 0.8 }} />
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.7, textTransform: 'uppercase' }}>{t.weather.windSpeed}</div>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>{data.current.windspeed} km/h</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Cloud size={24} style={{ opacity: 0.8 }} />
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.7, textTransform: 'uppercase' }}>{t.weather.rainfall}</div>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>{data.current.precipitation} mm</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Sunrise size={24} style={{ opacity: 0.8 }} />
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.7, textTransform: 'uppercase' }}>Sun</div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>{format(new Date(data.daily.sunrise[0]), 'h:mm a')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Guidance Banner */}
      {guidance && (
        <div className="guidance-banner" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sprout size={16} style={{ color: 'var(--agri-green-600)' }} />
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-900)' }}>{t.weather.guidance}</h3>
            <span style={{ fontSize: '10px', background: 'var(--white)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              {t.weather.guidanceLabel}
            </span>
          </div>
          <p style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
            {guidance}
          </p>
        </div>
      )}

      {/* 7-Day Forecast */}
      <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
        📅 {t.weather.forecast}
      </h2>
      <div className="forecast-strip">
        {data.daily.time.map((time, i) => (
          <div key={time} className="forecast-day">
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '12px' }}>
              {i === 0 ? 'Today' : format(addDays(new Date(), i), 'EEE, d')}
            </div>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>
              {WEATHER_ICONS[data.daily.weathercode[i]] || '🌤️'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '14px', fontWeight: 700 }}>
              <span style={{ color: 'var(--text-primary)' }}>{Math.round(data.daily.temperature_2m_max[i])}°</span>
              <span style={{ color: 'var(--text-muted)' }}>{Math.round(data.daily.temperature_2m_min[i])}°</span>
            </div>
            {data.daily.precipitation_sum[i] > 0 && (
              <div style={{ fontSize: '11px', color: 'var(--blue-500)', marginTop: '8px', fontWeight: 600 }}>
                💧 {data.daily.precipitation_sum[i]}mm
              </div>
            )}
          </div>
        ))}
      </div>
      
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
