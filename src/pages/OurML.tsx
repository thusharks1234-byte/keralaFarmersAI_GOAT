import React, { useState, useRef, useEffect } from 'react';
import { Bot, Upload, AlertCircle, Loader2, Leaf, ArrowRight, ImageIcon, Zap, Shield, FlaskConical, CheckCircle2, WifiOff } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ML_API_URL = (import.meta.env.VITE_ML_API_URL as string) || 'http://localhost:8787';

interface PredictionResult {
  crop: string;
  disease: string;
  full_label: string;
  confidence: number;
  severity: string;
  symptoms: string;
  organic_remedy: string;
  chemical_remedy: string;
  prevention: string;
  top5: { label: string; confidence: number }[];
}

type ServerStatus = 'checking' | 'online' | 'offline';

export default function OurML() {
  const { language } = useLanguage();
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<ServerStatus>('checking');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch(`${ML_API_URL}/health`, { signal: AbortSignal.timeout(4000) });
        setServerStatus(res.ok ? 'online' : 'offline');
      } catch {
        setServerStatus('offline');
      }
    };
    checkServer();
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) loadFile(file);
  };

  const loadFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError(language === 'ml' ? 'ചിത്രം 10MB ൽ കൂടരുത്' : 'Image must be under 10MB');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imageFile || serverStatus !== 'online') return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const res = await fetch(`${ML_API_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Prediction failed');
      }

      const data: PredictionResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze the image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityStyle = (severity: string) => ({
    Severe: { bg: '#FEF2F2', border: '#FCA5A5', badgeColor: '#DC2626', badgeBg: '#FEE2E2' },
    Moderate: { bg: '#FFFBEB', border: '#FCD34D', badgeColor: '#B45309', badgeBg: '#FEF3C7' },
    Mild: { bg: '#F0FDF4', border: '#86EFAC', badgeColor: '#16A34A', badgeBg: '#DCFCE7' },
  }[severity] || { bg: '#F8FAFC', border: '#CBD5E1', badgeColor: '#475569', badgeBg: '#F1F5F9' });

  const reset = () => {
    setImage(null);
    setImageFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 0 80px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{
          width: '60px', height: '60px', borderRadius: '16px', flexShrink: 0,
          background: 'linear-gradient(135deg, #16A34A, #0B3D2E)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Bot size={32} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-serif)' }}>
              {language === 'ml' ? 'ഞങ്ങളുടെ ML രോഗ ഡിറ്റക്ടർ' : 'Our ML Disease Detector'}
            </h1>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
              background: serverStatus === 'online' ? '#DCFCE7' : serverStatus === 'offline' ? '#FEE2E2' : '#F1F5F9',
              color: serverStatus === 'online' ? '#15803D' : serverStatus === 'offline' ? '#DC2626' : '#64748B',
            }}>
              {serverStatus === 'online'
                ? <><CheckCircle2 size={12} /> ML Server Online</>
                : serverStatus === 'offline'
                ? <><WifiOff size={12} /> Server Offline</>
                : <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Connecting…</>
              }
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '14px' }}>
            {language === 'ml'
              ? '96.4% കൃത്യത · Coconut, Banana, Rice · 15 രോഗ വർഗ്ഗങ്ങൾ · ഏത് ചെടി എന്ന് പറയേണ്ടതില്ല!'
              : '96.4% Accuracy · 15 Disease Classes · No need to select crop — model identifies automatically!'}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { icon: <Zap size={18} />, label: language === 'ml' ? 'ഒട്ടുമൊത്തം കൃത്യത' : 'Overall Accuracy', value: '96.4%', color: '#16A34A' },
          { icon: <Leaf size={18} />, label: language === 'ml' ? 'വിള കൃത്യത' : 'Crop ID Accuracy', value: '99.7%', color: '#B45309' },
          { icon: <FlaskConical size={18} />, label: language === 'ml' ? 'ആകെ രോഗ ക്ലാസ്' : 'Disease Classes', value: '15', color: '#6366F1' }
        ].map((stat, i) => (
          <div key={i} className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ color: stat.color, display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>{stat.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: stat.color, fontFamily: 'var(--font-serif)' }}>{stat.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Upload / Preview */}
      <div className="card" style={{ padding: '32px' }}>
        {!image ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            style={{
              border: '2px dashed var(--border)', borderRadius: '16px', padding: '60px 20px',
              cursor: 'pointer', background: '#FAFAF8', transition: 'all 0.2s', textAlign: 'center'
            }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--agri-green-400)')}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <Upload size={40} style={{ color: 'var(--agri-green-500)', margin: '0 auto 16px', display: 'block' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {language === 'ml' ? 'ഇലയുടെ / ചെടിയുടെ ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക' : 'Upload or Drag & Drop a Plant Photo'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '14px' }}>
              {language === 'ml' ? 'Coconut, Banana അല്ലെങ്കിൽ Rice — JPEG / PNG · Max 10MB' : 'Coconut, Banana, or Rice leaf/plant — JPEG / PNG · Max 10MB'}
            </p>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-block', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', maxWidth: '100%' }}>
              <img src={image} alt="Crop" style={{ maxHeight: '380px', maxWidth: '100%', objectFit: 'contain', display: 'block' }} />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px', flexWrap: 'wrap' }}>
              <button className="btn btn-outline btn-sm" onClick={reset}>
                {language === 'ml' ? 'ചിത്രം മാറ്റുക' : 'Change Image'}
              </button>
              {!result && (
                <button
                  className="btn btn-primary"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || serverStatus !== 'online'}
                  style={{ padding: '10px 28px', fontSize: '15px' }}
                >
                  {isAnalyzing ? (
                    <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                      {language === 'ml' ? 'ML മോഡൽ പ്രവർത്തിക്കുന്നു...' : 'Analysing with ML Model…'}</>
                  ) : (
                    <><ImageIcon size={18} />
                      {language === 'ml' ? 'രോഗം കണ്ടെത്തുക' : 'Detect Disease'}</>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); }}
          accept="image/*"
          style={{ display: 'none' }}
        />
      </div>

      {/* Server offline notice */}
      {serverStatus === 'offline' && (
        <div style={{ marginTop: '20px', padding: '16px 20px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <WifiOff size={20} style={{ color: '#DC2626', flexShrink: 0 }} />
          <div>
            <p style={{ margin: 0, fontWeight: 600, color: '#991B1B', fontSize: '14px' }}>
              {language === 'ml' ? 'ML സെർവർ ഓഫ്‌ലൈൻ ആണ്' : 'ML Server is currently offline'}
            </p>
            <p style={{ margin: '4px 0 0 0', color: '#B91C1C', fontSize: '13px' }}>
              {language === 'ml' ? 'ദയവായി കുറച്ചു നേരം കഴിഞ്ഞ് വീണ്ടും ശ്രമിക്കുക.' : 'The prediction service is starting up. Please try again in a moment.'}
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ marginTop: '24px', padding: '16px 20px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '12px', color: '#DC2626' }}>
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ margin: 0, fontSize: '14px' }}>{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (() => {
        const s = getSeverityStyle(result.severity);
        return (
          <div style={{ marginTop: '32px' }}>
            <div className="card" style={{ padding: '32px', background: s.bg, border: `2px solid ${s.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '28px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    {language === 'ml' ? 'ML മോഡൽ പ്രവചനം' : 'ML Model Prediction'}
                  </div>
                  <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-serif)' }}>
                    {result.crop} — {result.disease}
                  </h2>
                  <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {language === 'ml' ? 'ആത്മവിശ്വാസം' : 'Confidence'}:{' '}
                    <strong style={{ color: s.badgeColor }}>{result.confidence}%</strong>
                  </p>
                </div>
                <span style={{ padding: '6px 18px', borderRadius: '999px', fontWeight: 700, fontSize: '13px', background: s.badgeBg, color: s.badgeColor }}>
                  {result.severity}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                {[
                  { icon: '🔬', label: language === 'ml' ? 'ലക്ഷണങ്ങൾ' : 'Symptoms', text: result.symptoms },
                  { icon: '🌿', label: language === 'ml' ? 'ജൈവ പ്രതിവിധി' : 'Organic Remedy', text: result.organic_remedy },
                  { icon: '⚗️', label: language === 'ml' ? 'രാസ പ്രതിവിധി' : 'Chemical Remedy', text: result.chemical_remedy },
                  { icon: '🛡️', label: language === 'ml' ? 'പ്രതിരോധ നടപടികൾ' : 'Prevention', text: result.prevention },
                ].map(({ icon, label, text }) => (
                  <div key={label}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {icon} {label}
                    </h4>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top-5 bar chart */}
            <div className="card" style={{ marginTop: '20px', padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
                {language === 'ml' ? 'ടോപ്പ് 5 പ്രവചനങ്ങൾ' : 'Top 5 Predictions'}
              </h3>
              {result.top5.map((item, i) => (
                <div key={i} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: i === 0 ? 700 : 400, color: i === 0 ? 'var(--agri-green-700)' : 'var(--text-secondary)' }}>
                      {i === 0 && '✓ '}{item.label}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: i === 0 ? 'var(--agri-green-600)' : 'var(--text-muted)' }}>
                      {item.confidence.toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ height: '7px', background: '#E5E7EB', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.max(item.confidence, 0.5)}%`,
                      background: i === 0 ? 'linear-gradient(90deg, #16A34A, #22C55E)' : '#CBD5E1',
                      borderRadius: '99px',
                      transition: 'width 1s ease'
                    }} />
                  </div>
                </div>
              ))}
            </div>

            <button className="btn btn-outline" onClick={reset} style={{ marginTop: '20px' }}>
              <ArrowRight size={18} /> {language === 'ml' ? 'പുതിയ ചിത്രം പരിശോധിക്കുക' : 'Analyse Another Image'}
            </button>
          </div>
        );
      })()}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
