import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { getCropRecommendations } from '../lib/crop-rules';
import type { Farm, SoilData, CropCycle, CropRecommendation } from '../types';
import { Sprout, MapPin, Droplets, FlaskConical, AlertCircle, Edit3, Loader2 } from 'lucide-react';

export default function CropAdvisor() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [farm, setFarm] = useState<Farm | null>(null);
  const [soil, setSoil] = useState<SoilData | null>(null);
  const [, setCrop] = useState<CropCycle | null>(null);
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [loading, setLoading] = useState(true);



  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: f } = await supabase.from('farms').select('*').eq('owner_id', user.id).single();
      if (f) {
        setFarm(f);
        const [soilRes, cropRes] = await Promise.all([
          supabase.from('soil_data').select('*').eq('farm_id', f.id).single(),
          supabase.from('crop_cycles').select('*').eq('farm_id', f.id).eq('is_current', true).single(),
        ]);
        setSoil(soilRes.data);
        setCrop(cropRes.data);

        // Generate recommendations
        const recs = getCropRecommendations({
          district: f.district,
          soilType: soilRes.data?.soil_type,
          ph: soilRes.data?.ph,
          waterAvailability: soilRes.data?.water_availability,
          previousCrop: cropRes.data?.previous_crop,
          farmType: f.farm_type,
        });
        setRecommendations(recs);
      }
    } catch {
      // Handles no farm gracefully via farm === null
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [user, loadData]);

  if (loading) {
    return (
      <div className="crop-advisor-layout">
        <div><div className="skeleton skeleton-card" style={{ height: '400px' }} /></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1,2,3].map(i => <div key={i} className="skeleton skeleton-card" style={{ height: '160px' }} />)}
        </div>
      </div>
    );
  }

  if (!farm || (!soil?.soil_type && !farm.district)) {
    return (
      <div className="empty-state" style={{ maxWidth: '500px', margin: '40px auto', background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
        <div className="empty-state-icon" style={{ fontSize: '48px', color: 'var(--agri-green-600)' }}><Sprout /></div>
        <h2 className="empty-state-title" style={{ marginTop: '16px' }}>Farm Data Needed</h2>
        <p className="empty-state-desc" style={{ marginBottom: '24px' }}>{t.cropAdvisor.noProfile}</p>
        <Link to="/farm-profile" className="btn btn-primary">
          <Edit3 size={16} /> Complete Farm Profile
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="section-header">
        <h1 className="section-title">🌱 {t.cropAdvisor.title}</h1>
        <button className="btn btn-secondary btn-sm" onClick={loadData}>
          <Loader2 size={14} style={{ display: loading ? 'block' : 'none', animation: 'spin 1s linear infinite' }} />
          {t.cropAdvisor.recompute}
        </button>
      </div>

      <div className="crop-advisor-layout">
        {/* Farm Details Panel */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="card" style={{ position: 'sticky', top: '80px' }}>
            <div className="card-header" style={{ marginBottom: '20px' }}>
              <h2 className="card-title" style={{ fontSize: '16px' }}>{t.cropAdvisor.yourFarm}</h2>
              <Link to="/farm-profile" className="btn btn-ghost btn-icon" title={t.cropAdvisor.editProfile}>
                <Edit3 size={16} />
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--light-green-100)', color: 'var(--agri-green-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>LOCATION</div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{farm.district || 'Not specified'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--light-green-100)', color: 'var(--agri-green-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sprout size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>SOIL TYPE</div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{soil?.soil_type || 'Not specified'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--light-green-100)', color: 'var(--agri-green-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FlaskConical size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>SOIL pH</div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{soil?.ph || 'Not tested'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--light-green-100)', color: 'var(--agri-green-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Droplets size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>WATER</div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{soil?.water_availability || 'Not specified'}</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={14} /> Based on deterministic crop rules
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
            {t.cropAdvisor.recommendations}
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recommendations.length > 0 ? recommendations.map((rec, i) => (
              <div key={rec.cropName} className="card animate-fade-in" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'flex-start', position: 'relative', overflow: 'hidden', animationDelay: `${0.1 + i * 0.05}s` }}>
                {i === 0 && (
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--agri-green-600)' }} />
                )}
                <div style={{ fontSize: '48px', lineHeight: 1, background: 'var(--light-green-50)', padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                  {rec.cropEmoji}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>{rec.cropName}</h3>
                      {i === 0 && <span className="badge badge-green" style={{ marginTop: '4px' }}>Top Match</span>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: rec.suitabilityPercent > 80 ? 'var(--agri-green-600)' : 'var(--golden-paddy-500)' }}>
                        {rec.suitabilityPercent}%
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{t.cropAdvisor.suitability}</div>
                    </div>
                  </div>

                  <div className="suitability-bar" style={{ marginBottom: '20px' }}>
                    <div className="suitability-fill" style={{ width: `${rec.suitabilityPercent}%`, background: rec.suitabilityPercent > 80 ? '' : 'var(--golden-paddy-500)' }} />
                  </div>

                  <div className="grid-2" style={{ marginBottom: '16px' }}>
                    <div style={{ background: 'var(--cream-50)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>{t.cropAdvisor.waterReq}</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{rec.waterRequirement}</div>
                    </div>
                    <div style={{ background: 'var(--cream-50)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>{t.cropAdvisor.growingPeriod}</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{rec.growingPeriod}</div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px' }}>{t.cropAdvisor.topReasons}:</div>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {rec.reasons.map((r, ri) => (
                        <li key={ri} style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                          <span style={{ color: 'var(--leaf-green-400)' }}>✓</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )) : (
              <div className="empty-state">
                <p>No crops match your current profile criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
