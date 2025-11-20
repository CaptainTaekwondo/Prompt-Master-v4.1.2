
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';
type Language = 'en' | 'ar' | 'fr';

const LANGUAGE_KEY = 'promptMasterLanguage';
const THEME_KEY = 'promptMasterTheme';

export function useUserSettings() {
  const [language, setLanguage] = useState<Language>(() => {
    const storedLang = localStorage.getItem(LANGUAGE_KEY);
    // Validate the stored language to prevent invalid values that could cause a crash.
    if (storedLang === 'en' || storedLang === 'ar' || storedLang === 'fr') {
      return storedLang;
    }
    // Default to 'ar' if the stored value is invalid or missing.
    return 'ar';
  });

  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem(THEME_KEY);
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : language === 'ar' ? 'fr' : 'en';
    setLanguage(newLang);
  };

  return { language, setLanguage, theme, setTheme, toggleLanguage };
}
