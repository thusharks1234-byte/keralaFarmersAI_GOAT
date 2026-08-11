import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import type { Profile, Farm, SoilData, CropCycle, UserPreferences, Language } from '../types';
import { Save, User, MapPin, FlaskConical, Sprout, Bell, Loader2, Navigation } from 'lucide-react';

export default function FarmProfile() {
  const { user } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const [activeTab, setActiveTab] = useState<'personal'|'farm'|'soil'|'crop'|'prefs'>('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [farm, setFarm] = useState<Partial<Farm>>({});
  const [soil, setSoil] = useState<Partial<SoilData>>({});
  const [crop, setCrop] = useState<Partial<CropCycle>>({});
  const [prefs, setPrefs] = useState<Partial<UserPreferences>>({});

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [pRes, fRes, prefsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('farms').select('*').eq('owner_id', user.id).single(),
        supabase.from('user_preferences').select('*').eq('owner_id', user.id).single(),
      ]);

      if (pRes.data) setProfile(pRes.data);
      if (prefsRes.data) setPrefs(prefsRes.data);

      if (fRes.data) {
        setFarm(fRes.data);
        const [sRes, cRes] = await Promise.all([
          supabase.from('soil_data').select('*').eq('farm_id', fRes.data.id).single(),
          supabase.from('crop_cycles').select('*').eq('farm_id', fRes.data.id).eq('is_current', true).single(),
        ]);
        if (sRes.data) setSoil(sRes.data);
        if (cRes.data) setCrop(cRes.data);
      }
    } catch {
      // It's ok if data doesn't exist yet (first time)
    } finally {
      setLoading(false);
    }
  };

  // Kerala bounding box (approximate)
  const KERALA_BOUNDS = { latMin: 8.0, latMax: 12.9, lngMin: 74.8, lngMax: 77.6 };
  const isInsideKerala = (lat: number, lng: number) =>
    lat >= KERALA_BOUNDS.latMin && lat <= KERALA_BOUNDS.latMax &&
    lng >= KERALA_BOUNDS.lngMin && lng <= KERALA_BOUNDS.lngMax;

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setMessage({ text: 'Geolocation is not supported by your browser.', type: 'error' });
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (!isInsideKerala(lat, lng)) {
          setMessage({ text: 'Your location is Outside kerala Please enter your farm location manually', type: 'error' });
          setDetectingLocation(false);
          return;
        }
        setFarm(prev => ({ ...prev, latitude: lat, longitude: lng }));
        setMessage({ text: '📍 Location detected! Save your profile to apply.', type: 'success' });
        setTimeout(() => setMessage(null), 4000);
        setDetectingLocation(false);
      },
      (err) => {
        const msg = err.code === GeolocationPositionError.PERMISSION_DENIED
          ? 'Location access denied. Please allow it in browser settings.'
          : 'Could not detect location. Please try again.';
        setMessage({ text: msg, type: 'error' });
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const fetchPincodeData = async (pincode: string) => {
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();
      if (data && data[0].Status === 'Success') {
        const postOffice = data[0].PostOffice[0];
        setFarm(prev => ({
          ...prev,
          district: postOffice.District,
          village: prev.village || postOffice.Name
        }));
      }
    } catch (e) {}
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFarm({ ...farm, pincode: val });
    if (val.length === 6) {
      fetchPincodeData(val);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage(null);

    try {
      // 1. Profile
      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: profile.full_name,
        phone: profile.phone,
        preferred_language: profile.preferred_language,
        updated_at: new Date().toISOString(),
      });
      if (profile.preferred_language && profile.preferred_language !== language) {
        setLanguage(profile.preferred_language as Language);
      }

      // 2. Farm
      let farmId = farm.id;
      const farmData = {
        owner_id: user.id,
        farm_name: farm.farm_name,
        district: farm.district,
        village: farm.village,
        pincode: farm.pincode,
        latitude: farm.latitude,
        longitude: farm.longitude,
        area_acres: farm.area_acres,
        farm_type: farm.farm_type,
        updated_at: new Date().toISOString(),
      };

      if (farmId) {
        await supabase.from('farms').update(farmData).eq('id', farmId);
      } else {
        const { data } = await supabase.from('farms').insert(farmData).select('id').single();
        if (data) farmId = data.id;
      }

      // 3. Soil & Crop (only if farm exists)
      if (farmId) {
        const soilData = {
          farm_id: farmId,
          soil_type: soil.soil_type,
          ph: soil.ph,
          nitrogen: soil.nitrogen,
          phosphorus: soil.phosphorus,
          potassium: soil.potassium,
          water_availability: soil.water_availability,
          updated_at: new Date().toISOString(),
        };
        if (soil.id) {
          await supabase.from('soil_data').update(soilData).eq('id', soil.id);
        } else {
          await supabase.from('soil_data').insert(soilData);
        }

        const cropData = {
          farm_id: farmId,
          crop_name: crop.crop_name || 'Unknown',
          is_current: true,
          planting_date: crop.planting_date,
          expected_harvest_date: crop.expected_harvest_date,
          previous_crop: crop.previous_crop,
        };
        if (crop.id) {
          await supabase.from('crop_cycles').update(cropData).eq('id', crop.id);
        } else {
          await supabase.from('crop_cycles').insert(cropData);
        }
      }

      // 4. Preferences
      await supabase.from('user_preferences').upsert({
        owner_id: user.id,
        units: prefs.units || 'metric',
        notifications_enabled: prefs.notifications_enabled ?? true,
        updated_at: new Date().toISOString(),
      });

      setMessage({ text: t.profile.saved, type: 'success' });
      setTimeout(() => setMessage(null), 3000);
      loadData(); // reload to get IDs
    } catch (err: any) {
      setMessage({ text: err.message || t.general.error, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="skeleton skeleton-text" style={{ height: '40px', width: '30%', marginBottom: '24px' }} />
        <div className="skeleton skeleton-card" style={{ height: '600px' }} />
      </div>
    );
  }

  const TABS = [
    { id: 'personal', label: t.profile.personal, icon: User },
    { id: 'farm', label: t.profile.farmDetails, icon: MapPin },
    { id: 'soil', label: t.profile.soilData, icon: FlaskConical },
    { id: 'crop', label: t.profile.cropInfo, icon: Sprout },
    { id: 'prefs', label: t.profile.preferences, icon: Bell },
  ] as const;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="section-title" style={{ marginBottom: '24px' }}>🧑‍🌾 {t.profile.title}</h1>

      {message && (
        <div className={`toast toast-${message.type}`} style={{ position: 'static', marginBottom: '20px', animation: 'none' }}>
          {message.type === 'success' ? '✅' : '⚠️'} {message.text}
        </div>
      )}

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {/* Desktop Tabs / Mobile Accordion headers could go here. Simple tabs for now. */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`tab ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id as typeof activeTab)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 20px', borderRadius: 0, whiteSpace: 'nowrap', borderBottom: activeTab === id ? '2px solid var(--agri-green-600)' : '2px solid transparent' }}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSave} style={{ padding: '32px' }}>
          {activeTab === 'personal' && (
            <div className="grid-2" style={{ gap: '24px' }}>
              <div className="form-group">
                <label className="form-label">{t.profile.fullName}</label>
                <input type="text" className="form-input" value={profile.full_name || ''} onChange={e => setProfile({...profile, full_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">{t.profile.phone}</label>
                <input type="tel" className="form-input" value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">{t.profile.language}</label>
                <select className="form-input form-select" value={profile.preferred_language || 'en'} onChange={e => setProfile({...profile, preferred_language: e.target.value as Language})}>
                  <option value="en">English</option>
                  <option value="ml">മലയാളം</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'farm' && (
            <div className="grid-2" style={{ gap: '24px' }}>
              <div className="form-group">
                <label className="form-label">{t.profile.farmName}</label>
                <input type="text" className="form-input" value={farm.farm_name || ''} onChange={e => setFarm({...farm, farm_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">{t.profile.district}</label>
                <select className="form-input form-select" value={farm.district || ''} onChange={e => setFarm({...farm, district: e.target.value})}>
                  <option value="">Select District...</option>
                  {['Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t.profile.village}</label>
                <input type="text" className="form-input" value={farm.village || ''} onChange={e => setFarm({...farm, village: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">{t.profile.areaAcres}</label>
                <input type="number" step="0.1" className="form-input" value={farm.area_acres || ''} onChange={e => setFarm({...farm, area_acres: parseFloat(e.target.value)})} />
              </div>
              <div className="form-group">
                <label className="form-label">{t.profile.farmType}</label>
                <select className="form-input form-select" value={farm.farm_type || ''} onChange={e => setFarm({...farm, farm_type: e.target.value})}>
                  <option value="">Select Type...</option>
                  <option value="crop">Crop Farming</option>
                  <option value="mixed">Mixed (Crop & Livestock)</option>
                  <option value="orchard">Orchard / Plantation</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input type="text" maxLength={6} className="form-input" value={farm.pincode || ''} onChange={handlePincodeChange} placeholder="Enter 6-digit Pincode" />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Navigation size={14} /> Farm Location (Auto-detected)
                </label>
                {farm.latitude && farm.longitude ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ background: 'var(--light-green-50)', border: '1px solid var(--agri-green-200)', borderRadius: 'var(--radius-md)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--forest-900)', fontWeight: 600 }}>
                      <Navigation size={14} style={{ color: 'var(--agri-green-600)' }} />
                      📍 {farm.latitude.toFixed(4)}°N, {farm.longitude.toFixed(4)}°E
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={detectLocation}
                      disabled={detectingLocation}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                    >
                      {detectingLocation ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Navigation size={14} />}
                      {detectingLocation ? 'Detecting...' : 'Re-detect'}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={detectLocation}
                    disabled={detectingLocation}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content' }}
                  >
                    {detectingLocation ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Navigation size={16} />}
                    {detectingLocation ? 'Detecting location...' : '📍 Detect My Location (for Weather)'}
                  </button>
                )}
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Used for real-time weather. Your coordinates are saved securely.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'soil' && (
            <div className="grid-2" style={{ gap: '24px' }}>
              <div className="form-group">
                <label className="form-label">{t.profile.soilType}</label>
                <select className="form-input form-select" value={soil.soil_type || ''} onChange={e => setSoil({...soil, soil_type: e.target.value})}>
                  <option value="">Select Soil Type...</option>
                  <option value="laterite">Laterite Soil</option>
                  <option value="red laterite">Red Laterite</option>
                  <option value="sandy loam">Sandy Loam</option>
                  <option value="clay loam">Clay Loam</option>
                  <option value="alluvial">Alluvial</option>
                  <option value="forest loam">Forest Loam</option>
                  <option value="kari">Kari (Peaty)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t.profile.ph}</label>
                <input type="number" step="0.1" className="form-input" value={soil.ph || ''} onChange={e => setSoil({...soil, ph: parseFloat(e.target.value)})} placeholder="e.g. 6.5" />
              </div>
              <div className="form-group">
                <label className="form-label">{t.profile.waterAvailability}</label>
                <select className="form-input form-select" value={soil.water_availability || ''} onChange={e => setSoil({...soil, water_availability: e.target.value})}>
                  <option value="">Select Water Source...</option>
                  <option value="rain-fed">Rain-fed</option>
                  <option value="canal">Canal Irrigation</option>
                  <option value="well irrigation">Well / Borewell</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t.profile.nitrogen}</label>
                <input type="number" className="form-input" value={soil.nitrogen || ''} onChange={e => setSoil({...soil, nitrogen: parseInt(e.target.value)})} />
              </div>
              <div className="form-group">
                <label className="form-label">{t.profile.phosphorus}</label>
                <input type="number" className="form-input" value={soil.phosphorus || ''} onChange={e => setSoil({...soil, phosphorus: parseInt(e.target.value)})} />
              </div>
              <div className="form-group">
                <label className="form-label">{t.profile.potassium}</label>
                <input type="number" className="form-input" value={soil.potassium || ''} onChange={e => setSoil({...soil, potassium: parseInt(e.target.value)})} />
              </div>
            </div>
          )}

          {activeTab === 'crop' && (
            <div className="grid-2" style={{ gap: '24px' }}>
              <div className="form-group">
                <label className="form-label required">{t.profile.cropName}</label>
                <input type="text" className="form-input" required value={crop.crop_name || ''} onChange={e => setCrop({...crop, crop_name: e.target.value})} placeholder="e.g. Paddy, Coconut, Banana" />
              </div>
              <div className="form-group">
                <label className="form-label">{t.profile.previousCrop}</label>
                <input type="text" className="form-input" value={crop.previous_crop || ''} onChange={e => setCrop({...crop, previous_crop: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">{t.profile.plantingDate}</label>
                <input type="date" className="form-input" value={crop.planting_date || ''} onChange={e => setCrop({...crop, planting_date: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">{t.profile.harvestDate}</label>
                <input type="date" className="form-input" value={crop.expected_harvest_date || ''} onChange={e => setCrop({...crop, expected_harvest_date: e.target.value})} />
              </div>
            </div>
          )}

          {activeTab === 'prefs' && (
            <div className="grid-2" style={{ gap: '24px' }}>
              <div className="form-group">
                <label className="form-label">{t.profile.units}</label>
                <select className="form-input form-select" value={prefs.units || 'metric'} onChange={e => setPrefs({...prefs, units: e.target.value})}>
                  <option value="metric">Metric (Celsius, kg, mm)</option>
                  <option value="imperial">Imperial (Fahrenheit, lbs, inch)</option>
                </select>
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
                <input type="checkbox" id="notifs" checked={prefs.notifications_enabled ?? true} onChange={e => setPrefs({...prefs, notifications_enabled: e.target.checked})} style={{ width: '20px', height: '20px', accentColor: 'var(--agri-green-600)' }} />
                <div>
                  <label htmlFor="notifs" className="form-label" style={{ marginBottom: 0 }}>{t.profile.notifications}</label>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.settings.notificationsNote}</div>
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
              {t.profile.save}
            </button>
          </div>
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
