import { useEffect, useState, useRef, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Search, MapPin, Loader2, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { translateToMalayalam } from '../lib/ai-service';

const MANDI_API_KEY = import.meta.env.VITE_MANDI_API_KEY as string;
const MANDI_API_URL = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${MANDI_API_KEY}&format=json`;

interface MandiRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrival_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
}

const mlDict: Record<string, string> = {
  // Commodities
  'Coconut': 'തേങ്ങ', 'Rubber': 'റബ്ബർ', 'Banana': 'വാഴപ്പഴം', 'Pepper': 'കുരുമുളക്',
  'Arecanut': 'അടയ്ക്ക', 'Rice': 'അരി', 'Paddy': 'നെല്ല്', 'Cardamom': 'ഏലം',
  'Ginger': 'ഇഞ്ചി', 'Turmeric': 'മഞ്ഞൾ', 'Tapioca': 'മരച്ചീനി', 'Coffee': 'കാപ്പി',
  'Tea': 'ചായ', 'Cashewnuts': 'കശുവണ്ടി', 'Nutmeg': 'ജാതിക്ക', 'Cloves': 'ഗ്രാമ്പൂ',
  'Tomato': 'തക്കാളി', 'Onion': 'ഉള്ളി', 'Potato': 'ഉരുളക്കിഴങ്ങ്', 'Green Chilli': 'പച്ചമുളക്',
  'Cabbage': 'ക്യാബേജ്', 'Carrot': 'ക്യാരറ്റ്', 'Brinjal': 'വഴുതന', 'Ladyfinger': 'വെണ്ടയ്ക്ക',
  // States
  'Kerala': 'കേരളം', 'Tamil Nadu': 'തമിഴ്‌നാട്', 'Karnataka': 'കർണാടക',
  // Districts
  'Thiruvananthapuram': 'തിരുവനന്തപുരം', 'Kollam': 'കൊല്ലം', 'Pathanamthitta': 'പത്തനംതിട്ട',
  'Alappuzha': 'ആലപ്പുഴ', 'Kottayam': 'കോട്ടയം', 'Idukki': 'ഇടുക്കി', 'Ernakulam': 'എറണാകുളം',
  'Thrissur': 'തൃശ്ശൂർ', 'Palakkad': 'പാലക്കാട്', 'Malappuram': 'മലപ്പുറം', 'Kozhikode': 'കോഴിക്കോട്',
  'Wayanad': 'വയനാട്', 'Kannur': 'കണ്ണൂർ', 'Kasaragod': 'കാസർഗോഡ്'
};

export default function MarketPrices() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  const [data, setData] = useState<MandiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [dynamicTranslations, setDynamicTranslations] = useState<Record<string, string>>({});

  const translate = (text: string) => {
    if (language !== 'ml' || !text) return text;
    // Check dynamic translations first, then local fallback dictionary
    return dynamicTranslations[text] || mlDict[text] || text;
  };

  const performDynamicTranslation = useCallback(async (records: MandiRecord[]) => {
    if (language !== 'ml' || records.length === 0) return;

    const textsToTranslate = new Set<string>();
    records.forEach(r => {
      [r.commodity, r.market, r.district, r.state, r.variety].forEach(val => {
        if (val && !dynamicTranslations[val] && !mlDict[val]) {
          textsToTranslate.add(val);
        }
      });
    });

    const list = Array.from(textsToTranslate);
    if (list.length === 0) return;

    setTranslating(true);
    try {
      const translations = await translateToMalayalam(list);
      setDynamicTranslations(prev => ({ ...prev, ...translations }));
    } catch (e) {
      console.error("Failed to translate mandi records dynamically:", e);
    } finally {
      setTranslating(false);
    }
  }, [language, dynamicTranslations]);
  
  // Try to pre-fill district from farm profile
  useEffect(() => {
    if (user) {
      supabase.from('farms').select('district').eq('owner_id', user.id).single()
        .then(({ data: farm }) => {
          if (farm?.district) {
            setDistrictFilter(farm.district);
          }
        });
    }
    fetchPrices();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch records (limit 1500 to get a good spread across India if no state is specified)
      const stateParam = stateFilter ? `&filters[state]=${encodeURIComponent(stateFilter)}` : '';
      const res = await fetch(`${MANDI_API_URL}${stateParam}&limit=1500`);
      if (!res.ok) throw new Error('API request failed');
      const json = await res.json();
      if (json.records) {
        setData(json.records);
        // Trigger translation right away if ML is selected
        if (language === 'ml') {
          performDynamicTranslation(json.records);
        }
      } else {
        setData([]);
      }
    } catch {
      setError(t.general.error);
    } finally {
      setLoading(false);
    }
  }, [stateFilter, language, performDynamicTranslation, t.general.error]);

  // Prevent stateFilter effect from firing on initial mount (it already fetches via the user effect)
  const hasMountedRef = useRef(false);

  // When state changes, re-fetch (skip on initial render)
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    fetchPrices();
    setDistrictFilter(''); // reset district when state changes
  }, [fetchPrices, stateFilter]);

  // When language switches to Malayalam, translate existing data
  useEffect(() => {
    if (language === 'ml' && data.length > 0) {
      performDynamicTranslation(data);
    }
  }, [language, data, performDynamicTranslation]);

  const filteredData = data.filter(r => {
    const s = search.toLowerCase();
    const matchesSearch = r.commodity.toLowerCase().includes(s) || r.market.toLowerCase().includes(s);
    const matchesState = stateFilter ? r.state.toLowerCase() === stateFilter.toLowerCase() : true;
    const matchesDistrict = districtFilter ? r.district.toLowerCase() === districtFilter.toLowerCase() : true;
    return matchesSearch && matchesState && matchesDistrict;
  });

  const uniqueStates = Array.from(new Set(data.map(d => d.state))).sort();
  const uniqueDistricts = Array.from(new Set(data.filter(d => !stateFilter || d.state === stateFilter).map(d => d.district))).sort();

  return (
    <div>
      <div className="section-header">
        <h1 className="section-title">📊 {t.nav.marketPrices}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {translating && (
            <span style={{ fontSize: '13px', color: 'var(--copper-500)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              ഭാഷാമാറ്റം ചെയ്യുന്നു...
            </span>
          )}
          <button className="btn btn-ghost btn-icon" onClick={fetchPrices}>
            <Loader2 size={20} style={{ display: loading ? 'block' : 'none', animation: 'spin 1s linear infinite' }} />
            <span style={{ display: loading ? 'none' : 'block' }}>↻</span>
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder={t.market.searchPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <div style={{ minWidth: '200px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={18} style={{ color: 'var(--text-muted)' }} />
            <select
              className="form-input form-select"
              value={stateFilter}
              onChange={e => setStateFilter(e.target.value)}
              style={{ flex: 1 }}
            >
              <option value="">{t.market.allStates}</option>
              {uniqueStates.map(s => (
                <option key={s} value={s}>{translate(s)}</option>
              ))}
            </select>
          </div>
          <div style={{ minWidth: '200px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select
              className="form-input form-select"
              value={districtFilter}
              onChange={e => setDistrictFilter(e.target.value)}
              style={{ flex: 1 }}
            >
              <option value="">{t.market.allDistricts}</option>
              {uniqueDistricts.map(d => (
                <option key={d} value={d}>{translate(d)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton skeleton-card" style={{ height: '80px' }} />)}
        </div>
      ) : error ? (
        <div className="empty-state">
          <p style={{ color: 'var(--red-500)' }}>{error}</p>
          <button className="btn btn-primary" onClick={fetchPrices} style={{ marginTop: '12px' }}>Retry</button>
        </div>
      ) : filteredData.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filteredData.map((item, i) => (
            <div key={i} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>{translate(item.commodity)}</h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <MapPin size={12} /> {translate(item.market)}, {translate(item.district)}
                  </div>
                </div>
                <div className="badge badge-green" style={{ textTransform: 'capitalize' }}>
                  {item.variety || (language === 'ml' ? 'സാധാരണ' : 'Normal')}
                </div>
              </div>

              <div style={{ background: '#F8F5EF', border: '1px solid rgba(213,232,213,0.5)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--copper-500)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
                  {t.market.modalPrice}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--forest-900)', lineHeight: 1 }}>
                    ₹{item.modal_price}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    {t.market.min}: ₹{item.min_price} <br/> {t.market.max}: ₹{item.max_price}
                  </div>
                </div>
              </div>
              
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '12px', textAlign: 'right' }}>
                {t.market.updated}: {item.arrival_date}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state" style={{ background: '#fff', border: '1px solid rgba(213,232,213,0.5)', borderRadius: '20px', padding: '60px 40px', boxShadow: '0 8px 32px rgba(11,61,46,0.05)' }}>
          <div style={{ fontSize: '56px', color: 'var(--text-muted)' }}>🔍</div>
          <h2 style={{ marginTop: '20px', fontSize: '20px', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>{t.market.noPrices}</h2>
          <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>{t.market.tryAdjusting}</p>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
