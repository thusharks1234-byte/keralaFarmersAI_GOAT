import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Search, ShoppingCart, Leaf, AlertCircle, CheckCircle2 } from 'lucide-react';

const fertilizerDb = [
  {
    id: "f1",
    nameEn: "Bharat Urea (45kg)",
    nameMl: "ഭാരത് യൂറിയ (45kg)",
    price: 266.50,
    stock: 120,
    schemeEn: "PM-PRANAM Subsidized",
    schemeMl: "പി.എം-പ്രണാം സബ്സിഡി",
    type: "Nitrogenous",
    tag: "PM-PRANAM",
    externalLink: "https://dbtfert.nic.in/",
    imageUrl: "https://placehold.co/600x400/ecfdf5/065f46?text=Bharat+Urea"
  },
  {
    id: "f2",
    nameEn: "FACTAMFOS 20:20:0:13 (50kg)",
    nameMl: "ഫാക്ടംഫോസ് (50kg)",
    price: 1200.00,
    stock: 45,
    schemeEn: "FACT Kerala Distribution",
    schemeMl: "ഫാക്ട് കേരള വിതരണം",
    type: "Complex",
    tag: "FACT Kerala",
    externalLink: "https://fact.co.in/",
    imageUrl: "https://placehold.co/600x400/ecfdf5/065f46?text=FACTAMFOS"
  },
  {
    id: "f3",
    nameEn: "Bharat DAP (50kg)",
    nameMl: "ഭാരത് ഡി.എ.പി (50kg)",
    price: 1350.00,
    stock: 0,
    schemeEn: "One Nation One Fertilizer",
    schemeMl: "ഒരു രാജ്യം ഒരു വളം",
    type: "Phosphatic",
    tag: "Subsidized",
    externalLink: "https://dbtfert.nic.in/",
    imageUrl: "https://placehold.co/600x400/fee2e2/991b1b?text=Out+of+Stock"
  },
  {
    id: "f4",
    nameEn: "Bharat MOP (50kg)",
    nameMl: "ഭാരത് എം.ഒ.പി (50kg)",
    price: 1700.00,
    stock: 80,
    schemeEn: "Govt Import Subsidy",
    schemeMl: "സർക്കാർ ഇറക്കുമതി സബ്സിഡി",
    type: "Potassic",
    tag: "Import Subsidy",
    externalLink: "https://dbtfert.nic.in/",
    imageUrl: "https://placehold.co/600x400/ecfdf5/065f46?text=Bharat+MOP"
  },
  {
    id: "f5",
    nameEn: "Bharat NPK 10:26:26 (50kg)",
    nameMl: "ഭാരത് NPK (50kg)",
    price: 1470.00,
    stock: 25,
    schemeEn: "PMBJP Scheme",
    schemeMl: "പി.എം.ബി.ജെ.പി പദ്ധതി",
    type: "Complex",
    tag: "PMBJP",
    externalLink: "https://dbtfert.nic.in/",
    imageUrl: "https://placehold.co/600x400/ecfdf5/065f46?text=Bharat+NPK"
  },
  {
    id: "f6",
    nameEn: "Organic Bio-Fertilizer (PKVY)",
    nameMl: "ജൈവ വളം (PKVY)",
    price: 250.00,
    stock: 150,
    schemeEn: "Kerala Krishi Bhavan 50% Subsidy",
    schemeMl: "കൃഷിഭവൻ 50% സബ്സിഡി",
    type: "Organic",
    tag: "Kerala Govt",
    externalLink: "https://keralaagriculture.gov.in/",
    imageUrl: "https://placehold.co/600x400/ecfdf5/065f46?text=Bio-Fertilizer"
  }
];

export default function FertilizersMarket() {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const isMl = language === 'ml';

  const filteredFertilizers = fertilizerDb.filter(f => {
    const term = searchTerm.toLowerCase();
    const nameMatch = f.nameEn.toLowerCase().includes(term) || f.nameMl.includes(term);
    const typeMatch = f.type.toLowerCase().includes(term);
    return nameMatch || typeMatch;
  });

  return (
    <div className="page-container" style={{ padding: 'var(--space-4)', maxWidth: '1200px', margin: '0 auto' }}>
      <header className="page-header bg-green-800 shadow-md p-6 rounded-xl mb-6">
        <h1 className="text-white text-2xl font-bold flex items-center gap-2">
          <Leaf size={28} className="text-white" />
          {isMl ? 'സർക്കാർ വളം വിപണി' : 'Government Fertilizers Marketplace'}
        </h1>
        <p className="text-white opacity-90 mt-2">
          {isMl ? 'സബ്സിഡി നിരക്കിൽ വളങ്ങൾ വാങ്ങുക' : 'Purchase subsidized fertilizers directly through government schemes'}
        </p>
      </header>

      <div className="search-section" style={{ marginBottom: 'var(--space-6)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder={isMl ? 'വളങ്ങൾ തിരയുക...' : 'Search fertilizers...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.75rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
          />
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {filteredFertilizers.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100 flex flex-col overflow-hidden">
            <img 
              src={item.imageUrl} 
              alt={item.nameEn} 
              className="w-full h-48 object-cover border-b border-gray-100" 
            />
            <div className="p-5 flex flex-col flex-grow">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span style={{
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  color: 'var(--leaf-green-600)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {item.tag}
                </span>
                {item.stock > 0 ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#10b981', fontSize: '0.875rem', fontWeight: '500' }}>
                    <CheckCircle2 size={16} />
                    {isMl ? 'സ്റ്റോക്ക് ഉണ്ട്' : 'In Stock'}
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#ef4444', fontSize: '0.875rem', fontWeight: '500' }}>
                    <AlertCircle size={16} />
                    {isMl ? 'സ്റ്റോക്ക് ഇല്ല' : 'Out of Stock'}
                  </span>
                )}
              </div>
              
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                {isMl ? item.nameMl : item.nameEn}
              </h3>
              
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                <span style={{ display: 'block', marginBottom: '0.25rem' }}>
                  <strong>{isMl ? 'സ്കീം' : 'Scheme'}:</strong> {isMl ? item.schemeMl : item.schemeEn}
                </span>
                <span style={{ display: 'block' }}>
                  <strong>{isMl ? 'തരം' : 'Type'}:</strong> {item.type}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  ₹{item.price.toFixed(2)}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {isMl ? '/ ബാഗ്' : '/ bag'}
                </span>
              </div>
            </div>

            <div className="px-5 pb-5 mt-auto">
              {item.stock > 0 ? (
                <a
                  href={item.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 mt-4"
                >
                  <ShoppingCart size={18} />
                  {isMl ? 'ഔദ്യോഗിക പോർട്ടലിൽ വാങ്ങുക ↗' : 'Buy on Govt Portal ↗'}
                </a>
              ) : (
                <button
                  disabled
                  className="w-full text-center bg-gray-100 text-gray-500 font-medium py-2.5 rounded-lg cursor-not-allowed flex items-center justify-center gap-2 mt-4 border border-gray-200"
                >
                  <ShoppingCart size={18} />
                  {isMl ? 'ലഭ്യമല്ല' : 'Unavailable'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {filteredFertilizers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          <AlertCircle size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
          <p>{isMl ? 'നിങ്ങൾ തിരയുന്ന വളം കണ്ടെത്താനായില്ല.' : 'No fertilizers found matching your search.'}</p>
        </div>
      )}
    </div>
  );
}
