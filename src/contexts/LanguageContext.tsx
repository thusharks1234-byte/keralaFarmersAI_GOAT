import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { en } from '../i18n/en';
import { ml } from '../i18n/ml';
import { hi } from '../i18n/hi'; // Hindi translations
import type { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof en;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('km_language') as Language) || 'en';
  });

  const t = language === 'ml' ? ml : language === 'hi' ? hi : en;

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('km_language', lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
