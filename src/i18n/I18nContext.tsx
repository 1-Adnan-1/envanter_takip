import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { translations, type Lang } from "./translations";

type Dict = typeof translations.en;
type Theme = "light" | "dark";

function getDict(lang: Lang): Dict {
  return translations[lang] as unknown as Dict;
}

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  t: Dict;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("inv-lang")
        : null;
    return saved === "tr" || saved === "en" ? saved : "tr";
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    const saved =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("inv-theme")
        : null;
    return saved === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = theme;
    }
  }, [theme]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("inv-lang", l);
    } catch {
      /* ignore */
    }
  }, []);

  const setTheme = useCallback((theme: Theme) => {
    setThemeState(theme);
    try {
      localStorage.setItem("inv-theme", theme);
    } catch {
      /* ignore */
    }
  }, []);

  const value: I18nContextValue = {
    lang,
    setLang,
    theme,
    setTheme,
    t: getDict(lang),
  };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
