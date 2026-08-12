"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type Locale = "en" | "tr";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  pick: (english: string, turkish: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    document.documentElement.lang = next;
  };

  const value = useMemo(
    () => ({ locale, setLocale, pick: (en: string, tr: string) => (locale === "en" ? en : tr) }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used within LocaleProvider");
  return context;
}
