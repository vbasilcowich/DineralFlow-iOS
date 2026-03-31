import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type AppLanguage = 'en' | 'es';

const STORAGE_KEY = 'dineralflow.language';

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
};

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>('en');

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (!mounted) {
        return;
      }
      if (stored === 'en' || stored === 'es') {
        setLanguageState(stored);
      }
    }

    void hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage: (nextLanguage) => {
      setLanguageState(nextLanguage);
      void AsyncStorage.setItem(STORAGE_KEY, nextLanguage);
    },
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
