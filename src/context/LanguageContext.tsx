import { createContext, useContext, useEffect, useState } from "react";
import { translate, type Locale } from "../i18n/translations";

type LanguageContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string, vars?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

function readStoredLocale(): Locale {
  return localStorage.getItem("app_locale") === "de" ? "de" : "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(readStoredLocale);

  useEffect(() => {
    localStorage.setItem("app_locale", locale);
  }, [locale]);

  function t(path: string, vars?: Record<string, string | number>) {
    return translate(locale, path, vars);
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
