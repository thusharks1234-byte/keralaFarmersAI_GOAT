import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import type { Farm, FarmActivity, FarmTask } from '../types';
import {
  Cloud, Leaf, Plus, MapPin, ArrowRight, Clock,
  Sprout, Calendar, Activity, Bot, FlaskConical, TrendingUp, Landmark
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

const WEATHER_CODE_ICON: Record<number, string> = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️', 51: '🌦️', 53: '🌦️', 55: '🌧️',
  61: '🌧️', 63: '🌧️', 65: '🌧️', 80: '🌦️', 81: '🌧️', 95: '⛈️',
};

function WeatherCard({ lat, lng }: { lat: number; lng: number }) {
  const { t } = useLanguage();
  const [data, setData] = useState<{ temp: number; code: number; humidity: number } | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const WEATHER_API_URL = import.meta.env.VITE_WEATHER_API_URL || 'https://api.open-meteo.com/v1/forecast';

    const fetchWeather = (latitude: number, longitude: number) => {
      fetch(`${WEATHER_API_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,relative_humidity_2m`)
        .then(r => r.json())
        .then(d => {
          setData({
            temp: Math.round(d.current.temperature_2m),
            code: d.current.weather_code,
            humidity: d.current.relative_humidity_2m ?? 70,
          });
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    };

    // 1. Try browser geolocation first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(lat, lng), // fallback to farm coords
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
      );
    } else {
      fetchWeather(lat, lng);
    }
  }, [lat, lng]);

  if (loading) return <div className="skeleton skeleton-card" />;
  if (error) return (
    <div className="card stat-card" style={{ borderLeft: '4px solid var(--red-500)' }}>
      <div style={{ fontSize: '13px', color: 'var(--red-500)' }}>⚠️ {t.weather.error}</div>
    </div>
  );

  const icon = WEATHER_CODE_ICON[data!.code] || '🌤️';

  return (
    <div className="card stat-card" style={{ background: 'linear-gradient(135deg, var(--forest-900), var(--agri-green-600))', border: 'none', color: 'white' }}>
      <div className="card-header" style={{ marginBottom: '12px' }}>
        <span style={{ fontSize: '14px', fontWeight: 700, opacity: 0.85 }}>☁ {t.dashboard.todaysWeather}</span>
        <Link to="/weather" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {t.dashboard.viewFullForecast} <ArrowRight size={12} />
        </Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
        <div style={{ fontSize: '54px', lineHeight: 1 }}>{icon}</div>
        <div>
          <div style={{ fontSize: '42px', fontWeight: 800, lineHeight: 1 }}>{data!.temp}°C</div>
          <div style={{ fontSize: '13px', opacity: 0.75, marginTop: '4px' }}>💧 {t.weather.humidity}: {data!.humidity}%</div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [farm, setFarm] = useState<Farm | null>(null);
  const [activities, setActivities] = useState<FarmActivity[]>([]);
  const [tasks, setTasks] = useState<FarmTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCrop, setCurrentCrop] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      // Parallel fetch
      const [farmRes, activitiesRes] = await Promise.all([
        supabase.from('farms').select('*').eq('owner_id', user!.id).single(),
        supabase.from('farm_activities').select('*').order('created_at', { ascending: false }).limit(5),
      ]);

      const farmData = farmRes.data;
      setFarm(farmData);

      if (farmData) {
        // Cache farm quick info for topbar
        localStorage.setItem('km_farm_quick', JSON.stringify({
          district: farmData.district,
          lat: farmData.latitude,
          lng: farmData.longitude,
        }));

        const [tasksRes, cropRes] = await Promise.all([
          supabase.from('farm_tasks')
            .select('*')
            .eq('farm_id', farmData.id)
            .eq('status', 'pending')
            .order('due_date', { ascending: true })
            .limit(5),
          supabase.from('crop_cycles')
            .select('crop_name')
            .eq('farm_id', farmData.id)
            .eq('is_current', true)
            .single(),
        ]);
        setTasks(tasksRes.data || []);
        setCurrentCrop(cropRes.data?.crop_name ?? null);
      }

      setActivities(activitiesRes.data || []);
    } catch {
      // Partial failure is ok
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadDashboard();
  }, [user, loadDashboard]);

  const QUICK_ACCESS = [
    { to: '/ai-assistant', icon: <Bot size={28} strokeWidth={1.5} style={{ color: 'var(--agri-green-600)' }} />, label: t.nav.aiAssistant, disabled: false },
    { to: '/crop-advisor', icon: <Leaf size={28} strokeWidth={1.5} style={{ color: 'var(--leaf-green-500)' }} />, label: t.nav.cropAdvisor, disabled: false },
    { to: '/disease-doctor', icon: <FlaskConical size={28} strokeWidth={1.5} style={{ color: 'var(--blue-500)' }} />, label: t.nav.diseaseDoctor, disabled: false },
    { to: '/market-prices', icon: <TrendingUp size={28} strokeWidth={1.5} style={{ color: 'var(--copper-500)' }} />, label: t.nav.marketPrices, disabled: false },
    { to: '/govt-schemes', icon: <Landmark size={28} strokeWidth={1.5} style={{ color: 'var(--forest-600)' }} />, label: t.nav.govtSchemes, disabled: false },
  ];

  const TASK_CAT_COLORS: Record<string, string> = {
    irrigation: '#1976D2', fertilizer: '#2E7D32', pest_control: '#D64545',
    weeding: '#F57C00', harvest: '#D4A72C', other: '#7A8E7A',
  };

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <div className="skeleton skeleton-text" style={{ height: '32px', width: '40%' }} />
          <div className="skeleton skeleton-text" style={{ height: '16px', width: '25%', marginTop: '8px' }} />
        </div>
        <div className="dashboard-top-row">
          {[1,2,3].map(i => <div key={i} className="skeleton skeleton-card" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>
          🌾 {t.dashboard.welcome}!
        </h1>
        {farm?.farm_name && (
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={14} /> {farm.farm_name}, {farm.district}
            {currentCrop && <> · <Leaf size={14} /> {currentCrop}</>}
          </p>
        )}
      </div>

      <div className="dashboard-grid">
        {/* Top Row */}
        <div className="dashboard-top-row">
          {/* Farm Overview */}
          <div className="card stat-card">
            <div className="card-header">
              <span className="card-title"><Sprout size={16} style={{ color: 'var(--agri-green-600)' }} /> {t.dashboard.farmOverview}</span>
              <Link to="/farm-profile" style={{ fontSize: '12px', color: 'var(--agri-green-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {t.dashboard.viewFullProfile} <ArrowRight size={12} />
              </Link>
            </div>
            {farm ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    { label: t.profile.district, value: farm.district || t.general.unknown },
                    { label: t.profile.areaAcres, value: farm.area_acres ? `${farm.area_acres} acres` : t.general.unknown },
                    { label: t.profile.farmType, value: farm.farm_type || t.general.unknown },
                    { label: t.profile.experience, value: farm.farming_experience_years ? `${farm.farming_experience_years} yrs` : t.general.unknown },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
                    </div>
                  ))}
                </div>
                {currentCrop && (
                  <div style={{ marginTop: '4px', padding: '8px 12px', background: 'var(--light-green-100)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Leaf size={14} style={{ color: 'var(--agri-green-600)' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--agri-green-600)' }}>Current: {currentCrop}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '20px 0' }}>
                <div className="empty-state-icon" style={{ fontSize: '32px' }}>🌾</div>
                <p className="empty-state-desc" style={{ fontSize: '13px' }}>{t.dashboard.noFarm}</p>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/farm-profile')}>
                  <Plus size={14} /> {t.dashboard.addFarm}
                </button>
              </div>
            )}
          </div>

          {/* Today's Weather */}
          {farm?.latitude && farm?.longitude ? (
            <WeatherCard lat={farm.latitude} lng={farm.longitude} />
          ) : (
            <div className="card stat-card">
              <div className="card-header">
                <span className="card-title"><Cloud size={16} style={{ color: 'var(--blue-500)' }} /> {t.dashboard.todaysWeather}</span>
              </div>
              <div className="empty-state" style={{ padding: '20px 0' }}>
                <div style={{ fontSize: '32px' }}>🌤️</div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>{t.weather.noLocation}</p>
                <button className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }} onClick={() => navigate('/farm-profile')}>
                  Set Location
                </button>
              </div>
            </div>
          )}

          {/* Smart Alert */}
          <div className="card stat-card" style={{ background: 'var(--cream-100)', border: '1px dashed var(--border-strong)', position: 'relative', overflow: 'hidden' }}>
            <div className="card-header">
              <span className="card-title">🔔 {t.dashboard.smartAlert}</span>
            </div>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '36px', opacity: 0.3 }}>🔔</div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.5 }}>
                Proactive farm alerts are active for heavy rain, pest risks, and price changes.
              </p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: '12px' }} onClick={() => navigate('/smart-alerts')}>
                View Alerts
              </button>
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h2 className="card-title" style={{ marginBottom: '16px' }}>⚡ {t.dashboard.quickAccess}</h2>
          <div className="quick-access-grid">
            {QUICK_ACCESS.map(({ to, icon, label, disabled }) => (
              <button
                key={to}
                className={`quick-tile${disabled ? ' disabled' : ''}`}
                onClick={() => !disabled && navigate(to)}
                aria-label={label}
                title={disabled ? `${label} — Coming Soon` : label}
              >
                <div className="quick-tile-icon">{icon}</div>
                <div className="quick-tile-label">{label}</div>
                {disabled && (
                  <span style={{ fontSize: '9px', background: 'var(--golden-paddy-500)', color: 'var(--forest-900)', padding: '1px 5px', borderRadius: '99px', fontWeight: 700 }}>
                    SOON
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="dashboard-bottom-row">
          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title"><Activity size={16} style={{ color: 'var(--agri-green-600)' }} /> {t.dashboard.recentActivity}</h2>
            </div>
            {activities.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activities.map(act => (
                  <div key={act.id} style={{
                    display: 'flex', gap: '10px', alignItems: 'flex-start',
                    padding: '10px 12px', background: 'var(--light-green-50)',
                    borderRadius: 'var(--radius-md)',
                  }}>
                    <span style={{ fontSize: '18px' }}>🌱</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{act.activity_type}</div>
                      {act.description && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{act.description}</div>}
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {format(parseISO(act.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '20px 0' }}>
                <div className="empty-state-icon" style={{ fontSize: '32px' }}>📋</div>
                <p className="empty-state-desc" style={{ fontSize: '13px' }}>{t.dashboard.noActivities}</p>
              </div>
            )}
          </div>

          {/* Upcoming Tasks */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title"><Calendar size={16} style={{ color: 'var(--agri-green-600)' }} /> {t.dashboard.upcomingTasks}</h2>
              <Link to="/farm-calendar" style={{ fontSize: '12px', color: 'var(--agri-green-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {t.dashboard.viewCalendar} <ArrowRight size={12} />
              </Link>
            </div>
            {tasks.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tasks.map(task => (
                  <div key={task.id} style={{
                    display: 'flex', gap: '10px', alignItems: 'center',
                    padding: '10px 12px', background: 'var(--light-green-50)',
                    borderRadius: 'var(--radius-md)',
                  }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                      background: TASK_CAT_COLORS[task.category] || 'var(--text-muted)',
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{task.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Clock size={10} /> {format(parseISO(task.due_date), 'MMM d')}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '11px', padding: '2px 8px', borderRadius: '99px',
                      background: TASK_CAT_COLORS[task.category] + '20',
                      color: TASK_CAT_COLORS[task.category],
                      fontWeight: 600, textTransform: 'capitalize',
                    }}>
                      {task.category.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '20px 0' }}>
                <div className="empty-state-icon" style={{ fontSize: '32px' }}>📅</div>
                <p className="empty-state-desc" style={{ fontSize: '13px' }}>{t.dashboard.noTasks}</p>
                <button className="btn btn-primary btn-sm" style={{ marginTop: '12px' }} onClick={() => navigate('/farm-calendar')}>
                  <Plus size={14} /> {t.calendar.addTask}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
