import React, { useState, useRef } from 'react';
import { Bot, Upload, AlertCircle, Loader2, Leaf, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { identifyCropDisease } from '../lib/ai-service';

type MLModel = 'coconut' | 'rice' | 'banana';

export default function OurML() {
  const { language } = useLanguage();
  const [selectedModel, setSelectedModel] = useState<MLModel>('coconut');
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const models = [
    { id: 'coconut', name: language === 'ml' ? 'തെങ്ങ് രോഗ നിർണ്ണയം' : 'Coconut Disease Model', desc: language === 'ml' ? 'തെങ്ങിന്റെ ഇലകളിലെയും തടിയിലെയും രോഗങ്ങൾ കണ്ടെത്തുക' : 'Detect diseases from coconut leaves and trunks.' },
    { id: 'rice', name: language === 'ml' ? 'നെല്ല് രോഗ നിർണ്ണയം' : 'Rice Leaf Disease Model', desc: language === 'ml' ? 'നെല്ലിന്റെ ഇലകളിലെ രോഗങ്ങൾ കണ്ടെത്തുക' : 'Detect diseases from rice/paddy leaves.' },
    { id: 'banana', name: language === 'ml' ? 'വാഴ രോഗ നിർണ്ണയം' : 'Banana Disease Model', desc: language === 'ml' ? 'വാഴയിലെ പ്രധാന രോഗങ്ങൾ കണ്ടെത്തുക' : 'Detect diseases from banana plants.' }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(language === 'ml' ? 'ചിത്രത്തിന്റെ വലുപ്പം 5MB ൽ താഴെയായിരിക്കണം' : 'Image size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await identifyCropDisease(image, language, selectedModel);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze the image using the selected model.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 0 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '16px',
          background: 'var(--copper-50)', color: 'var(--copper-600)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Bot size={32} />
        </div>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-serif)' }}>
            {language === 'ml' ? 'ഞങ്ങളുടെ ML മോഡലുകൾ' : 'Our ML Models'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            {language === 'ml' 
              ? 'പ്രത്യേകം തയ്യാറാക്കിയ മെഷീൻ ലേണിംഗ് മോഡലുകൾ ഉപയോഗിച്ച് രോഗങ്ങൾ കണ്ടെത്തുക' 
              : 'Advanced machine learning models for specific crop disease detection.'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '32px' }}>
        {models.map(m => (
          <div 
            key={m.id}
            onClick={() => { setSelectedModel(m.id as MLModel); setResult(null); }}
            className={`card ${selectedModel === m.id ? 'active' : ''}`}
            style={{ 
              padding: '20px', 
              cursor: 'pointer',
              border: selectedModel === m.id ? '2px solid var(--agri-green-500)' : '1px solid var(--border)',
              background: selectedModel === m.id ? 'var(--light-green-100)' : '#fff',
              transition: 'all 0.2s'
            }}
          >
            <Leaf size={24} style={{ color: selectedModel === m.id ? 'var(--agri-green-600)' : 'var(--text-muted)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>{m.name}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{m.desc}</p>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '32px', padding: '32px', textAlign: 'center' }}>
        {!image ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            style={{ 
              border: '2px dashed var(--border)', borderRadius: '16px', padding: '60px 20px', 
              cursor: 'pointer', background: '#FAFAFA', transition: 'all 0.2s' 
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--agri-green-400)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <Upload size={40} style={{ color: 'var(--agri-green-500)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {language === 'ml' ? 'ചിത്രം അപ്‌ലോഡ് ചെയ്യുക' : 'Upload an Image'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '14px' }}>
              {language === 'ml' ? 'ജെപിഇജി അല്ലെങ്കിൽ പിഎൻജി (പരമാവധി 5MB)' : 'JPEG or PNG (Max 5MB)'}
            </p>
          </div>
        ) : (
          <div>
            <div style={{ position: 'relative', display: 'inline-block', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <img src={image} alt="Crop" style={{ maxHeight: '400px', maxWidth: '100%', objectFit: 'contain' }} />
              {!isAnalyzing && !result && (
                <button 
                  onClick={() => { setImage(null); setResult(null); }}
                  className="btn btn-secondary btn-sm"
                  style={{ position: 'absolute', top: '12px', right: '12px' }}
                >
                  {language === 'ml' ? 'മാറ്റുക' : 'Change Image'}
                </button>
              )}
            </div>

            {!result && (
              <div style={{ marginTop: '24px' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  style={{ padding: '12px 32px', fontSize: '16px' }}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                      {language === 'ml' ? 'മോഡൽ പരിശോധിക്കുന്നു...' : 'Running ML Model...'}
                    </>
                  ) : (
                    <>
                      <ImageIcon size={20} />
                      {language === 'ml' ? 'രോഗം കണ്ടെത്തുക' : 'Detect Disease'}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
          accept="image/jpeg,image/png,image/jpg" 
          style={{ display: 'none' }} 
        />
      </div>

      {error && (
        <div style={{ marginTop: '24px', padding: '16px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {result && (
        <div className="card" style={{ marginTop: '32px', padding: '32px', background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Bot size={28} style={{ color: 'var(--agri-green-600)' }} />
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {language === 'ml' ? 'രോഗ നിർണ്ണയ ഫലം' : 'Model Prediction'}
            </h2>
          </div>
          
          <div className="markdown-body" style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '15px' }}
            dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br/>') }}
          />

          <button 
            className="btn btn-outline" 
            onClick={() => { setImage(null); setResult(null); }}
            style={{ marginTop: '24px' }}
          >
            <ArrowRight size={18} /> {language === 'ml' ? 'പുതിയ ചിത്രം പരിശോധിക്കുക' : 'Test Another Image'}
          </button>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
