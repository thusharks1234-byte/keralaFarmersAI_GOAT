import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FileText, Search, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

const SCHEMES = [
  {
    id: 1,
    titleEn: 'PM-KISAN Samman Nidhi',
    titleMl: 'പി.എം കിസാൻ സമ്മാൻ നിധി',
    descEn: 'Income support of ₹6,000/- per year in three equal installments to all land holding farmer families.',
    descMl: 'എല്ലാ ഭൂവുടമകളായ കർഷക കുടുംബങ്ങൾക്കും പ്രതിവർഷം 6,000 രൂപ വരുമാന പിന്തുണ.',
    eligibilityEn: 'All landholding farmer families.',
    link: 'https://pmkisan.gov.in/'
  },
  {
    id: 2,
    titleEn: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    titleMl: 'പ്രധാനമന്ത്രി ഫസൽ ബീമാ യോജന',
    descEn: 'Crop insurance scheme providing financial support in the event of failure of any of the notified crop as a result of natural calamities, pests & diseases.',
    descMl: 'പ്രകൃതിദുരന്തങ്ങൾ, കീടങ്ങൾ, രോഗങ്ങൾ എന്നിവ കാരണം വിളനാശം സംഭവിച്ചാൽ സാമ്പത്തിക സഹായം നൽകുന്ന വിള ഇൻഷുറൻസ് പദ്ധതി.',
    eligibilityEn: 'Farmers growing notified crops in notified areas.',
    link: 'https://pmfby.gov.in/'
  },
  {
    id: 3,
    titleEn: 'Sub Mission on Agricultural Mechanization (SMAM)',
    titleMl: 'കാർഷിക യന്ത്രവൽക്കരണ ഉപമിഷൻ (SMAM)',
    descEn: 'Subsidy for purchase of agricultural machinery and equipment.',
    descMl: 'കാർഷിക യന്ത്രങ്ങളും ഉപകരണങ്ങളും വാങ്ങുന്നതിനുള്ള സബ്സിഡി.',
    eligibilityEn: 'All farmers, preference given to small/marginal farmers.',
    link: 'https://agrimachinery.nic.in/'
  },
  {
    id: 4,
    titleEn: 'Kerala State Karshaka Pension',
    titleMl: 'കേരള സംസ്ഥാന കർഷക പെൻഷൻ',
    descEn: 'Monthly pension for elderly farmers in Kerala.',
    descMl: 'കേരളത്തിലെ പ്രായമായ കർഷകർക്ക് പ്രതിമാസ പെൻഷൻ.',
    eligibilityEn: 'Farmers above 60 years of age, residing in Kerala for 10 years, meeting income criteria.',
    link: 'https://welfarepension.lsgkerala.gov.in/'
  },
  {
    id: 5,
    titleEn: 'Subhiksha Keralam',
    titleMl: 'സുഭിക്ഷ കേരളം',
    descEn: 'Comprehensive food security project promoting integrated farming, subsidies for fallow land cultivation, and livestock development.',
    descMl: 'സമഗ്ര ഭക്ഷ്യസുരക്ഷാ പദ്ധതി, തരിശുഭൂമി കൃഷിക്ക് സബ്സിഡി, സംയോജിത കൃഷി പ്രോത്സാഹനം.',
    eligibilityEn: 'Any farmer, youth, or self-help group in Kerala willing to cultivate.',
    link: 'https://keralaagriculture.gov.in/'
  },
  {
    id: 6,
    titleEn: 'Kera Suraksha Insurance Scheme',
    titleMl: 'കേര സുരക്ഷാ ഇൻഷുറൻസ് പദ്ധതി',
    descEn: 'Insurance coverage for coconut tree climbers against accidents.',
    descMl: 'തെങ്ങുകയറ്റത്തൊഴിലാളികൾക്ക് അപകട ഇൻഷുറൻസ് പരിരക്ഷ.',
    eligibilityEn: 'Traditional and trained coconut tree climbers.',
    link: 'https://coconutboard.gov.in/'
  },
  {
    id: 7,
    titleEn: 'Vegetable Cultivation Subsidy (SHM)',
    titleMl: 'പച്ചക്കറി കൃഷി സബ്സിഡി (SHM)',
    descEn: 'Financial assistance for hybrid vegetable cultivation, grow bags, and pump sets.',
    descMl: 'പച്ചക്കറി കൃഷിക്കും പമ്പ് സെറ്റുകൾക്കും ഗ്രോ ബാഗുകൾക്കും സാമ്പത്തിക സഹായം.',
    eligibilityEn: 'Farmers engaging in commercial vegetable cultivation.',
    link: 'https://shmkerala.gov.in/'
  },
  {
    id: 8,
    titleEn: 'State Crop Insurance Scheme',
    titleMl: 'സംസ്ഥാന വിള ഇൻഷുറൻസ് പദ്ധതി',
    descEn: 'Insurance for major cash crops in Kerala like Rubber, Coconut, Arecanut, and Pepper against natural calamities.',
    descMl: 'റബ്ബർ, തെങ്ങ്, കുരുമുളക് തുടങ്ങിയ പ്രധാന നാണ്യവിളകൾക്ക് പ്രകൃതിദുരന്തങ്ങൾക്കെതിരെ ഇൻഷുറൻസ്.',
    eligibilityEn: 'Farmers cultivating notified crops in Kerala.',
    link: 'https://www.aims.kerala.gov.in/'
  },
  {
    id: 9,
    titleEn: 'Kisan Credit Card (KCC)',
    titleMl: 'കിസാൻ ക്രെഡിറ്റ് കാർഡ് (KCC)',
    descEn: 'Adequate and timely credit support from the banking system for agricultural needs.',
    descMl: 'കാർഷിക ആവശ്യങ്ങൾക്ക് ബാങ്കുകളിൽ നിന്ന് സമയബന്ധിതമായി വായ്പ ലഭ്യമാക്കുന്ന പദ്ധതി.',
    eligibilityEn: 'All farmers, tenant farmers, and sharecroppers.',
    link: 'https://www.myscheme.gov.in/schemes/kcc'
  },
  {
    id: 10,
    titleEn: 'Agricultural Information Management System (AIMS)',
    titleMl: 'കാർഷിക വിവര മാനേജ്മെന്റ് സിസ്റ്റം (AIMS)',
    descEn: 'A unified portal for farmers to apply for various services, subsidies, crop loss relief, and royalties in Kerala.',
    descMl: 'കേരളത്തിലെ കർഷകർക്ക് വിവിധ സേവനങ്ങൾ, സബ്സിഡികൾ, വിളനാശ ആശ്വാസം എന്നിവയ്ക്കായി അപേക്ഷിക്കാനുള്ള ഏകീകൃത പോർട്ടൽ.',
    eligibilityEn: 'All farmers in Kerala registered with a valid Farmer ID.',
    link: 'https://www.aims.kerala.gov.in/'
  },
  {
    id: 11,
    titleEn: 'KERA Scheme (Climate Resilient Agri-Value Chain Modernization)',
    titleMl: 'കേര പദ്ധതി (KERA)',
    descEn: 'World Bank-supported project focusing on modernizing agriculture value chains and building climate resilience.',
    descMl: 'കാർഷിക മൂല്യശൃംഖലകൾ ആധുനികവൽക്കരിക്കുന്നതിനും കാലാവസ്ഥാ പ്രതിരോധം കെട്ടിപ്പടുക്കുന്നതിനുമുള്ള ലോകബാങ്ക് പിന്തുണയുള്ള പദ്ധതി.',
    eligibilityEn: 'Farmers involved in specific crop value chains like rubber, coffee, cardamom, etc.',
    link: 'https://kera.kerala.gov.in/'
  },
  {
    id: 12,
    titleEn: 'Kerala Farmer Registry (Agri Stack)',
    titleMl: 'കേരള കർഷക രജിസ്ട്രി (Agri Stack)',
    descEn: 'One-time registration for farmers to get a unique Farmer ID to seamlessly access government benefits.',
    descMl: 'സർക്കാർ ആനുകൂല്യങ്ങൾ തടസ്സമില്ലാതെ ലഭിക്കുന്നതിന് കർഷകർക്ക് ഒരു യുണീക്ക് കർഷക ഐഡി ലഭിക്കുന്നതിനുള്ള ഒറ്റത്തവണ രജിസ്ട്രേഷൻ.',
    eligibilityEn: 'Any farmer residing in Kerala.',
    link: 'https://farmer.kerala.gov.in/'
  },
  {
    id: 13,
    titleEn: 'Kissan Kerala / Krishi Vivara Sanketham',
    titleMl: 'കിസാൻ കേരള',
    descEn: 'Comprehensive online agricultural information and advisory service for Kerala farmers.',
    descMl: 'കേരളത്തിലെ കർഷകർക്കുള്ള സമഗ്ര ഓൺലൈൻ കാർഷിക വിവര-ഉപദേശക സേവനം.',
    eligibilityEn: 'Open to all farmers and public.',
    link: 'http://www.kissankerala.net/'
  }
];

export default function GovtSchemes() {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = SCHEMES.filter(s => {
    const q = search.toLowerCase();
    return s.titleEn.toLowerCase().includes(q) || s.titleMl.includes(q) || s.descEn.toLowerCase().includes(q);
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="section-header">
        <h1 className="section-title">🏛️ {t.nav.govtSchemes}</h1>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder={language === 'en' ? "Search schemes..." : "പദ്ധതികൾ തിരയുക..."}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filtered.map(scheme => {
          const isExpanded = expanded === scheme.id;
          const title = language === 'en' ? scheme.titleEn : scheme.titleMl;
          const desc = language === 'en' ? scheme.descEn : scheme.descMl;

          return (
            <div key={scheme.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <button
                style={{
                  width: '100%', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                }}
                onClick={() => setExpanded(isExpanded ? null : scheme.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--light-green-100)', color: 'var(--agri-green-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
                  </div>
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </button>
              
              {isExpanded && (
                <div style={{ padding: '0 20px 20px 76px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                    {desc}
                  </p>
                  
                  <div style={{ background: 'var(--cream-50)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Eligibility
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{scheme.eligibilityEn}</p>
                  </div>

                  <a href={scheme.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    Apply / Learn More <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="empty-state">
            <p>No schemes found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
